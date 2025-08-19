import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';  // <-- bien importer RouterLink ici
import { AuthService, LoginRequest } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink], // <-- RouterLink doit être importé ici aussi
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;

  constructor(private authService: AuthService, private router: Router) {}

onLogin(event: Event): void {
  event.preventDefault();

  const loginData: LoginRequest = {
    email: this.emailInput.nativeElement.value,
    motDePasse: this.passwordInput.nativeElement.value
  };

  this.authService.login(loginData).subscribe({
    next: (response) => {
     if (response.token) {
  localStorage.setItem('token', response.token);
  localStorage.setItem('nom', response.nom || '');

  alert('Connexion réussie !');
  this.router.navigate(['/home']).then(() => {
    window.location.reload();  // recharge la page complètement
  });
}
else {
        alert(response.message || 'Erreur lors de la connexion');
      }
    },
    error: (err) => {
      console.error(err);
      // Essayer d'afficher le message d'erreur renvoyé par le backend dans err.error
      if (err.error && err.error.message) {
        alert(err.error.message);
      } else {
        alert('Erreur serveur lors de la connexion');
      }
    }
  });
}
forgotPassword(): void {
  this.router.navigate(['/forgotPassword']);
}

}
