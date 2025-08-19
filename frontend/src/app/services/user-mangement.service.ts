import { HttpClient } from '@angular/common/http';
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

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = 'http://localhost:8080/api/user';

  constructor(private http: HttpClient) {}

requestPasswordReset(email: string): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.apiUrl}/reset-password-request`, { email });
}


 confirmPasswordReset(data: PasswordResetConfirm): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.apiUrl}/reset-password-confirm`, data);
}

}
