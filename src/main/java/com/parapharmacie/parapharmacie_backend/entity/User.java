package com.parapharmacie.parapharmacie_backend.entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false)
    private String nom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Column(nullable = false)
    private String motDePasse;

    @NotNull(message = "Le sexe est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @JsonProperty("sexe")
    private Sexe sexe;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "derniere_connexion")
    private LocalDateTime derniereConnexion;

    @Column(name = "reset_code")
    private String resetCode;

    @Column(name = "reset_code_expiration")
    private LocalDateTime resetCodeExpiration;

    @Column(name = "compte_actif")
    private Boolean compteActif = true;

    // Constructeur vide (obligatoire pour JPA)
    public User() {
        this.dateCreation = LocalDateTime.now();
        this.compteActif = true;
    }

    // Constructeur avec paramètres
    public User(String nom, String email, String motDePasse) {
        this();
        this.nom = nom;
        this.email = email;
        this.motDePasse = motDePasse;
    }

    // Getters et Setters existants
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }

    public Sexe getSexe() { return sexe; }
    public void setSexe(Sexe sexe) { this.sexe = sexe; }

    // Nouveaux getters/setters
    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDateTime getDerniereConnexion() { return derniereConnexion; }
    public void setDerniereConnexion(LocalDateTime derniereConnexion) { this.derniereConnexion = derniereConnexion; }

    public String getResetCode() { return resetCode; }
    public void setResetCode(String resetCode) { this.resetCode = resetCode; }

    public LocalDateTime getResetCodeExpiration() { return resetCodeExpiration; }
    public void setResetCodeExpiration(LocalDateTime resetCodeExpiration) { this.resetCodeExpiration = resetCodeExpiration; }

    public Boolean getCompteActif() { return compteActif; }
    public void setCompteActif(Boolean compteActif) { this.compteActif = compteActif; }
}