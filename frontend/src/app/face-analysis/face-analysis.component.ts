import { Component, ViewChild, ElementRef, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as faceapi from 'face-api.js';
import { RecommendationService, ProductRecommendation } from '../services/recommendation.service';
import { CartService } from '../services/cart.service';
import { DeepseekAiService, FaceAnalysisData, AIAnalysisResult } from '../services/deepseek-ai.service';

@Component({
  selector: 'app-face-analysis',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './face-analysis.component.html',
  styleUrl: './face-analysis.component.css'
})
export class FaceAnalysisComponent implements OnInit {
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
            this.startFaceDetection(); // 🎯 Nouveau : démarrer la détection
          };
        }
      }, 100);

      this.currentStep.set('camera');
      
    } catch (error) {
      console.error('Erreur accès caméra:', error);
      this.errorMessage.set('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  }

  // 🎯 NOUVELLE MÉTHODE : Détection de visage en temps réel
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
      const mouth = landmarks.getMouth(); // ✅ AJOUT DE CETTE LIGNE
      
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
        debugInfo: analysisData // Pour voir les calculs
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
      }, 3000); // Plus de temps pour l'IA

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
      
      // Distance entre les yeux (unique pour chaque personne)
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
      if (jawRatio > 0.85) ageScore += 5; // Mâchoire forte = jeune
      else if (jawRatio > 0.75) ageScore += 10;
      else if (jawRatio > 0.65) ageScore += 15;
      else ageScore += 20; // Mâchoire affaissée = âgé
      
      // Ratio du visage (RÉDUIT)
      if (faceRatio > 1.4) ageScore += 10;
      else if (faceRatio < 1.0) ageScore += 15;
      else ageScore += 5;

      // Facteur de "complexité" faciale (RÉDUIT)
      const complexityFactor = (eyeDistance + mouthWidth + noseHeight) / 3;
      if (complexityFactor > 75) ageScore += 10; // Seuil plus élevé
      else if (complexityFactor > 65) ageScore += 5;
      else ageScore += 0;

      // Ajustement basé sur le hash (RÉDUIT)
      const ageVariation = (faceHash % 20) - 10; // Variation entre -10 et +10
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
      // Retour par défaut
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

  private estimateAge(faceWidth: number, faceHeight: number, landmarks: any): string {
    try {
      // Points de repère plus précis pour l'estimation d'âge
      const jawLine = landmarks.getJawOutline();
      const nose = landmarks.getNose();
      const mouth = landmarks.getMouth();
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();

      // 1. Analyse de la largeur de la mâchoire (s'affine avec l'âge)
      const jawWidth = Math.abs(jawLine[16].x - jawLine[0].x);
      const jawRatio = jawWidth / faceWidth;

      // 2. Distance entre les yeux (reste stable)
      const eyeDistance = Math.abs(rightEye[0].x - leftEye[3].x);
      const eyeToFaceRatio = eyeDistance / faceWidth;

      // 3. Hauteur du nez par rapport au visage
      const noseHeight = Math.abs(nose[6].y - nose[0].y);
      const noseRatio = noseHeight / faceHeight;

      // 4. Largeur de la bouche
      const mouthWidth = Math.abs(mouth[6].x - mouth[0].x);
      const mouthRatio = mouthWidth / faceWidth;

      // Score composite pour l'âge
      let ageScore = 0;
      
      // Jeune : mâchoire plus carrée, proportions différentes
      if (jawRatio > 0.8) ageScore += 15;
      if (eyeToFaceRatio > 0.3) ageScore += 10;
      if (noseRatio < 0.2) ageScore += 15;
      if (mouthRatio > 0.15) ageScore += 10;

      // Calcul basé sur les ratios du visage
      const faceRatio = faceHeight / faceWidth;
      if (faceRatio > 1.4) ageScore += 20;
      else if (faceRatio < 1.1) ageScore += 30;

      console.log('🔍 Scores d\'âge:', { jawRatio, eyeToFaceRatio, noseRatio, mouthRatio, ageScore });

      if (ageScore < 25) return "18-25 ans";
      else if (ageScore < 40) return "25-35 ans";
      else if (ageScore < 55) return "35-45 ans";
      else return "45+ ans";

    } catch (error) {
      console.error('Erreur estimation âge:', error);
      return "25-35 ans"; // Valeur par défaut
    }
  }

  private async analyzeSkinType(img: HTMLImageElement, faceBox: any): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return "Peau normale";

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Analyser plusieurs zones du visage
      const zones = [
        { name: 'front', x: faceBox.x + faceBox.width * 0.5, y: faceBox.y + faceBox.height * 0.3 },
        { name: 'joue_gauche', x: faceBox.x + faceBox.width * 0.3, y: faceBox.y + faceBox.height * 0.6 },
        { name: 'joue_droite', x: faceBox.x + faceBox.width * 0.7, y: faceBox.y + faceBox.height * 0.6 },
        { name: 'nez', x: faceBox.x + faceBox.width * 0.5, y: faceBox.y + faceBox.height * 0.55 }
      ];

      let totalBrightness = 0;
      let totalRedness = 0;
      let totalUniformity = 0;
      
      zones.forEach(zone => {
        const sampleSize = 15;
        const imageData = ctx.getImageData(
          zone.x - sampleSize/2, 
          zone.y - sampleSize/2, 
          sampleSize, 
          sampleSize
        );

        let zoneBrightness = 0;
        let zoneRedness = 0;
        let rValues: number[] = [];

        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          
          zoneBrightness += (r + g + b) / 3;
          zoneRedness += r - ((g + b) / 2); // Indice de rougeur
          rValues.push(r);
        }

        const pixelCount = imageData.data.length / 4;
        zoneBrightness /= pixelCount;
        zoneRedness /= pixelCount;

        // Calculer l'uniformité (écart-type)
        const avgR = rValues.reduce((a, b) => a + b, 0) / rValues.length;
        const variance = rValues.reduce((sum, val) => sum + Math.pow(val - avgR, 2), 0) / rValues.length;
        const uniformity = Math.sqrt(variance);

        totalBrightness += zoneBrightness;
        totalRedness += zoneRedness;
        totalUniformity += uniformity;
      });

      const avgBrightness = totalBrightness / zones.length;
      const avgRedness = totalRedness / zones.length;
      const avgUniformity = totalUniformity / zones.length;

      console.log('🎨 Analyse peau:', { avgBrightness, avgRedness, avgUniformity });

      // Classification intelligente
      if (avgBrightness > 200 && avgUniformity < 15) {
        return "Peau claire et uniforme";
      } else if (avgBrightness > 180 && avgRedness > 10) {
        return "Peau claire sensible";
      } else if (avgBrightness > 150 && avgUniformity < 20) {
        return "Peau normale";
      } else if (avgBrightness > 120 && avgRedness < 5) {
        return "Peau mate";
      } else if (avgBrightness < 100) {
        return "Peau foncée";
      } else {
        return "Peau mixte";
      }

    } catch (error) {
      console.error('Erreur analyse peau:', error);
      return "Peau normale";
    }
  }

  private analyzeFaceShape(jawLine: any, width: number, height: number): string {
    try {
      // Analyse plus précise de la forme du visage
      const ratio = height / width;
      
      // Largeur de la mâchoire vs largeur maximale
      const jawWidth = Math.abs(jawLine[16].x - jawLine[0].x);
      const maxWidth = width;
      const jawRatio = jawWidth / maxWidth;

      // Points du haut du visage (tempes)
      const templeWidth = Math.abs(jawLine[2].x - jawLine[14].x);
      const templeRatio = templeWidth / maxWidth;

      console.log('👤 Forme visage:', { ratio, jawRatio, templeRatio });

      if (ratio > 1.5 && jawRatio < 0.7) {
        return "Ovale allongé";
      } else if (ratio > 1.3 && jawRatio > 0.8) {
        return "Rectangle";
      } else if (ratio < 1.1 && jawRatio > 0.9) {
        return "Carré";
      } else if (ratio < 1.2 && jawRatio < 0.75) {
        return "Rond";
      } else if (templeRatio > jawRatio + 0.1) {
        return "Triangle inversé";
      } else {
        return "Ovale";
      }

    } catch (error) {
      console.error('Erreur forme visage:', error);
      return "Ovale";
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
      
    } else if (age.includes("35-45")) {
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

    // Recommandations basées sur le type de peau
    if (skinType.includes("claire")) {
      const clearSkinBonus = ["Crème apaisante", "Protection solaire renforcée"];
      recommendations.push(clearSkinBonus[Math.floor(Math.random() * clearSkinBonus.length)]);
      
    } else if (skinType.includes("sensible")) {
      const sensitiveBonus = ["Soin hypoallergénique", "Crème sans parfum"];
      recommendations.push(sensitiveBonus[Math.floor(Math.random() * sensitiveBonus.length)]);
      
    } else if (skinType.includes("mate") || skinType.includes("foncée")) {
      const darkSkinBonus = ["Hydratant nutritif", "Sérum éclat unifiant"];
      recommendations.push(darkSkinBonus[Math.floor(Math.random() * darkSkinBonus.length)]);
      
    } else if (skinType.includes("mixte")) {
      const mixedSkinBonus = ["Gel équilibrant", "Hydratant matifiant"];
      recommendations.push(mixedSkinBonus[Math.floor(Math.random() * mixedSkinBonus.length)]);
      
    } else {
      const normalSkinBonus = ["Crème hydratante", "Soin quotidien"];
      recommendations.push(normalSkinBonus[Math.floor(Math.random() * normalSkinBonus.length)]);
    }

    return recommendations.slice(0, 4); // Limiter à 4 recommandations
  }

  resetAnalysis() {
    this.currentStep.set('permission');
    this.capturedImageData = null;
    this.errorMessage.set(null);
    this.analysisResults.set(null);
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
  }
}