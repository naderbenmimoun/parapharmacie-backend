import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../product-detail/product-detail.component';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-card',
  imports: [RouterLink],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() product!: Product;
  
  private cartService = inject(CartService);

  isFavorite(): boolean {
    return this.cartService.isFavorite(this.product.id);
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.toggleFavorite(this.product.id);
  }
}
