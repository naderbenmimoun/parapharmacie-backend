package com.parapharmacie.parapharmacie_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SignupRequest {

    @NotBlank(message = "Nom obligatoire")
    private String nom;

    @NotBlank(message = "Email obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Mot de passe obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String motDePasse;

    @NotNull(message = "Sexe obligatoire")
    private String sexe;

    // Constructeurs
    public SignupRequest() {}

    public SignupRequest(String nom, String email, String motDePasse, String sexe) {
        this.nom = nom;
        this.email = email;
        this.motDePasse = motDePasse;
        this.sexe = sexe;
    }

    // Getters et Setters
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }

    public String getSexe() { return sexe; }
    public void setSexe(String sexe) { this.sexe = sexe; }
}