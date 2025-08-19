package com.parapharmacie.parapharmacie_backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public class CommandeItemDto {

    @NotNull(message = "L'ID du produit est obligatoire")
    private Long productId;

    @NotBlank(message = "Le titre du produit est obligatoire")
    private String productTitle;

    @NotNull(message = "Le prix unitaire est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit être positif")
    private BigDecimal prixUnitaire;

    @NotNull(message = "La quantité est obligatoire")
    @Min(value = 1, message = "La quantité doit être d'au moins 1")
    private Integer quantite;

    private String taille;

    private String imageUrl;

    // Constructeurs
    public CommandeItemDto() {}

    public CommandeItemDto(Long productId, String productTitle, BigDecimal prixUnitaire,
                           Integer quantite, String taille) {
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