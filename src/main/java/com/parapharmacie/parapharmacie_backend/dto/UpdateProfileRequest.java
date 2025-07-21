package com.parapharmacie.parapharmacie_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UpdateProfileRequest {

    @NotBlank(message = "Nom obligatoire")
    private String nom;

    @NotBlank(message = "Email obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @NotNull(message = "Sexe obligatoire")
    private String sexe;

    // Constructeurs
    public UpdateProfileRequest() {}

    public UpdateProfileRequest(String nom, String email, String sexe) {
        this.nom = nom;
        this.email = email;
        this.sexe = sexe;
    }

    // Getters et Setters
    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSexe() {
        return sexe;
    }

    public void setSexe(String sexe) {
        this.sexe = sexe;
    }
}