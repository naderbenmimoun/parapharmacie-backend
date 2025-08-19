package com.parapharmacie.parapharmacie_backend.entity;

public enum StatutCommande {
    EN_ATTENTE,     // Commande créée, paiement en cours
    CONFIRMEE,      // Paiement réussi
    PREPAREE,       // Commande préparée
    EXPEDIEE,       // Commande expédiée
    LIVREE,         // Commande livrée
    ANNULEE,        // Commande annulée
    REMBOURSEE      // Commande remboursée
}