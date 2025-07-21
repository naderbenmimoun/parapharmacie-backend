package com.parapharmacie.parapharmacie_backend.dto;

import java.time.LocalDateTime;

public class UserProfileResponse {

    private Long id;
    private String nom;
    private String email;
    private String sexe;
    private LocalDateTime dateCreation;
    private LocalDateTime derniereConnexion;

    // Constructeurs
    public UserProfileResponse() {}

    public UserProfileResponse(Long id, String nom, String email, String sexe,
                               LocalDateTime dateCreation, LocalDateTime derniereConnexion) {
        this.id = id;
        this.nom = nom;
        this.email = email;
        this.sexe = sexe;
        this.dateCreation = dateCreation;
        this.derniereConnexion = derniereConnexion;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDerniereConnexion() {
        return derniereConnexion;
    }

    public void setDerniereConnexion(LocalDateTime derniereConnexion) {
        this.derniereConnexion = derniereConnexion;
    }
}