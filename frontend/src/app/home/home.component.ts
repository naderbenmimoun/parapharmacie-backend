import { Component, OnInit, inject, signal } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { ProductService } from '../services/product.service';
import { Product } from '../product-detail/product-detail.component';

@Component({
  selector: 'app-home',
  imports: [CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
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

  // Get popular products (first 4)
  get popularProducts(): Product[] {
    return this.products().slice(0, 4);
  }

  // Get remaining products (from 5th onwards)
  get productsFromId5(): Product[] {
    return this.products().slice(4);
  }
}
