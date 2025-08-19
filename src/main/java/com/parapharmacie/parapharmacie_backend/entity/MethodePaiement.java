package com.parapharmacie.parapharmacie_backend.entity;

public enum MethodePaiement {
    STRIPE_CARD,           // Paiement par carte via Stripe
    CASH_ON_DELIVERY,      // Paiement à la livraison
    BANK_TRANSFER          // Virement bancaire
}