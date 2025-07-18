package com.parapharmacie.parapharmacie_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "Email obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Mot de passe obligatoire")
    private String motDePasse;

    // Constructeurs
    public LoginRequest() {}

    public LoginRequest(String email, String motDePasse) {
        this.email = email;
        this.motDePasse = motDePasse;
    }

    // Getters et Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
}