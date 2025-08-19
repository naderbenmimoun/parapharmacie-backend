import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService, OrderResponse } from '../services/order.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.css'
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);

  orderReference = signal<string>('');
  orderDetails = signal<OrderResponse | null>(null);
  isLoading = signal(true);
  error = signal<string>('');

  ngOnInit(): void {
    // Récupérer la référence de commande depuis les paramètres de l'URL
    this.route.queryParams.subscribe(params => {
      const ref = params['ref'];
      if (ref) {
        this.orderReference.set(ref);
        this.loadOrderDetails();
      } else {
        // Si pas de référence, rediriger vers l'accueil
        this.router.navigate(['/home']);
      }
    });
  }

  private loadOrderDetails(): void {
    // Pour l'instant, on simule les détails de commande
    // Plus tard, on pourra faire un appel API pour récupérer les détails complets
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000);
  }

  getStatusDisplay(status: string): { text: string; color: string; icon: string } {
    switch (status) {
      case 'EN_ATTENTE':
        return { text: 'En attente', color: '#f59e0b', icon: '⏳' };
      case 'CONFIRMEE':
        return { text: 'Confirmée', color: '#10b981', icon: '✅' };
      case 'PREPAREE':
        return { text: 'Préparée', color: '#3b82f6', icon: '📦' };
      case 'EXPEDIEE':
        return { text: 'Expédiée', color: '#8b5cf6', icon: '🚚' };
      case 'LIVREE':
        return { text: 'Livrée', color: '#10b981', icon: '🎉' };
      default:
        return { text: 'En cours', color: '#6b7280', icon: '📋' };
    }
  }

  getPaymentMethodDisplay(method: string): { text: string; icon: string } {
    switch (method) {
      case 'STRIPE_CARD':
        return { text: 'Carte bancaire', icon: '💳' };
      case 'CASH_ON_DELIVERY':
        return { text: 'Paiement à la livraison', icon: '💵' };
      case 'BANK_TRANSFER':
        return { text: 'Virement bancaire', icon: '🏦' };
      default:
        return { text: 'Autre', icon: '💰' };
    }
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('fr-FR');
  }
}