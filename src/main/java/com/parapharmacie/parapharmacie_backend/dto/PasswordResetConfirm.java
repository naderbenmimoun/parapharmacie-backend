package com.parapharmacie.parapharmacie_backend.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PasswordResetConfirm {

    @NotBlank(message = "Email obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Code de vérification obligatoire")
    @Size(min = 6, max = 6, message = "Le code doit contenir 6 caractères")
    private String resetCode;

    @NotBlank(message = "Nouveau mot de passe obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String nouveauMotDePasse;

    // Constructeurs
    public PasswordResetConfirm() {}

    public PasswordResetConfirm(String email, String resetCode, String nouveauMotDePasse) {
        this.email = email;
        this.resetCode = resetCode;
        this.nouveauMotDePasse = nouveauMotDePasse;
    }

    // Getters et Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getResetCode() {
        return resetCode;
    }

    public void setResetCode(String resetCode) {
        this.resetCode = resetCode;
    }

    public String getNouveauMotDePasse() {
        return nouveauMotDePasse;
    }

    public void setNouveauMotDePasse(String nouveauMotDePasse) {
        this.nouveauMotDePasse = nouveauMotDePasse;
    }
}