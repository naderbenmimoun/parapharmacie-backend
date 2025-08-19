import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../card/card.component';
import { CartService } from '../services/cart.service';
import { Product } from '../product-detail/product-detail.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit {
  private cartService = inject(CartService);
  
  favoriteProducts = signal<Product[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    this.isLoading.set(true);
    // Simulate loading delay
    setTimeout(() => {
      const favorites = this.cartService.getFavoriteProducts();
      this.favoriteProducts.set(favorites);
      this.isLoading.set(false);
    }, 300);
  }

  getFavoriteCount(): number {
    return this.cartService.getFavoriteCount();
  }

  clearAllFavorites(): void {
    this.cartService.clearFavorites();
    this.favoriteProducts.set([]);
  }

  removeFromFavorites(productId: number): void {
    this.cartService.removeFromFavorites(productId);
    this.loadFavorites(); // Reload the list
  }
} 