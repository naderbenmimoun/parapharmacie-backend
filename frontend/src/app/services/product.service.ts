import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Product, ProductImage, ProductReview } from '../product-detail/product-detail.component';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [
    {
      id: 1,
      title: 'Avène cicalfate',
      description: 'Crème réparatrice pour peau irritée et sensible. Formulée avec l\'eau thermale d\'Avène et des ingrédients apaisants pour restaurer la barrière cutanée.',
      price: 34100,
      currency: 'TND',
      images: [
        { id: 1, url: 'images/products/popular1.webp', alt: 'Avène cicalfate' },
        { id: 2, url: 'images/products/popular1.webp', alt: 'Avène cicalfate' },
        { id: 3, url: 'images/products/popular1.webp', alt: 'Avène cicalfate' }
      ],
      rating: {
        rating: 4.6,
        count: 245
      },
      availableSizes: ['40ml', '100ml'],
      defaultSize: '40ml'
    },
    {
      id: 2,
      title: 'PHYTEAL écran invisible',
      description: 'PHYTEAL écran solaire invisible spf 50+ .\nSpécialement adapté pour le visage, le décolleté et les mains, plus exposés aux UV, ce soin solaire invisible 2 en 1 cumule toutes les propriétés d\'une protection solaire et d\'un soin hydratant.',
      price: 48000,
      currency: 'TND',
      images: [
        { id: 1, url: 'images/products/POPULAR2.webp', alt: 'PHYTEAL écran solaire' },
        { id: 2, url: 'images/products/POPULAR2.webp', alt: 'PHYTEAL écran solaire' },
        { id: 3, url: 'images/products/POPULAR2.webp', alt: 'PHYTEAL écran solaire' }
      ],
      rating: {
        rating: 4.5,
        count: 288
      },
      availableSizes: ['50ml', '100ml', '200ml'],
      defaultSize: '50ml'
    },
    {
      id: 3,
      title: 'VITA CITRAL baume lèvres',
      description: 'Baume hydratant pour les lèvres enrichi en vitamines et beurre de karité. Protège et nourrit les lèvres sèches et gercées.',
      price: 17000,
      currency: 'TND',
      images: [
        { id: 1, url: 'images/products/POPULAR3.webp', alt: 'VITA CITRAL baume lèvres' },
        { id: 2, url: 'images/products/POPULAR3.webp', alt: 'VITA CITRAL baume lèvres' },
        { id: 3, url: 'images/products/POPULAR3.webp', alt: 'VITA CITRAL baume lèvres' }
      ],
      rating: {
        rating: 4.3,
        count: 156
      },
      availableSizes: ['4.5g', '10g'],
      defaultSize: '4.5g'
    },
    {
      id: 4,
      title: 'PHYTEAL rollon déodorant',
      description: 'Déodorant roll-on naturel sans aluminium. Formulé avec des ingrédients naturels pour une protection efficace et respectueuse de la peau.',
      price: 16500,
      currency: 'TND',
      images: [
        { id: 1, url: 'images/products/popular4.webp', alt: 'PHYTEAL rollon déodorant' },
        { id: 2, url: 'images/products/popular4.webp', alt: 'PHYTEAL rollon déodorant' },
        { id: 3, url: 'images/products/popular4.webp', alt: 'PHYTEAL rollon déodorant' }
      ],
      rating: {
        rating: 4.4,
        count: 198
      },
      availableSizes: ['50ml', '100ml'],
      defaultSize: '50ml'
    },
    {
      id: 5,
      title: 'ROGE CAVAILLES - mousse',
      description: 'Mousse nettoyante douce pour le visage. Élimine les impuretés tout en préservant l\'équilibre naturel de la peau.',
      price: 31000,
      currency: 'TND',
      images: [
        { id: 1, url: 'images/products/prod1.webp', alt: 'ROGE CAVAILLES mousse' },
        { id: 2, url: 'images/products/prod1.webp', alt: 'ROGE CAVAILLES mousse' },
        { id: 3, url: 'images/products/prod1.webp', alt: 'ROGE CAVAILLES mousse' }
      ],
      rating: {
        rating: 4.2,
        count: 134
      },
      availableSizes: ['150ml', '300ml'],
      defaultSize: '150ml'
    },
    {
      id: 6,
      title: 'WEE BABY PRIME BAVOIR',
      description: 'Bavoir absorbant pour bébé en coton bio. Conçu pour protéger les vêtements pendant les repas et les activités.',
      price: 31000,
      currency: 'TND',
      images: [
        { id: 1, url: 'images/products/prod2.webp', alt: 'WEE BABY PRIME BAVOIR' },
        { id: 2, url: 'images/products/prod2.webp', alt: 'WEE BABY PRIME BAVOIR' },
        { id: 3, url: 'images/products/prod2.webp', alt: 'WEE BABY PRIME BAVOIR' }
      ],
      rating: {
        rating: 4.7,
        count: 89
      },
      availableSizes: ['1 bavoir', '3 bavoirs', '5 bavoirs'],
      defaultSize: '3 bavoirs'
    },
    {
      id: 7,
      title: 'SVR XERIAL 50 EXTREME',
      description: 'Crème hydratante intensive pour peau très sèche. Formulée avec des actifs hydratants puissants pour une hydratation longue durée.',
      price: 41500,
      currency: 'TND',
      images: [
        { id: 1, url: 'images/products/prod3.1.webp', alt: 'SVR XERIAL 50 EXTREME' },
        { id: 2, url: 'images/products/prod3.1.webp', alt: 'SVR XERIAL 50 EXTREME' },
        { id: 3, url: 'images/products/prod3.1.webp', alt: 'SVR XERIAL 50 EXTREME' }
      ],
      rating: {
        rating: 4.8,
        count: 203
      },
      availableSizes: ['50ml', '100ml', '200ml'],
      defaultSize: '100ml'
    },
    {
      id: 8,
      title: 'NUK KIDDY CUP 12M+',
      description: 'Gobelet d\'apprentissage pour enfants à partir de 12 mois. Design ergonomique pour faciliter l\'apprentissage de la boisson.',
      price: 25000,
      currency: 'TND',
      images: [
        { id: 1, url: 'images/products/prod4.webp', alt: 'NUK KIDDY CUP 12M+' },
        { id: 2, url: 'images/products/prod4.webp', alt: 'NUK KIDDY CUP 12M+' },
        { id: 3, url: 'images/products/prod4.webp', alt: 'NUK KIDDY CUP 12M+' }
      ],
      rating: {
        rating: 4.5,
        count: 167
      },
      availableSizes: ['1 gobelet', '2 gobelets'],
      defaultSize: '1 gobelet'
    },
    {
      id: 9,
      title: 'BABE PEDIATRIC creme solaire',
      description: 'Crème solaire pédiatrique haute protection SPF 50+. Spécialement formulée pour la peau sensible des enfants.',
      price: 65000,
      currency: 'TND',
      images: [
        { id: 1, url: 'images/products/prod5.webp', alt: 'BABE PEDIATRIC creme solaire' },
        { id: 2, url: 'images/products/prod5.webp', alt: 'BABE PEDIATRIC creme solaire' },
        { id: 3, url: 'images/products/prod5.webp', alt: 'BABE PEDIATRIC creme solaire' }
      ],
      rating: {
        rating: 4.9,
        count: 234
      },
      availableSizes: ['50ml', '100ml'],
      defaultSize: '50ml'
    },
    {
      id: 10,
      title: 'ODA - BRUME DEO ET SOIN',
      description: 'Brume déodorante et soin pour le corps. Formulée avec des ingrédients naturels pour une protection douce et efficace.',
      price: 84000,
      currency: 'TND',
      images: [
        { id: 1, url: 'images/products/prod6.webp', alt: 'ODA BRUME DEO ET SOIN' },
        { id: 2, url: 'images/products/prod6.webp', alt: 'ODA BRUME DEO ET SOIN' },
        { id: 3, url: 'images/products/prod6.webp', alt: 'ODA BRUME DEO ET SOIN' }
      ],
      rating: {
        rating: 4.4,
        count: 178
      },
      availableSizes: ['100ml', '200ml'],
      defaultSize: '100ml'
    },
    {
      id: 11,
      title: 'ISDIN SOLUTION MICELLAIRE',
      description: 'Solution micellaire pour démaquiller et nettoyer la peau. Élimine efficacement le maquillage et les impuretés.',
      price: 16500,
      currency: 'TND',
      images: [
        { id: 1, url: 'images/products/prod7.webp', alt: 'ISDIN SOLUTION MICELLAIRE' },
        { id: 2, url: 'images/products/prod7.webp', alt: 'ISDIN SOLUTION MICELLAIRE' },
        { id: 3, url: 'images/products/prod7.webp', alt: 'ISDIN SOLUTION MICELLAIRE' }
      ],
      rating: {
        rating: 4.6,
        count: 145
      },
      availableSizes: ['100ml', '200ml', '400ml'],
      defaultSize: '200ml'
    },
    {
      id: 12,
      title: 'SVR SUN SECURE',
      description: 'Crème solaire haute protection SPF 50+ pour le visage et le corps. Résistante à l\'eau et au sable.',
      price: 84000,
      currency: 'TND',
      images: [
        { id: 1, url: 'images/products/prod8.webp', alt: 'SVR SUN SECURE' },
        { id: 2, url: 'images/products/prod8.webp', alt: 'SVR SUN SECURE' },
        { id: 3, url: 'images/products/prod8.webp', alt: 'SVR SUN SECURE' }
      ],
      rating: {
        rating: 4.7,
        count: 267
      },
      availableSizes: ['50ml', '100ml', '200ml'],
      defaultSize: '100ml'
    }
  ];

  constructor() { }

  getProductById(id: number): Observable<Product | null> {
    const product = this.products.find(p => p.id === id);
    return of(product || null).pipe(delay(300)); // Simulate API delay
  }

  getAllProducts(): Observable<Product[]> {
    return of(this.products).pipe(delay(200));
  }

  getAllProductsSync(): Product[] {
    return [...this.products];
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    // Mock category filtering - in real app, this would filter by actual category
    const filteredProducts = this.products.filter(p => 
      p.title.toLowerCase().includes(category.toLowerCase()) ||
      p.description.toLowerCase().includes(category.toLowerCase())
    );
    return of(filteredProducts).pipe(delay(300));
  }

  searchProducts(query: string): Observable<Product[]> {
    const searchResults = this.products.filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
    return of(searchResults).pipe(delay(400));
  }
} 