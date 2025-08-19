import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, CartItem } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h1 style="font-weight: bold; font-family:'Nunito' ;text-align:center">Mon Panier</h1>
      
      @if (cartItems().length > 0) {
        <div class="cart-content">
          <div class="cart-items">
            @for (item of cartItems(); track item.productId + item.size) {
              <div class="cart-item">
                <div class="item-image">
                  @if (item.imageUrl) {
                    <img [src]="item.imageUrl" [alt]="item.title">
                  } @else {
                    <div class="placeholder-image">
                      <span>Image</span>
                    </div>
                  }
                </div>
                
                <div class="item-details">
                  <h3 class="item-title">{{ item.title }}</h3>
                  <p class="item-size">Taille: {{ item.size }}</p>
                  <p class="item-price">{{ item.price.toLocaleString('fr-FR') }} {{ item.currency }}</p>
                </div>
                
                <div class="item-quantity">
                  <button class="quantity-btn" 
                          (click)="updateQuantity(item, item.quantity - 1)"
                          [disabled]="item.quantity <= 1">
                    −
                  </button>
                  <span class="quantity">{{ item.quantity }}</span>
                  <button class="quantity-btn" 
                          (click)="updateQuantity(item, item.quantity + 1)">
                    +
                  </button>
                </div>
                
                <div class="item-total">
                  {{ (item.price * item.quantity).toLocaleString('fr-FR') }} {{ item.currency }}
                </div>
                
                <button class="remove-btn" (click)="removeItem(item)">
                  ×
                </button>
              </div>
            }
          </div>
          
          <div class="cart-summary">
            <h2>Résumé</h2>
            <div class="summary-row">
              <span>Sous-total:</span>
              <span>{{ totalPrice().toLocaleString('fr-FR') }} TND</span>
            </div>
            <div class="summary-row">
              <span>Livraison:</span>
              <span>Gratuite</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>{{ totalPrice().toLocaleString('fr-FR') }} TND</span>
            </div>
            
            <button class="checkout-btn">
              Passer la commande
            </button>
            
            <button class="continue-shopping" routerLink="/products">
              Continuer les achats
            </button>
          </div>
        </div>
      } @else {
        <div class="empty-cart">
          <div class="empty-cart-icon">🛒</div>
          <h2>Votre panier est vide</h2>
          <p>Ajoutez des produits à votre panier pour commencer vos achats.</p>
          <a routerLink="/products" class="shop-now-btn">
            Découvrir nos produits
          </a>
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

    .cart-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 40px;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 100px 1fr auto auto auto;
      gap: 20px;
      align-items: center;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: white;
    }

    .item-image {
      width: 100px;
      height: 100px;
      overflow: hidden;
      border-radius: 8px;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder-image {
      width: 100%;
      height: 100%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 0.9rem;
    }

    .item-details {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .item-title {
      margin: 0;
      font-size: 1.1rem;
      color: #333;
    }

    .item-size {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .item-price {
      margin: 0;
      color: #2c3e50;
      font-weight: 600;
    }

    .item-quantity {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .quantity-btn {
      width: 30px;
      height: 30px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      transition: all 0.2s;
    }

    .quantity-btn:hover:not(:disabled) {
      background: #f5f5f5;
    }

    .quantity-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity {
      font-weight: 600;
      min-width: 20px;
      text-align: center;
    }

    .item-total {
      font-weight: bold;
      font-size: 1.1rem;
      color: #2c3e50;
    }

    .remove-btn {
      width: 30px;
      height: 30px;
      border: none;
      background: #ef4444;
      color: white;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .remove-btn:hover {
      background: #dc2626;
    }

    .cart-summary {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 30px;
      height: fit-content;
    }

    .cart-summary h2 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      color: #666;
    }

    .summary-row.total {
      border-top: 1px solid #e0e0e0;
      padding-top: 15px;
      font-weight: bold;
      font-size: 1.2rem;
      color: #333;
    }

    .checkout-btn {
      width: 100%;
      padding: 15px;
      background: #22c55e;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 15px;
      transition: background 0.2s;
    }

    .checkout-btn:hover {
      background: #16a34a;
    }

    .continue-shopping {
      width: 100%;
      padding: 12px;
      background: transparent;
      color: #666;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: block;
      text-align: center;
    }

    .continue-shopping:hover {
      background: #f5f5f5;
      color: #333;
    }

    .empty-cart {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-cart-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .empty-cart h2 {
      color: #666;
      margin-bottom: 10px;
    }

    .empty-cart p {
      color: #999;
      margin-bottom: 30px;
    }

    .shop-now-btn {
      display: inline-block;
      padding: 15px 30px;
      background: #45a049;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: background 0.2s;
    }

    .shop-now-btn:hover {
      background:#304d30  ;
    }

    @media (max-width: 768px) {
      .cart-content {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .cart-item {
        grid-template-columns: 80px 1fr;
        grid-template-rows: auto auto auto;
        gap: 15px;
      }

      .item-image {
        width: 80px;
        height: 80px;
        grid-row: 1 / 3;
      }

      .item-details {
        grid-column: 2;
        grid-row: 1;
      }

      .item-quantity {
        grid-column: 2;
        grid-row: 2;
        justify-self: start;
      }

      .item-total {
        grid-column: 1 / -1;
        grid-row: 3;
        text-align: center;
        padding-top: 10px;
        border-top: 1px solid #eee;
      }

      .remove-btn {
        position: absolute;
        top: 10px;
        right: 10px;
      }

      .page-title {
        font-size: 2rem;
      }
    }
  `]
})
export class CartComponent {
  private cartService = inject(CartService);

  cartItems = this.cartService.getCartItems();
  totalPrice = computed(() => this.cartService.getTotalPrice());

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity >= 1) {
      this.cartService.updateCartItemQuantity(item.productId, item.size, newQuantity);
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.productId, item.size);
  }
} 