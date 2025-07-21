package com.parapharmacie.parapharmacie_backend.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChangePasswordRequest {

    @NotBlank(message = "Ancien mot de passe obligatoire")
    private String ancienMotDePasse;

    @NotBlank(message = "Nouveau mot de passe obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String nouveauMotDePasse;

    // Constructeurs
    public ChangePasswordRequest() {}

    public ChangePasswordRequest(String ancienMotDePasse, String nouveauMotDePasse) {
        this.ancienMotDePasse = ancienMotDePasse;
        this.nouveauMotDePasse = nouveauMotDePasse;
    }

    // Getters et Setters
    public String getAncienMotDePasse() {
        return ancienMotDePasse;
    }

    public void setAncienMotDePasse(String ancienMotDePasse) {
        this.ancienMotDePasse = ancienMotDePasse;
    }

    public String getNouveauMotDePasse() {
        return nouveauMotDePasse;
    }

    public void setNouveauMotDePasse(String nouveauMotDePasse) {
        this.nouveauMotDePasse = nouveauMotDePasse;
    }
}