import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  email: string;
  resetCode: string;
  nouveauMotDePasse: string;
}

export interface AuthResponse {
  message?: string;
  token?: string;
}

export interface UserProfile {
  id: number;
  nom: string;
  email: string;
  sexe: string;
  dateCreation: string;
  derniereConnexion: string;
}

export interface UpdateProfileRequest {
  nom: string;
  email: string;
  sexe: string;
}

export interface ChangePasswordRequest {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = 'http://localhost:8080/api/user';

  constructor(private http: HttpClient) {}

  // Méthodes existantes
  requestPasswordReset(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/reset-password-request`, { email });
  }

  confirmPasswordReset(data: PasswordResetConfirm): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/reset-password-confirm`, data);
  }

  // Nouvelles méthodes pour la gestion du profil
  getUserProfile(): Observable<UserProfile> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`, { headers });
  }

  updateProfile(request: UpdateProfileRequest): Observable<AuthResponse> {
    const headers = this.getAuthHeaders();
    return this.http.put<AuthResponse>(`${this.apiUrl}/profile`, request, { headers });
  }

  changePassword(request: ChangePasswordRequest): Observable<AuthResponse> {
    const headers = this.getAuthHeaders();
    return this.http.put<AuthResponse>(`${this.apiUrl}/change-password`, request, { headers });
  }

  // Méthode utilitaire pour créer les headers d'authentification
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}
