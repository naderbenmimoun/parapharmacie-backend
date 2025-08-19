package com.parapharmacie.parapharmacie_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

@Entity
@Table(name = "commande_items")
public class CommandeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commande_id", nullable = false)
    private Commande commande;

    @NotNull
    @Column(nullable = false)
    private Long productId;

    @NotNull
    @Column(nullable = false)
    private String productTitle;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal prixUnitaire;

    @NotNull
    @Min(1)
    @Column(nullable = false)
    private Integer quantite;

    @Column(length = 50)
    private String taille;

    @Column(length = 500)
    private String imageUrl;

    // Constructeurs
    public CommandeItem() {}

    public CommandeItem(Commande commande, Long productId, String productTitle,
                        BigDecimal prixUnitaire, Integer quantite, String taille) {
        this.commande = commande;
        this.productId = productId;
        this.productTitle = productTitle;
        this.prixUnitaire = prixUnitaire;
        this.quantite = quantite;
        this.taille = taille;
    }

    // Méthode pour calculer le sous-total
    public BigDecimal getSousTotal() {
        return prixUnitaire.multiply(BigDecimal.valueOf(quantite));
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Commande getCommande() { return commande; }
    public void setCommande(Commande commande) { this.commande = commande; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductTitle() { return productTitle; }
    public void setProductTitle(String productTitle) { this.productTitle = productTitle; }

    public BigDecimal getPrixUnitaire() { return prixUnitaire; }
    public void setPrixUnitaire(BigDecimal prixUnitaire) { this.prixUnitaire = prixUnitaire; }

    public Integer getQuantite() { return quantite; }
    public void setQuantite(Integer quantite) { this.quantite = quantite; }

    public String getTaille() { return taille; }
    public void setTaille(String taille) { this.taille = taille; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}