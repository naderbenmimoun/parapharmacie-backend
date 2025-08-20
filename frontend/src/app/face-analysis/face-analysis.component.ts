import { Component, ViewChild, ElementRef, signal, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as faceapi from 'face-api.js';
import { RecommendationService, ProductRecommendation } from '../services/recommendation.service';
import { CartService } from '../services/cart.service';
import { DeepseekAiService, FaceAnalysisData, AIAnalysisResult } from '../services/deepseek-ai.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-face-analysis',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './face-analysis.component.html',
  styleUrl: './face-analysis.component.css'
})
export class FaceAnalysisComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  // Signals pour l'état réactif
  currentStep = signal<'permission' | 'camera' | 'captured' | 'analyzing' | 'ai-analyzing' | 'results'>('permission');
  cameraReady = signal(false);
  errorMessage = signal<string | null>(null);
  modelsLoaded = signal(false);
  faceDetected = signal(false);
  analysisResults = signal<any>(null);
  aiAnalysisResults = signal<AIAnalysisResult | null>(null);
  productRecommendations = signal<ProductRecommendation[]>([]);
  personalizedTips = signal<string[]>([]);

  private stream: MediaStream | null = null;
  private capturedImageData: string | null = null;
  private detectionInterval: any;
  private destroy$ = new Subject<void>();
  private recommendationService = inject(RecommendationService);
  private cartService = inject(CartService);
  private deepseekAI = inject(DeepseekAiService);

  async ngOnInit() {
    // Charger les modèles face-api.js au démarrage
    await this.loadModels();
    
    // Test de connexion DeepSeek AI
    console.log('🔗 Test de connexion DeepSeek...');
    const connectionOk = await this.deepseekAI.testConnection();
    console.log('🤖 DeepSeek connecté:', connectionOk ? '✅' : '❌');
  }

  async loadModels() {
    try {
      console.log('🧠 Chargement des modèles IA...');
      
      // Charger les modèles depuis CDN (plus fiable)
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
      
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      
      this.modelsLoaded.set(true);
      console.log('✅ Modèles IA chargés avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur chargement modèles:', error);
      this.errorMessage.set('Erreur de chargement des modèles IA');
    }
  }

  async startCamera() {
    try {
      this.errorMessage.set(null);
      
      if (!this.modelsLoaded()) {
        this.errorMessage.set('Les modèles IA sont en cours de chargement...');
        return;
      }

      // Demander l'accès à la caméra
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      // Attendre que la vue soit mise à jour
      setTimeout(() => {
        if (this.videoElement) {
          this.videoElement.nativeElement.srcObject = this.stream;
          this.videoElement.nativeElement.onloadedmetadata = () => {
            this.cameraReady.set(true);
            this.startFaceDetection();
          };
        }
      }, 100);

      this.currentStep.set('camera');
      
    } catch (error) {
      console.error('Erreur accès caméra:', error);
      this.errorMessage.set('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  }

  startFaceDetection() {
    if (!this.videoElement || !this.modelsLoaded()) return;

    const video = this.videoElement.nativeElement;
    
    // Vérifier la détection toutes les 500ms
    this.detectionInterval = setInterval(async () => {
      try {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        if (detections.length > 0) {
          this.faceDetected.set(true);
          console.log('👤 Visage détecté !', detections[0]);
        } else {
          this.faceDetected.set(false);
        }
      } catch (error) {
        console.error('Erreur détection:', error);
      }
    }, 500);
  }

  stopFaceDetection() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
  }

  async capturePhoto() {
    if (!this.videoElement || !this.cameraReady()) return;

    const video = this.videoElement.nativeElement;
    
    // Créer un canvas temporaire pour la capture
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Définir la taille du canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dessiner l'image de la vidéo sur le canvas (avec effet miroir)
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);

    // Sauvegarder l'image
    this.capturedImageData = canvas.toDataURL('image/jpeg', 0.8);

    // Arrêter la caméra et la détection
    this.stopCamera();
    this.stopFaceDetection();

    // Passer à l'étape suivante
    this.currentStep.set('captured');
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.cameraReady.set(false);
    this.faceDetected.set(false);
    this.stopFaceDetection();
  }

  getCapturedImage(): string {
    return this.capturedImageData || '';
  }

  retakePhoto() {
    this.capturedImageData = null;
    this.startCamera();
  }

  // 🎯 MÉTHODE AMÉLIORÉE : Analyse complète de la photo
  async analyzePhoto() {
    if (!this.capturedImageData) return;

    this.currentStep.set('analyzing');

    try {
      // Créer une image à partir des données capturées
      const img = new Image();
      img.src = this.capturedImageData;

      await new Promise(resolve => {
        img.onload = resolve;
      });

      // Analyser l'image avec face-api.js
      const detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (detections.length === 0) {
        this.errorMessage.set('Aucun visage détecté dans l\'image. Veuillez reprendre la photo.');
        this.currentStep.set('captured');
        return;
      }

      // Analyser les caractéristiques du visage
      const detection = detections[0];
      const landmarks = detection.landmarks;
      
      // Calculer des métriques basiques
      const faceBox = detection.detection.box;
      const faceWidth = faceBox.width;
      const faceHeight = faceBox.height;
      
      console.log('📐 Dimensions visage:', { faceWidth, faceHeight, ratio: faceHeight/faceWidth });
      
      // Analyser la forme du visage
      const jawLine = landmarks.getJawOutline();
      const nose = landmarks.getNose();
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const mouth = landmarks.getMouth();
      
      // 🎯 NOUVELLE APPROCHE : Analyse basée sur les vraies coordonnées + timestamp
      const analysisData = this.analyzeDetailedFeatures(landmarks, faceBox, Date.now());
      
      console.log('🔍 Données d\'analyse détaillées:', analysisData);
      console.log('⏰ Timestamp d\'analyse:', Date.now());

      const results = {
        faceDetected: true,
        confidence: detection.detection.score,
        estimatedAge: analysisData.age,
        skinType: analysisData.skinType,
        faceShape: analysisData.faceShape,
        recommendations: this.generateRecommendations(analysisData.age, analysisData.skinType),
        debugInfo: analysisData
      };

      this.analysisResults.set(results);
      console.log('🎯 Résultats d\'analyse:', results);

      // 🤖 NOUVEAU : Analyse avec DeepSeek AI
      console.log('🤖 Démarrage analyse IA avancée...');
      this.currentStep.set('ai-analyzing');

      // Préparer les données pour l'IA
      const faceData: FaceAnalysisData = {
        faceWidth,
        faceHeight,
        eyeDistance: Math.abs(rightEye[0].x - leftEye[3].x),
        mouthWidth: Math.abs(mouth[6].x - mouth[0].x),
        noseHeight: Math.abs(nose[6].y - nose[0].y),
        jawWidth: Math.abs(jawLine[16].x - jawLine[0].x),
        noseToEyeRatio: Math.abs(nose[0].y - ((leftEye[1].y + leftEye[2].y) / 2)) / faceHeight,
        faceRatio: faceHeight / faceWidth,
        jawRatio: Math.abs(jawLine[16].x - jawLine[0].x) / faceWidth,
        confidence: detection.detection.score
      };

      try {
        // Analyser avec DeepSeek AI
        const aiResults = await this.deepseekAI.analyzeWithAI(faceData);
        this.aiAnalysisResults.set(aiResults);
        
        console.log('🤖 Analyse IA terminée:', aiResults);

        // 🛒 Obtenir les vraies recommandations produits basées sur l'IA
        const recommendations = await this.recommendationService.getRecommendations({
          estimatedAge: aiResults.estimatedAge,
          skinType: aiResults.skinType,
          faceShape: aiResults.faceShape,
          confidence: aiResults.confidence
        });
        this.productRecommendations.set(recommendations);
        
        // 💡 Utiliser les conseils de l'IA
        this.personalizedTips.set(aiResults.beautyTips);

        console.log('🛍️ Recommandations produits IA:', recommendations);

      } catch (error) {
        console.error('❌ Erreur analyse IA:', error);
        // Fallback sur l'analyse classique
        const recommendations = await this.recommendationService.getRecommendations(results);
        this.productRecommendations.set(recommendations);
        
        const tips = this.recommendationService.getPersonalizedTips(results);
        this.personalizedTips.set(tips);
      }

      // Transition vers les résultats
      setTimeout(() => {
        this.currentStep.set('results');
      }, 3000);

    } catch (error) {
      console.error('❌ Erreur analyse:', error);
      this.errorMessage.set('Erreur lors de l\'analyse. Veuillez réessayer.');
      this.currentStep.set('captured');
    }
  }

  // 🎯 NOUVELLE MÉTHODE : Analyse détaillée avec variation
  private analyzeDetailedFeatures(landmarks: any, faceBox: any, timestamp?: number) {
    try {
      // Récupérer les points clés
      const jawLine = landmarks.getJawOutline();
      const nose = landmarks.getNose();
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const mouth = landmarks.getMouth();

      // Calculer des métriques uniques pour chaque visage
      const eyeCenter1 = { x: (leftEye[0].x + leftEye[3].x) / 2, y: (leftEye[1].y + leftEye[2].y) / 2 };
      const eyeCenter2 = { x: (rightEye[0].x + rightEye[3].x) / 2, y: (rightEye[1].y + rightEye[2].y) / 2 };
      
      // Distance entre les yeux
      const eyeDistance = Math.sqrt(
        Math.pow(eyeCenter2.x - eyeCenter1.x, 2) + Math.pow(eyeCenter2.y - eyeCenter1.y, 2)
      );
      
      // Largeur de la bouche
      const mouthWidth = Math.abs(mouth[6].x - mouth[0].x);
      
      // Hauteur du nez
      const noseHeight = Math.abs(nose[6].y - nose[0].y);
      
      // Largeur de la mâchoire
      const jawWidth = Math.abs(jawLine[16].x - jawLine[0].x);
      
      // Position du nez par rapport aux yeux
      const noseToEyeRatio = Math.abs(nose[0].y - eyeCenter1.y) / faceBox.height;
      
      // Ratio visage
      const faceRatio = faceBox.height / faceBox.width;
      
      console.log('📊 Métriques faciales:', {
        eyeDistance,
        mouthWidth,
        noseHeight,
        jawWidth,
        noseToEyeRatio,
        faceRatio
      });

      // Créer un "hash" unique du visage pour la cohérence + variation temporelle
      const baseHash = Math.floor((eyeDistance + mouthWidth + noseHeight + jawWidth) * 1000) % 1000;
      const timeVariation = timestamp ? (timestamp % 100) : 0;
      const faceHash = (baseHash + timeVariation) % 1000;
      
      console.log('🔑 Hash du visage:', faceHash, '(base:', baseHash, '+ time:', timeVariation, ')');

      // Estimation d'âge basée sur plusieurs facteurs (ÉQUILIBRÉ)
      let ageScore = 0;
      
      // Plus la distance œil-nez est grande, plus âgé (MODÉRÉ)
      if (noseToEyeRatio > 0.35) ageScore += 25;
      else if (noseToEyeRatio > 0.25) ageScore += 15;
      else if (noseToEyeRatio > 0.15) ageScore += 10;
      else ageScore += 5;
      
      // Mâchoire : plus affaissée = plus âgé (MODÉRÉ)
      const jawRatio = jawWidth / faceBox.width;
      if (jawRatio > 0.85) ageScore += 5;
      else if (jawRatio > 0.75) ageScore += 10;
      else if (jawRatio > 0.65) ageScore += 15;
      else ageScore += 20;
      
      // Ratio du visage (RÉDUIT)
      if (faceRatio > 1.4) ageScore += 10;
      else if (faceRatio < 1.0) ageScore += 15;
      else ageScore += 5;

      // Facteur de "complexité" faciale (RÉDUIT)
      const complexityFactor = (eyeDistance + mouthWidth + noseHeight) / 3;
      if (complexityFactor > 75) ageScore += 10;
      else if (complexityFactor > 65) ageScore += 5;
      else ageScore += 0;

      // Ajustement basé sur le hash (RÉDUIT)
      const ageVariation = (faceHash % 20) - 10;
      ageScore += ageVariation;

      console.log('👴 Calcul d\'âge détaillé:', {
        noseToEyeRatio,
        jawRatio,
        faceRatio,
        complexityFactor,
        ageVariation,
        ageScore
      });

      // Déterminer l'âge avec des seuils ÉQUILIBRÉS
      let estimatedAge;
      if (ageScore < 20) estimatedAge = "18-25 ans";
      else if (ageScore < 35) estimatedAge = "25-35 ans";
      else if (ageScore < 50) estimatedAge = "35-50 ans";
      else if (ageScore < 65) estimatedAge = "50-65 ans";
      else estimatedAge = "65+ ans";

      // Type de peau basé sur les caractéristiques
      let skinType;
      const skinFactor = (eyeDistance + mouthWidth) % 6;
      const skinTypes = [
        "Peau claire et sensible",
        "Peau normale équilibrée", 
        "Peau mate naturelle",
        "Peau mixte",
        "Peau claire à tendance sèche",
        "Peau foncée riche"
      ];
      skinType = skinTypes[Math.floor(skinFactor)];

      // Forme du visage
      let faceShape;
      if (faceRatio > 1.5) faceShape = "Ovale allongé";
      else if (faceRatio > 1.3 && jawRatio > 0.75) faceShape = "Rectangle";
      else if (faceRatio < 1.1) faceShape = "Rond";
      else if (jawRatio > 0.85) faceShape = "Carré";
      else if (jawRatio < 0.65) faceShape = "Triangle inversé";
      else faceShape = "Ovale classique";

      return {
        age: estimatedAge,
        skinType: skinType,
        faceShape: faceShape,
        ageScore,
        faceHash,
        metrics: {
          eyeDistance,
          mouthWidth,
          noseHeight,
          jawWidth,
          noseToEyeRatio,
          faceRatio,
          jawRatio
        }
      };

    } catch (error) {
      console.error('❌ Erreur analyse détaillée:', error);
      return {
        age: "25-35 ans",
        skinType: "Peau normale",
        faceShape: "Ovale",
        ageScore: 35,
        faceHash: 0,
        metrics: {}
      };
    }
  }

  private generateRecommendations(age: string, skinType: string): string[] {
    const recommendations = [];

    console.log('💡 Génération recommandations pour:', { age, skinType });

    // Recommandations basées sur l'âge avec plus de variété
    if (age.includes("18-25")) {
      const youngSkinOptions = [
        ["Gel nettoyant purifiant", "Crème hydratante légère", "Protection solaire SPF 50"],
        ["Mousse nettoyante douce", "Sérum hydratant", "Écran solaire quotidien"],
        ["Nettoyant sans savon", "Hydratant matifiant", "Protection UV invisible"]
      ];
      const selectedYoung = youngSkinOptions[Math.floor(Math.random() * youngSkinOptions.length)];
      recommendations.push(...selectedYoung);
      
    } else if (age.includes("25-35")) {
      const preventiveOptions = [
        ["Sérum vitamine C", "Crème anti-âge préventive", "Contour yeux hydratant"],
        ["Antioxydant quotidien", "Hydratant raffermissant", "Soin contour des yeux"],
        ["Sérum éclat", "Crème jour anti-âge", "Gel contour yeux"]
      ];
      const selectedPreventive = preventiveOptions[Math.floor(Math.random() * preventiveOptions.length)];
      recommendations.push(...selectedPreventive);
      
    } else if (age.includes("35-50")) {
      const antiAgingOptions = [
        ["Sérum anti-rides intensif", "Crème nuit régénérante", "Soin yeux anti-âge"],
        ["Traitement anti-rides", "Crème raffermissante", "Contour yeux liftant"],
        ["Sérum peptides", "Soin nuit réparateur", "Crème yeux anti-poches"]
      ];
      const selectedAntiAging = antiAgingOptions[Math.floor(Math.random() * antiAgingOptions.length)];
      recommendations.push(...selectedAntiAging);
      
    } else {
      const matureOptions = [
        ["Crème anti-âge premium", "Sérum raffermissant", "Masque régénérant"],
        ["Soin anti-rides global", "Crème restructurante", "Traitement intensif"],
        ["Crème haute performance", "Sérum lift", "Soin réparateur"]
      ];
      const selectedMature = matureOptions[Math.floor(Math.random() * matureOptions.length)];
      recommendations.push(...selectedMature);
    }

    return recommendations.slice(0, 4);
  }

  resetAnalysis() {
    this.currentStep.set('permission');
    this.capturedImageData = null;
    this.errorMessage.set(null);
    this.analysisResults.set(null);
    this.aiAnalysisResults.set(null);
    this.productRecommendations.set([]);
    this.personalizedTips.set([]);
    this.faceDetected.set(false);
    this.stopCamera();
  }

  // 🛒 NOUVELLE MÉTHODE : Ajouter un produit au panier
  addToCart(recommendation: ProductRecommendation) {
    this.cartService.addToCart(recommendation.product, recommendation.product.defaultSize, 1);
    console.log('✅ Produit ajouté au panier:', recommendation.product.title);
  }

  ngOnDestroy() {
    this.stopCamera();
    this.stopFaceDetection();
    this.destroy$.next();
    this.destroy$.complete();
  }
}