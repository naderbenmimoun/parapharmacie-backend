import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Product } from '../product-detail/product-detail.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h1 class="page-title">Nos Produits</h1>
      
      @if (isLoading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Chargement des produits...</p>
        </div>
      } @else if (products().length > 0) {
        <div class="products-grid">
          @for (product of products(); track product.id) {
            <div class="product-card">
              <div class="product-image">
                @if (product.images[0]?.url) {
                  <img [src]="product.images[0].url" [alt]="product.images[0].alt">
                } @else {
                  <div class="mock-product-image">
                    <div class="placeholder-text">Image</div>
                  </div>
                }
              </div>
              
              <div class="product-info">
                <h3 class="product-title">{{ product.title }}</h3>
                
                <div class="rating">
                  <div class="stars">
                    @for (star of getStars(product.rating.rating); track $index) {
                      <span class="star" [class]="star">★</span>
                    }
                  </div>
                  <span class="review-count">({{ product.rating.count }})</span>
                </div>
                
                <div class="price">{{ product.price.toLocaleString('fr-FR') }} {{ product.currency }}</div>
                
                <p class="description">{{ product.description.substring(0, 100) }}...</p>
                
                <div class="product-actions">
                  <a [routerLink]="['/product', product.id]" class="view-details-btn">
                    Voir les détails
                  </a>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="no-products">
          <h2>Aucun produit trouvé</h2>
          <p>Il n'y a actuellement aucun produit disponible.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .page-title {
      text-align: center;
      margin-bottom: 40px;
      color: #333;
      font-size: 2.5rem;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 30px;
    }

    .product-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      background: white;
    }

    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }

    .product-image {
      height: 200px;
      overflow: hidden;
      position: relative;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .mock-product-image {
      width: 100%;
      height: 100%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .placeholder-text {
      color: #999;
      font-size: 1.2rem;
    }

    .product-info {
      padding: 20px;
    }

    .product-title {
      margin: 0 0 10px 0;
      font-size: 1.2rem;
      color: #333;
      line-height: 1.4;
    }

    .rating {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }

    .stars {
      display: flex;
      margin-right: 8px;
    }

    .star {
      color: #ddd;
      font-size: 1rem;
    }

    .star.full {
      color: #ffd700;
    }

    .star.half {
      color: #ffd700;
    }

    .review-count {
      color: #666;
      font-size: 0.9rem;
    }

    .price {
      font-size: 1.3rem;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .description {
      color: #666;
      line-height: 1.5;
      margin-bottom: 20px;
      font-size: 0.9rem;
    }

    .product-actions {
      text-align: center;
    }

    .view-details-btn {
      display: inline-block;
      padding: 10px 20px;
      background: #45a049;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      transition: background 0.2s;
    }

    .view-details-btn:hover {
      background: #304d30 ;
    }

    .no-products {
      text-align: center;
      padding: 60px 20px;
    }

    .no-products h2 {
      color: #666;
      margin-bottom: 10px;
    }

    .no-products p {
      color: #999;
    }

    @media (max-width: 768px) {
      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
      }

      .page-title {
        font-size: 2rem;
      }
    }
  `]
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);

  products = signal<Product[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.isLoading.set(true);
    
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading.set(false);
      }
    });
  }

  getStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const stars: string[] = [];
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }
    
    // Add half star
    if (hasHalfStar) {
      stars.push('half');
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push('empty');
    }
    
    return stars;
  }
} 