import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  productId: number;
  productTitle: string;
  prixUnitaire: number;
  quantite: number;
  taille: string;
  imageUrl?: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  montantTotal: number;
  adresseLivraison: string;
  telephone: string;
  notes?: string;
  methodePaiement: string;
}

export interface OrderResponse {
  id: number;
  referenceCommande: string;
  montantTotal: number;
  statut: string;
  methodePaiement: string;
  dateCreation: string;
  datePaiement?: string;
  adresseLivraison: string;
  telephone: string;
  notes?: string;
  items?: OrderItem[];
  clientSecret?: string;
  stripePaymentIntentId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/commandes';

  constructor(private http: HttpClient) {}

  /**
   * Créer une nouvelle commande
   */
  createOrder(orderData: CreateOrderRequest): Observable<OrderResponse> {
    const headers = this.getAuthHeaders();
    console.log('🛒 Création commande:', orderData);
    
    return this.http.post<OrderResponse>(this.apiUrl, orderData, { headers });
  }

  /**
   * Récupérer toutes les commandes de l'utilisateur
   */
  getUserOrders(): Observable<OrderResponse[]> {
    const headers = this.getAuthHeaders();
    console.log('📋 Récupération commandes utilisateur');
    
    return this.http.get<OrderResponse[]>(this.apiUrl, { headers });
  }

  /**
   * Récupérer une commande par ID
   */
  getOrderById(orderId: number): Observable<OrderResponse> {
    const headers = this.getAuthHeaders();
    console.log('🔍 Récupération commande:', orderId);
    
    return this.http.get<OrderResponse>(`${this.apiUrl}/${orderId}`, { headers });
  }

  /**
   * Convertir les items du panier en items de commande
   */
  convertCartToOrderItems(cartItems: any[]): OrderItem[] {
    return cartItems.map(item => ({
      productId: item.productId,
      productTitle: item.title,
      prixUnitaire: item.price,
      quantite: item.quantity,
      taille: item.size,
      imageUrl: item.imageUrl
    }));
  }

  /**
   * Obtenir les headers avec authentification
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ Token manquant dans localStorage');
      throw new Error('Token d\'authentification manquant');
    }

    console.log('🔑 Token trouvé:', token.substring(0, 20) + '...');

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }
}