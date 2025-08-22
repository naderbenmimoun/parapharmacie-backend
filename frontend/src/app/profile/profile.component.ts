import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserManagementService, UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '../services/user-mangement.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  userProfile: UserProfile | null = null;
  isLoading = true;
  isUpdatingProfile = false;
  isChangingPassword = false;
  
  // Messages
  successMessage = '';
  errorMessage = '';
  
  // Formulaires
  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  // Onglets
  activeTab = 'profile';

  constructor(
    private userManagementService: UserManagementService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.profileForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      sexe: ['', Validators.required]
    });

    this.passwordForm = this.formBuilder.group({
      ancienMotDePasse: ['', [Validators.required, Validators.minLength(6)]],
      nouveauMotDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmerMotDePasse: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  // Charger le profil utilisateur
  loadUserProfile(): void {
    this.isLoading = true;
    this.userManagementService.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.populateProfileForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil:', error);
        this.errorMessage = 'Erreur lors du chargement du profil';
        this.isLoading = false;
        
        // Rediriger vers login si non authentifié
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  // Remplir le formulaire avec les données actuelles
  populateProfileForm(): void {
    if (this.userProfile) {
      this.profileForm.patchValue({
        nom: this.userProfile.nom,
        email: this.userProfile.email,
        sexe: this.userProfile.sexe
      });
    }
  }

  // Mettre à jour le profil
  updateProfile(): void {
    if (this.profileForm.valid) {
      this.isUpdatingProfile = true;
      this.clearMessages();

      const request: UpdateProfileRequest = this.profileForm.value;
      
      this.userManagementService.updateProfile(request).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Profil mis à jour avec succès';
          this.loadUserProfile(); // Recharger les données
          this.isUpdatingProfile = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour du profil';
          this.isUpdatingProfile = false;
        }
      });
    }
  }

  // Changer le mot de passe
  changePassword(): void {
    if (this.passwordForm.valid) {
      this.isChangingPassword = true;
      this.clearMessages();

      const request: ChangePasswordRequest = {
        ancienMotDePasse: this.passwordForm.get('ancienMotDePasse')?.value,
        nouveauMotDePasse: this.passwordForm.get('nouveauMotDePasse')?.value
      };

      this.userManagementService.changePassword(request).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Mot de passe changé avec succès';
          this.passwordForm.reset();
          this.isChangingPassword = false;
        },
        error: (error) => {
          console.error('Erreur lors du changement de mot de passe:', error);
          this.errorMessage = error.error?.message || 'Erreur lors du changement de mot de passe';
          this.isChangingPassword = false;
        }
      });
    }
  }

  // Validateur pour la confirmation du mot de passe
  passwordMatchValidator(form: FormGroup): {[key: string]: any} | null {
    const nouveauMotDePasse = form.get('nouveauMotDePasse');
    const confirmerMotDePasse = form.get('confirmerMotDePasse');
    
    if (nouveauMotDePasse && confirmerMotDePasse && 
        nouveauMotDePasse.value !== confirmerMotDePasse.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  // Changer d'onglet
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  // Effacer les messages
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Formater la date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Getters pour les erreurs de validation
  getProfileFormErrors(field: string): string {
    const control = this.profileForm.get(field);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) return 'Ce champ est obligatoire';
      if (control.errors['email']) return 'Email invalide';
      if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} caractères`;
    }
    return '';
  }

  getPasswordFormErrors(field: string): string {
    const control = this.passwordForm.get(field);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) return 'Ce champ est obligatoire';
      if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} caractères`;
    }
    return '';
  }

  getPasswordMismatchError(): string {
    if (this.passwordForm.errors && this.passwordForm.errors['passwordMismatch'] && 
        this.passwordForm.get('confirmerMotDePasse')?.touched) {
      return 'Les mots de passe ne correspondent pas';
    }
    return '';
  }
}
