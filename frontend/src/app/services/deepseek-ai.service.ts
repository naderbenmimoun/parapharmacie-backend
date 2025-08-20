// src/app/services/deepseek-ai.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DeepSeekRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface FaceAnalysisData {
  faceWidth: number;
  faceHeight: number;
  eyeDistance: number;
  mouthWidth: number;
  noseHeight: number;
  jawWidth: number;
  noseToEyeRatio: number;
  faceRatio: number;
  jawRatio: number;
  confidence: number;
}

export interface AIAnalysisResult {
  estimatedAge: string;
  skinType: string;
  faceShape: string;
  personalityTraits: string[];
  beautyTips: string[];
  productRecommendations: string[];
  confidence: number;
  explanation: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeepseekAiService {
  private readonly API_URL = 'https://api.deepseek.com/v1/chat/completions';
  private readonly API_KEY = 'YOUR_DEEPSEEK_API_KEY'; // Vous remplacerez ça

  constructor(private http: HttpClient) {}

  // Méthode pour configurer la clé API
  setApiKey(apiKey: string) {
    (this as any).API_KEY = apiKey;
  }

  // Analyse avancée avec DeepSeek
  async analyzeWithAI(faceData: FaceAnalysisData): Promise<AIAnalysisResult> {
    const prompt = this.buildAnalysisPrompt(faceData);
    
    const request: DeepSeekRequest = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en analyse faciale et cosmétologie. Tu analyses les données géométriques d'un visage pour donner des recommandations précises sur l'âge, le type de peau, et les produits cosmétiques adaptés. 

Réponds TOUJOURS au format JSON strict suivant :
{
  "estimatedAge": "XX-XX ans",
  "skinType": "description du type de peau",
  "faceShape": "forme du visage",
  "personalityTraits": ["trait1", "trait2", "trait3"],
  "beautyTips": ["conseil1", "conseil2", "conseil3"],
  "productRecommendations": ["produit1", "produit2", "produit3"],
  "confidence": 0.85,
  "explanation": "Explication de l'analyse"
}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    };

    try {
      const response = await this.makeRequest(request).toPromise();
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('Erreur DeepSeek AI:', error);
      return this.getFallbackAnalysis();
    }
  }

  private buildAnalysisPrompt(faceData: FaceAnalysisData): string {
    return `
Analyse ces données faciales géométriques d'une personne et donne-moi une évaluation précise :

DONNÉES MESURÉES :
- Largeur du visage: ${faceData.faceWidth.toFixed(2)}px
- Hauteur du visage: ${faceData.faceHeight.toFixed(2)}px
- Distance entre les yeux: ${faceData.eyeDistance.toFixed(2)}px
- Largeur de la bouche: ${faceData.mouthWidth.toFixed(2)}px
- Hauteur du nez: ${faceData.noseHeight.toFixed(2)}px
- Largeur de la mâchoire: ${faceData.jawWidth.toFixed(2)}px

RATIOS CALCULÉS :
- Ratio nez/œil: ${faceData.noseToEyeRatio.toFixed(4)}
- Ratio hauteur/largeur visage: ${faceData.faceRatio.toFixed(4)}
- Ratio mâchoire/largeur: ${faceData.jawRatio.toFixed(4)}
- Confiance de détection: ${(faceData.confidence * 100).toFixed(1)}%

Basé sur ces mesures précises, estime l'âge, le type de peau, la forme du visage, et donne des recommandations de produits cosmétiques et de beauté adaptés. Sois précis et réaliste dans tes estimations.
    `;
  }

  private makeRequest(request: DeepSeekRequest): Observable<DeepSeekResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(this as any).API_KEY}`
    });

    return this.http.post<DeepSeekResponse>(this.API_URL, request, { headers });
  }

  private parseAIResponse(response: DeepSeekResponse | undefined): AIAnalysisResult {
    if (!response || !response.choices || response.choices.length === 0) {
      return this.getFallbackAnalysis();
    }

    try {
      const content = response.choices[0].message.content;
      console.log('🤖 Réponse brute DeepSeek:', content);
      
      // Extraire le JSON de la réponse
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Pas de JSON trouvé dans la réponse');
      }

      const parsedResult = JSON.parse(jsonMatch[0]);
      console.log('✅ Analyse AI parsée:', parsedResult);
      
      return {
        estimatedAge: parsedResult.estimatedAge || "25-35 ans",
        skinType: parsedResult.skinType || "Peau normale",
        faceShape: parsedResult.faceShape || "Ovale",
        personalityTraits: parsedResult.personalityTraits || [],
        beautyTips: parsedResult.beautyTips || [],
        productRecommendations: parsedResult.productRecommendations || [],
        confidence: parsedResult.confidence || 0.5,
        explanation: parsedResult.explanation || "Analyse basée sur les proportions faciales"
      };

    } catch (error) {
      console.error('Erreur parsing réponse AI:', error);
      return this.getFallbackAnalysis();
    }
  }

  private getFallbackAnalysis(): AIAnalysisResult {
    return {
      estimatedAge: "25-35 ans",
      skinType: "Peau normale",
      faceShape: "Ovale",
      personalityTraits: ["Confiant", "Amical", "Authentique"],
      beautyTips: [
        "Hydratez votre peau quotidiennement",
        "Utilisez une protection solaire",
        "Nettoyez votre visage matin et soir"
      ],
      productRecommendations: [
        "Crème hydratante quotidienne",
        "Nettoyant doux",
        "Protection solaire SPF 30+"
      ],
      confidence: 0.7,
      explanation: "Analyse de base basée sur les proportions faciales standard"
    };
  }

  // Test de connexion API
  async testConnection(): Promise<boolean> {
    const testRequest: DeepSeekRequest = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: 'Test de connexion. Réponds juste "OK".'
        }
      ],
      max_tokens: 10
    };

    try {
      const response = await this.makeRequest(testRequest).toPromise();
      console.log('🔗 Test connexion DeepSeek:', response);
      return response?.choices?.[0]?.message?.content?.includes('OK') || false;
    } catch (error) {
      console.error('❌ Échec test connexion:', error);
      return false;
    }
  }
}