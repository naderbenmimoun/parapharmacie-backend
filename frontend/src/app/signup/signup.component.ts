import { Component, ViewChild, ElementRef } from '@angular/core';
import { AuthService, SignupRequest } from '../services/auth.service'; // adapte le chemin

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  // Références aux inputs
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;
@ViewChild('sexeInput') sexeInput!: ElementRef<HTMLSelectElement>;

  // injecter AuthService
  constructor(private authService: AuthService) {}

onSignup(event: Event): void {
  event.preventDefault();

  const signupData: SignupRequest = {
    nom: this.nameInput.nativeElement.value,
    email: this.emailInput.nativeElement.value,
    motDePasse: this.passwordInput.nativeElement.value,
    sexe: this.sexeInput.nativeElement.value
  };

  this.authService.signup(signupData).subscribe({
    next: (response) => {
      if (response.token) {
        alert('Inscription réussie !');
      } else {
        alert(response.message || 'Erreur lors de l\'inscription');
      }
    },
    error: () => alert('Erreur serveur lors de l\'inscription')
  });
}
}
