package com.parapharmacie.parapharmacie_backend.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String nom;
    private String sexe;
    private String message;

    // Constructeurs
    public AuthResponse() {}

    public AuthResponse(String token, String email, String nom, String sexe) {
        this.token = token;
        this.email = email;
        this.nom = nom;
        this.sexe = sexe;
    }

    public AuthResponse(String message) {
        this.message = message;
    }

    // Getters et Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getSexe() { return sexe; }
    public void setSexe(String sexe) { this.sexe = sexe; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}