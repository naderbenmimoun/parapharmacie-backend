package com.parapharmacie.parapharmacie_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.util.List;

public class CreateCommandeRequest {

    @NotEmpty(message = "Le panier ne peut pas être vide")
    private List<CommandeItemDto> items;

    @NotNull(message = "Le montant total est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le montant doit être positif")
    private BigDecimal montantTotal;

    @NotBlank(message = "L'adresse de livraison est obligatoire")
    private String adresseLivraison;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    private String telephone;

    private String notes;

    @NotBlank(message = "La méthode de paiement est obligatoire")
    private String methodePaiement; // "STRIPE_CARD", "CASH_ON_DELIVERY", "BANK_TRANSFER"

    // Constructeurs
    public CreateCommandeRequest() {}

    public CreateCommandeRequest(List<CommandeItemDto> items, BigDecimal montantTotal,
                                 String adresseLivraison, String telephone, String methodePaiement) {
        this.items = items;
        this.montantTotal = montantTotal;
        this.adresseLivraison = adresseLivraison;
        this.telephone = telephone;
        this.methodePaiement = methodePaiement;
    }

    // Getters et Setters
    public List<CommandeItemDto> getItems() { return items; }
    public void setItems(List<CommandeItemDto> items) { this.items = items; }

    public BigDecimal getMontantTotal() { return montantTotal; }
    public void setMontantTotal(BigDecimal montantTotal) { this.montantTotal = montantTotal; }

    public String getAdresseLivraison() { return adresseLivraison; }
    public void setAdresseLivraison(String adresseLivraison) { this.adresseLivraison = adresseLivraison; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getMethodePaiement() { return methodePaiement; }
    public void setMethodePaiement(String methodePaiement) { this.methodePaiement = methodePaiement; }
}