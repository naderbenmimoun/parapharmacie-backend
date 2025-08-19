import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { OrderService, CreateOrderRequest } from '../services/order.service';
import { StripeService } from '../services/stripe.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private stripeService = inject(StripeService);
  private router = inject(Router);

  // Signals pour l'état
  cartItems = this.cartService.getCartItems();
  totalPrice = signal(0);
  isProcessing = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // Données du formulaire
  formData = {
    adresseLivraison: '',
    telephone: '',
    notes: '',
    methodePaiement: 'STRIPE_CARD'
  };

  // Options de paiement
  paymentMethods = [
    { value: 'STRIPE_CARD', label: 'Carte bancaire', icon: '💳' },
    { value: 'CASH_ON_DELIVERY', label: 'Paiement à la livraison', icon: '💵' },
    { value: 'BANK_TRANSFER', label: 'Virement bancaire', icon: '🏦' }
  ];

  ngOnInit(): void {
    // Vérifier l'authentification
    if (!this.orderService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Vérifier que le panier n'est pas vide
    if (this.cartItems().length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    // Calculer le total
    this.calculateTotal();

    // Initialiser Stripe si nécessaire
    if (this.formData.methodePaiement === 'STRIPE_CARD') {
      this.initializeStripeCard();
    }
  }

  ngOnDestroy(): void {
    this.stripeService.destroyCardElement();
  }

  calculateTotal(): void {
    const total = this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.totalPrice.set(total);
  }

  onPaymentMethodChange(): void {
    this.errorMessage.set('');
    
    if (this.formData.methodePaiement === 'STRIPE_CARD') {
      setTimeout(() => this.initializeStripeCard(), 100);
    } else {
      this.stripeService.destroyCardElement();
    }
  }

  private async initializeStripeCard(): Promise<void> {
    try {
      await this.stripeService.createCardElement('card-element');
    } catch (error) {
      console.error('Erreur initialisation Stripe:', error);
      this.errorMessage.set('Erreur lors de l\'initialisation du paiement');
    }
  }

  async onSubmit(): Promise<void> {
    if (this.isProcessing()) return;

    this.isProcessing.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      // Validation du formulaire
      if (!this.validateForm()) {
        this.isProcessing.set(false);
        return;
      }

      // Préparer les données de la commande
      const orderItems = this.orderService.convertCartToOrderItems(this.cartItems());
      
      const orderRequest: CreateOrderRequest = {
        items: orderItems,
        montantTotal: this.totalPrice(),
        adresseLivraison: this.formData.adresseLivraison,
        telephone: this.formData.telephone,
        notes: this.formData.notes,
        methodePaiement: this.formData.methodePaiement
      };

      console.log('🛒 Envoi commande:', orderRequest);

      // Créer la commande
      const orderResponse = await this.orderService.createOrder(orderRequest).toPromise();
      
      if (!orderResponse) {
        throw new Error('Erreur lors de la création de la commande');
      }

      console.log('✅ Commande créée:', orderResponse);

      // Traitement selon la méthode de paiement
      if (this.formData.methodePaiement === 'STRIPE_CARD') {
        await this.processStripePayment(orderResponse);
      } else {
        await this.processNonStripePayment(orderResponse);
      }

    } catch (error: any) {
      console.error('❌ Erreur checkout:', error);
      this.errorMessage.set(error.message || 'Erreur lors du traitement de la commande');
      this.isProcessing.set(false);
    }
  }

  private async processStripePayment(orderResponse: any): Promise<void> {
    if (!orderResponse.clientSecret) {
      throw new Error('Secret client Stripe manquant');
    }

    console.log('💳 Traitement paiement Stripe...');

    try {
      const userName = localStorage.getItem('nom') || 'Client';
      
      const billingDetails = {
        name: userName,
        email: localStorage.getItem('email') || '',
        address: {
          line1: this.formData.adresseLivraison,
        },
        phone: this.formData.telephone,
      };

      const paymentResult = await this.stripeService.confirmPayment(
        orderResponse.clientSecret,
        billingDetails
      );

      if (paymentResult.status === 'succeeded') {
        this.successMessage.set('Paiement réussi ! Commande confirmée.');
        this.clearCartAndRedirect(orderResponse.referenceCommande);
      } else {
        throw new Error('Le paiement n\'a pas abouti');
      }

    } catch (error: any) {
      throw new Error(`Erreur paiement: ${error.message}`);
    }
  }

  private async processNonStripePayment(orderResponse: any): Promise<void> {
    console.log('💵 Commande sans paiement immédiat');
    
    this.successMessage.set('Commande créée avec succès !');
    setTimeout(() => {
      this.clearCartAndRedirect(orderResponse.referenceCommande);
    }, 2000);
  }

  private clearCartAndRedirect(orderReference: string): void {
    // Vider le panier
    this.cartService.clearCart();
    
    // Rediriger vers la page de confirmation
    this.router.navigate(['/order-confirmation'], { 
      queryParams: { ref: orderReference } 
    });
  }

  private validateForm(): boolean {
    if (!this.formData.adresseLivraison.trim()) {
      this.errorMessage.set('L\'adresse de livraison est obligatoire');
      return false;
    }

    if (!this.formData.telephone.trim()) {
      this.errorMessage.set('Le numéro de téléphone est obligatoire');
      return false;
    }

    if (this.cartItems().length === 0) {
      this.errorMessage.set('Votre panier est vide');
      return false;
    }

    return true;
  }

  getPaymentMethodIcon(method: string): string {
    const paymentMethod = this.paymentMethods.find(pm => pm.value === method);
    return paymentMethod?.icon || '💳';
  }
}