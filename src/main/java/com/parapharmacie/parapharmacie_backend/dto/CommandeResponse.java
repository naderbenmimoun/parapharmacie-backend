package com.parapharmacie.parapharmacie_backend.dto;

import com.parapharmacie.parapharmacie_backend.entity.StatutCommande;
import com.parapharmacie.parapharmacie_backend.entity.MethodePaiement;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CommandeResponse {

    private Long id;
    private String referenceCommande;
    private BigDecimal montantTotal;
    private StatutCommande statut;
    private MethodePaiement methodePaiement;
    private LocalDateTime dateCreation;
    private LocalDateTime datePaiement;
    private String adresseLivraison;
    private String telephone;
    private String notes;
    private List<CommandeItemDto> items;

    // Pour Stripe
    private String clientSecret;
    private String stripePaymentIntentId;

    // Constructeurs
    public CommandeResponse() {}

    public CommandeResponse(Long id, String referenceCommande, BigDecimal montantTotal,
                            StatutCommande statut, MethodePaiement methodePaiement,
                            LocalDateTime dateCreation) {
        this.id = id;
        this.referenceCommande = referenceCommande;
        this.montantTotal = montantTotal;
        this.statut = statut;
        this.methodePaiement = methodePaiement;
        this.dateCreation = dateCreation;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReferenceCommande() { return referenceCommande; }
    public void setReferenceCommande(String referenceCommande) { this.referenceCommande = referenceCommande; }

    public BigDecimal getMontantTotal() { return montantTotal; }
    public void setMontantTotal(BigDecimal montantTotal) { this.montantTotal = montantTotal; }

    public StatutCommande getStatut() { return statut; }
    public void setStatut(StatutCommande statut) { this.statut = statut; }

    public MethodePaiement getMethodePaiement() { return methodePaiement; }
    public void setMethodePaiement(MethodePaiement methodePaiement) { this.methodePaiement = methodePaiement; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDateTime getDatePaiement() { return datePaiement; }
    public void setDatePaiement(LocalDateTime datePaiement) { this.datePaiement = datePaiement; }

    public String getAdresseLivraison() { return adresseLivraison; }
    public void setAdresseLivraison(String adresseLivraison) { this.adresseLivraison = adresseLivraison; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<CommandeItemDto> getItems() { return items; }
    public void setItems(List<CommandeItemDto> items) { this.items = items; }

    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }

    public String getStripePaymentIntentId() { return stripePaymentIntentId; }
    public void setStripePaymentIntentId(String stripePaymentIntentId) { this.stripePaymentIntentId = stripePaymentIntentId; }
}