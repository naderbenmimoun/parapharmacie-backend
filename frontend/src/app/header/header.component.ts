import { Component, inject, signal, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { NgIf } from '@angular/common';  // <-- Import de NgIf

@Component({
  selector: 'app-header',
  imports: [RouterLink, NgIf],  // <-- Ajoute NgIf ici
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  private cartService = inject(CartService);
  private router = inject(Router);

  showCategories = false;
  searchTerm = '';
  favoritesChanged = signal(false);
  userName = signal<string | null>(null); // signal pour le nom utilisateur

  categories = [
    'Soins capillaires', 
    'Maman et bébé',
    'Solaire',
    'Hommes',
    'Hygiène',
    'Orthopédie',
    'Chaussures orthopédiques',
    'Soins visage',
    'soins corps'
  ];

  constructor() {
    this.loadUserName();

    effect(() => {
      this.getFavoriteCount(); // pour animation
      this.triggerFavoritesAnimation();
    });
  }

  loadUserName() {
    const nom = localStorage.getItem('nom');
    this.userName.set(nom && nom.length > 0 ? nom : null);
  }

  toggleCategories() {
    this.showCategories = !this.showCategories;
  }

  selectCategory(category: string) {
    console.log('Selected:', category);
    this.showCategories = false;
  }

  search() {
    console.log('Searching for:', this.searchTerm);
  }

  getFavoriteCount(): number {
    return this.cartService.getFavoriteCount();
  }

  getCartItemCount(): number {
    return this.cartService.getCartItemCount();
  }

  private triggerFavoritesAnimation(): void {
    this.favoritesChanged.set(true);
    setTimeout(() => {
      this.favoritesChanged.set(false);
    }, 300);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('nom');
    this.userName.set(null);
    this.router.navigate(['/login']);
  }
}
