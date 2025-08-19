import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {
    this.initializeStripe();
  }

  private async initializeStripe(): Promise<void> {
    try {
      // Récupérer la clé publique depuis le backend
      const response = await this.http.get<{publicKey: string}>(`${this.apiUrl}/commandes/stripe/public-key`).toPromise();
      
      if (response?.publicKey) {
        this.stripe = await loadStripe(response.publicKey);
        console.log('✅ Stripe initialisé avec la clé:', response.publicKey.substring(0, 20) + '...');
        
        if (this.stripe) {
          this.elements = this.stripe.elements();
        }
      }
    } catch (error) {
      console.error('❌ Erreur initialisation Stripe:', error);
    }
  }

  /**
   * Créer et monter l'élément de carte
   */
  async createCardElement(containerId: string): Promise<void> {
    if (!this.elements) {
      await this.initializeStripe();
    }

    if (this.elements) {
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
          },
          invalid: {
            color: '#9e2146',
          },
        },
        hidePostalCode: true
      });

      const container = document.getElementById(containerId);
      if (container) {
        this.cardElement.mount(`#${containerId}`);
        console.log('✅ Élément carte monté');
      }
    }
  }

  /**
   * Confirmer le paiement
   */
  async confirmPayment(clientSecret: string, billingDetails: any): Promise<any> {
    if (!this.stripe || !this.cardElement) {
      throw new Error('Stripe n\'est pas initialisé');
    }

    console.log('💳 Confirmation paiement...');

    const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.cardElement,
        billing_details: billingDetails,
      }
    });

    if (error) {
      console.error('❌ Erreur paiement:', error);
      throw error;
    }

    console.log('✅ Paiement réussi:', paymentIntent);
    return paymentIntent;
  }

  /**
   * Détruire l'élément carte
   */
  destroyCardElement(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
      console.log('🗑️ Élément carte détruit');
    }
  }

  /**
   * Vérifier si Stripe est prêt
   */
  isReady(): boolean {
    return this.stripe !== null && this.elements !== null;
  }

  /**
   * Récupérer la clé publique depuis le backend
   */
  getPublicKey(): Observable<{publicKey: string}> {
    return this.http.get<{publicKey: string}>(`${this.apiUrl}/commandes/stripe/public-key`);
  }
}