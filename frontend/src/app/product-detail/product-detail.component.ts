import { Component, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { Subject, takeUntil } from 'rxjs';

export interface ProductImage {
  id: number;
  url: string;
  alt: string;
}

export interface ProductReview {
  rating: number;
  count: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: ProductImage[];
  rating: ProductReview;
  availableSizes: string[];
  defaultSize: string;
}

export interface Breadcrumb {
  label: string;
  url: string | null;
  active?: boolean;
}





@Component({
  selector: 'app-product-detail',
  standalone: true ,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private destroy$ = new Subject<void>();

  // Signals for reactive state management
  product = signal<Product | null>(null);

  selectedImageIndex = signal(0);
  selectedSize = signal('');
  quantity = signal(1);
  isAddedToCart = signal(false);
  isLoading = signal(false);

  breadcrumbs = signal<Breadcrumb[]>([]);

  // Computed signals
  currentImage = computed(() => {
    const product = this.product();
    if (!product) return null;
    return product.images[this.selectedImageIndex()];
  });

  formattedPrice = computed(() => {
    const product = this.product();
    if (!product) return '0';
    return product.price.toLocaleString('fr-FR');
  });

  stars = computed(() => {
    const product = this.product();
    if (!product) return [];
    
    const rating = product.rating.rating;
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
  });

  canDecreaseQuantity = computed(() => this.quantity() > 1);

  isFavorite = computed(() => {
    const product = this.product();
    if (!product) return false;
    return this.cartService.isFavorite(product.id);
  });

  isInCart = computed(() => {
    const product = this.product();
    if (!product) return false;
    return this.cartService.isInCart(product.id, this.selectedSize());
  });

  ngOnInit(): void {
    // Listen to route params to load different products
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const productId = params['id'];
        if (productId) {
          this.loadProduct(+productId);
        } else {
          // Default to product 1 if no ID provided
          this.loadProduct(1);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Image gallery methods
  selectImage(index: number): void {
    const product = this.product();
    if (!product || index < 0 || index >= product.images.length) return;
    this.selectedImageIndex.set(index);
  }

  previousImage(): void {
    const product = this.product();
    if (!product) return;
    
    const currentIndex = this.selectedImageIndex();
    const imagesLength = product.images.length;
    const newIndex = currentIndex > 0 ? currentIndex - 1 : imagesLength - 1;
    this.selectedImageIndex.set(newIndex);
  }

  nextImage(): void {
    const product = this.product();
    if (!product) return;
    
    const currentIndex = this.selectedImageIndex();
    const imagesLength = product.images.length;
    const newIndex = currentIndex < imagesLength - 1 ? currentIndex + 1 : 0;
    this.selectedImageIndex.set(newIndex);
  }

  // Quantity methods
  decreaseQuantity(): void {
    if (this.canDecreaseQuantity()) {
      this.quantity.update(qty => qty - 1);
    }
  }

  increaseQuantity(): void {
    this.quantity.update(qty => qty + 1);
  }

  onQuantityChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);
    if (value >= 1) {
      this.quantity.set(value);
    } else {
      this.quantity.set(1);
      target.value = '1';
    }
  }

  // Size selection
  onSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedSize.set(target.value);
  }

  // Cart and favorites methods
  addToCart(): void {
    const product = this.product();
    if (!product) return;

    this.isAddedToCart.set(true);
    
    // Add to cart using service
    this.cartService.addToCart(product, this.selectedSize(), this.quantity());
    
    console.log('Adding to cart:', {
      productId: product.id,
      size: this.selectedSize(),
      quantity: this.quantity()
    });

    // Reset button state after 2 seconds
    setTimeout(() => {
      this.isAddedToCart.set(false);
    }, 2000);
  }

  toggleFavorite(): void {
    const product = this.product();
    if (!product) return;
    
    this.cartService.toggleFavorite(product.id);
    
    console.log('Toggle favorite:', {
      productId: product.id,
      isFavorite: this.isFavorite()
    });
  }

  private loadProduct(id: number): void {
    this.isLoading.set(true);
    
    this.productService.getProductById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          if (product) {
            this.product.set(product);
            this.selectedSize.set(product.defaultSize);
            this.updateBreadcrumbs(product);
            this.resetState();
          } else {
            console.error('Product not found:', id);
            // Handle product not found - could redirect to 404 or show error
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.isLoading.set(false);
        }
      });
  }

  private updateBreadcrumbs(product: Product): void {
    // Create dynamic breadcrumbs based on product
    const breadcrumbs: Breadcrumb[] = [
      { label: 'Accueil', url: '/' },
      { label: 'Produits', url: '/products' },
      { label: product.title, url: null, active: true }
    ];
    this.breadcrumbs.set(breadcrumbs);
  }

  private resetState(): void {
    this.selectedImageIndex.set(0);
    this.quantity.set(1);
    this.isAddedToCart.set(false);
  }
}
