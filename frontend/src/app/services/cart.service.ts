import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../product-detail/product-detail.component';
import { ProductService } from './product.service';

export interface CartItem {
  productId: number;
  title: string;
  price: number;
  currency: string;
  size: string;
  quantity: number;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);
  private favorites = signal<number[]>([]);

  constructor(private productService: ProductService) {
    // Load cart from localStorage on service initialization
    this.loadCartFromStorage();
    this.loadFavoritesFromStorage();
  }

  // Cart methods
  getCartItems() {
    return this.cartItems.asReadonly();
  }

  getCartItemCount() {
    return this.cartItems().length;
  }

  getTotalQuantity() {
    return this.cartItems().reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice() {
    return this.cartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  addToCart(product: Product, size: string, quantity: number): boolean {
    const existingItemIndex = this.cartItems().findIndex(
      item => item.productId === product.id && item.size === size
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...this.cartItems()];
      updatedItems[existingItemIndex].quantity += quantity;
      this.cartItems.set(updatedItems);
    } else {
      // Add new item
      const newItem: CartItem = {
        productId: product.id,
        title: product.title,
        price: product.price,
        currency: product.currency,
        size: size,
        quantity: quantity,
        imageUrl: product.images[0]?.url || ''
      };
      this.cartItems.update(items => [...items, newItem]);
    }

    this.saveCartToStorage();
    return true;
  }

  updateCartItemQuantity(productId: number, size: string, quantity: number): void {
    const updatedItems = this.cartItems().map(item => {
      if (item.productId === productId && item.size === size) {
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    });
    this.cartItems.set(updatedItems);
    this.saveCartToStorage();
  }

  removeFromCart(productId: number, size: string): void {
    const updatedItems = this.cartItems().filter(
      item => !(item.productId === productId && item.size === size)
    );
    this.cartItems.set(updatedItems);
    this.saveCartToStorage();
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.saveCartToStorage();
  }

  isInCart(productId: number, size: string): boolean {
    return this.cartItems().some(
      item => item.productId === productId && item.size === size
    );
  }

  getCartItemQuantity(productId: number, size: string): number {
    const item = this.cartItems().find(
      item => item.productId === productId && item.size === size
    );
    return item ? item.quantity : 0;
  }

  // Enhanced Favorites methods
  getFavorites() {
    return this.favorites.asReadonly();
  }

  getFavoriteCount() {
    return this.favorites().length;
  }

  getFavoriteProducts(): Product[] {
    const favoriteIds = this.favorites();
    const allProducts = this.productService.getAllProductsSync();
    return allProducts.filter(product => favoriteIds.includes(product.id));
  }

  addToFavorites(productId: number): void {
    if (!this.favorites().includes(productId)) {
      this.favorites.update(favs => [...favs, productId]);
      this.saveFavoritesToStorage();
    }
  }

  removeFromFavorites(productId: number): void {
    this.favorites.update(favs => favs.filter(id => id !== productId));
    this.saveFavoritesToStorage();
  }

  toggleFavorite(productId: number): void {
    if (this.isFavorite(productId)) {
      this.removeFromFavorites(productId);
    } else {
      this.addToFavorites(productId);
    }
  }

  isFavorite(productId: number): boolean {
    return this.favorites().includes(productId);
  }

  clearFavorites(): void {
    this.favorites.set([]);
    this.saveFavoritesToStorage();
  }

  // Storage methods
  private saveCartToStorage(): void {
    try {
      localStorage.setItem('cart', JSON.stringify(this.cartItems()));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  private loadCartFromStorage(): void {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const cartItems = JSON.parse(storedCart);
        this.cartItems.set(cartItems);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }

  private saveFavoritesToStorage(): void {
    try {
      localStorage.setItem('favorites', JSON.stringify(this.favorites()));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }

  private loadFavoritesFromStorage(): void {
    try {
      const storedFavorites = localStorage.getItem('favorites');
      if (storedFavorites) {
        const favorites = JSON.parse(storedFavorites);
        this.favorites.set(favorites);
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }
} 