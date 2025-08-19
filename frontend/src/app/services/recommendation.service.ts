// src/app/services/recommendation.service.ts
import { Injectable, inject } from '@angular/core';
import { ProductService } from './product.service';
import { Product } from '../product-detail/product-detail.component';

export interface FaceAnalysisResult {
  estimatedAge: string;
  skinType: string;
  faceShape: string;
  confidence: number;
}

export interface ProductRecommendation {
  product: Product;
  reason: string;
  priority: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private productService = inject(ProductService);

  // Mapping des analyses vers les mots-clés produits
  private readonly AGE_KEYWORDS = {
    '18-25': ['hydratant', 'léger', 'quotidien', 'jeunesse', 'protection'],
    '25-35': ['vitamine', 'anti-âge', 'préventif', 'soin', 'hydratant'],
    '35-45': ['anti-rides', 'fermeté', 'contour', 'intensif', 'réparatrice'],
    '45+': ['anti-âge', 'raffermissant', 'intensif', 'régénérant', 'lift']
  };

  private readonly SKIN_TYPE_KEYWORDS = {
    'Peau claire': ['protection', 'solaire', 'SPF', 'écran', 'sensitive'],
    'Peau normale': ['hydratant', 'équilibrant', 'quotidien', 'normal'],
    'Peau mate': ['éclat', 'unifiant', 'hydratant', 'nutrition'],
    'Peau foncée': ['nutrition', 'réparatrice', 'hydratant', 'riche']
  };

  private readonly FACE_SHAPE_KEYWORDS = {
    'Ovale': ['contouring', 'universel', 'équilibrant'],
    'Rond': ['affinant', 'sculptant', 'contouring'],
    'Carré': ['adoucissant', 'harmonisant', 'doux'],
    'Rectangle': ['volume', 'rebondi', 'hydratant']
  };

  async getRecommendations(analysisResult: FaceAnalysisResult): Promise<ProductRecommendation[]> {
    // Récupérer tous les produits
    const allProducts = this.productService.getAllProductsSync();
    
    // Générer les recommandations
    const recommendations: ProductRecommendation[] = [];

    // 1. Recommandations basées sur l'âge
    const ageKeywords = this.AGE_KEYWORDS[analysisResult.estimatedAge as keyof typeof this.AGE_KEYWORDS] || [];
    const ageProducts = this.findProductsByKeywords(allProducts, ageKeywords);
    
    ageProducts.forEach(product => {
      recommendations.push({
        product,
        reason: `Adapté pour votre tranche d'âge (${analysisResult.estimatedAge})`,
        priority: 1
      });
    });

    // 2. Recommandations basées sur le type de peau
    const skinKeywords = this.SKIN_TYPE_KEYWORDS[analysisResult.skinType as keyof typeof this.SKIN_TYPE_KEYWORDS] || [];
    const skinProducts = this.findProductsByKeywords(allProducts, skinKeywords);
    
    skinProducts.forEach(product => {
      // Éviter les doublons
      if (!recommendations.some(rec => rec.product.id === product.id)) {
        recommendations.push({
          product,
          reason: `Spécialement conçu pour ${analysisResult.skinType.toLowerCase()}`,
          priority: 2
        });
      }
    });

    // 3. Recommandations spéciales haute confiance
    if (analysisResult.confidence > 0.8) {
      const specialProducts = this.getSpecialRecommendations(analysisResult);
      specialProducts.forEach(product => {
        if (!recommendations.some(rec => rec.product.id === product.id)) {
          recommendations.push({
            product,
            reason: 'Recommandation IA premium (haute confiance)',
            priority: 0
          });
        }
      });
    }

    // Trier par priorité et limiter à 6 produits
    return recommendations
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 6);
  }

  private findProductsByKeywords(products: Product[], keywords: string[]): Product[] {
    return products.filter(product => {
      const searchText = (product.title + ' ' + product.description).toLowerCase();
      return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
    });
  }

  private getSpecialRecommendations(analysisResult: FaceAnalysisResult): Product[] {
    const allProducts = this.productService.getAllProductsSync();
    
    // Logique spéciale basée sur l'analyse combinée
    if (analysisResult.estimatedAge.includes('18-25') && analysisResult.skinType.includes('claire')) {
      // Jeune peau claire = priorité protection solaire
      return this.findProductsByKeywords(allProducts, ['solaire', 'SPF', 'protection']);
    }
    
    if (analysisResult.estimatedAge.includes('35-45') && analysisResult.confidence > 0.9) {
      // Âge mûr avec haute confiance = produits anti-âge premium
      return this.findProductsByKeywords(allProducts, ['anti-âge', 'sérum', 'intensif']);
    }

    // Par défaut, retourner les produits les plus populaires
    return allProducts.slice(0, 2);
  }

  // Méthode pour obtenir des conseils personnalisés
  getPersonalizedTips(analysisResult: FaceAnalysisResult): string[] {
    const tips: string[] = [];

    // Conseils basés sur l'âge
    if (analysisResult.estimatedAge.includes('18-25')) {
      tips.push('🌟 Établissez une routine de soins préventive dès maintenant');
      tips.push('☀️ N\'oubliez jamais la protection solaire quotidienne');
    } else if (analysisResult.estimatedAge.includes('25-35')) {
      tips.push('✨ Intégrez des antioxydants comme la vitamine C');
      tips.push('💧 Hydratation renforcée pour prévenir les premiers signes');
    } else if (analysisResult.estimatedAge.includes('35-45')) {
      tips.push('🎯 Concentrez-vous sur le contour des yeux');
      tips.push('🌙 Utilisez des soins de nuit réparateurs');
    } else {
      tips.push('💎 Privilégiez les soins intensifs et les sérums concentrés');
      tips.push('🔄 Pensez aux soins raffermissants quotidiens');
    }

    // Conseils basés sur le type de peau
    if (analysisResult.skinType.includes('claire')) {
      tips.push('🛡️ Protection solaire indispensable même en hiver');
    } else if (analysisResult.skinType.includes('foncée')) {
      tips.push('💧 Hydratation intensive pour éviter les taches');
    }

    // Conseil de confiance
    if (analysisResult.confidence > 0.85) {
      tips.push('🎯 Notre IA est très confiante dans cette analyse !');
    }

    return tips;
  }
}