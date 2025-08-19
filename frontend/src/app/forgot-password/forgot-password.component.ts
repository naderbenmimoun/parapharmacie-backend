import { Component } from '@angular/core';
import { UserManagementService, PasswordResetRequest, PasswordResetConfirm } from '../services/user-mangement.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, NgIf,RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  resetCode = '';
  nouveauMotDePasse = '';

  step: 1 | 2 = 1;  // étape courante (1 ou 2)

  message = '';
  error = '';

  constructor(private userManagementService: UserManagementService,private router: Router) {}

// Étape 1 : Demande du code de reset
onRequestReset() {
  this.message = '';
  this.error = '';

  // Passer directement la chaîne email au service
  this.userManagementService.requestPasswordReset(this.email).subscribe({
    next: (res) => {
      this.message = res.message || 'Code envoyé à votre email.';
      this.step = 2;  // Passe à l'étape suivante
    },
    error: (err) => {
      this.error = err.error?.message || 'Erreur lors de la demande de reset.';
    }
  });
}


  // Étape 2 : Confirmer le reset avec code + nouveau mot de passe
  onConfirmReset() {
    this.message = '';
    this.error = '';

    // Construire l'objet conforme au backend
    const data: PasswordResetConfirm = {
      email: this.email,
      resetCode: this.resetCode,
      nouveauMotDePasse: this.nouveauMotDePasse
    };

    this.userManagementService.confirmPasswordReset(data).subscribe({
      next: (res) => {
        this.message = res.message || 'Mot de passe modifié avec succès !';
              this.router.navigate(['/login']);

        // Ici, tu peux rediriger vers la page de connexion si besoin
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la confirmation du reset.';
      }
    });
  }
}
