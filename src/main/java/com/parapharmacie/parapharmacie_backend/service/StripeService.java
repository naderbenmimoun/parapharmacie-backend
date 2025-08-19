package com.parapharmacie.parapharmacie_backend.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentIntentConfirmParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class StripeService {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
        System.out.println("✅ Stripe initialisé avec la clé secrète");
    }

    /**
     * Créer un PaymentIntent Stripe
     * @param montant Montant en dinars tunisiens (sera converti en centimes EUR pour Stripe)
     * @param email Email du client
     * @param description Description de la commande
     * @return PaymentIntent créé
     * @throws StripeException
     */
    public PaymentIntent createPaymentIntent(BigDecimal montant, String email, String description) throws StripeException {
        System.out.println("🔄 Création PaymentIntent pour: " + email);
        System.out.println("💰 Montant: " + montant + " TND");

        // POUR DEMO : Convertir TND en EUR (approximativement 1 TND = 0.3 EUR)
        // En production, utiliser un vrai service de change
        BigDecimal montantEUR = montant.multiply(new BigDecimal("0.3"));

        // Convertir en centimes (plus petite unité pour EUR)
        // 1 EUR = 100 centimes
        long montantEnCentimes = montantEUR.multiply(new BigDecimal("100")).longValue();

        System.out.println("💶 Montant en EUR: " + montantEUR + " EUR");
        System.out.println("🪙 Montant en centimes: " + montantEnCentimes);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(montantEnCentimes)
                .setCurrency("eur") // Utiliser EUR au lieu de TND
                .setDescription(description + " (Converti de " + montant + " TND)")
                .putMetadata("customer_email", email)
                .putMetadata("original_amount_tnd", montant.toString())
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        System.out.println("✅ PaymentIntent créé: " + paymentIntent.getId());
        System.out.println("🔑 Client Secret: " + paymentIntent.getClientSecret().substring(0, 20) + "...");

        return paymentIntent;
    }

    /**
     * Récupérer un PaymentIntent par son ID
     * @param paymentIntentId ID du PaymentIntent
     * @return PaymentIntent
     * @throws StripeException
     */
    public PaymentIntent getPaymentIntent(String paymentIntentId) throws StripeException {
        System.out.println("🔍 Récupération PaymentIntent: " + paymentIntentId);
        return PaymentIntent.retrieve(paymentIntentId);
    }

    /**
     * Confirmer un paiement manuellement (si nécessaire)
     * @param paymentIntentId ID du PaymentIntent
     * @return PaymentIntent confirmé
     * @throws StripeException
     */
    public PaymentIntent confirmPayment(String paymentIntentId) throws StripeException {
        System.out.println("✅ Confirmation du paiement: " + paymentIntentId);

        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

        PaymentIntentConfirmParams params = PaymentIntentConfirmParams.builder()
                .build();

        return paymentIntent.confirm(params);
    }

    /**
     * Annuler un PaymentIntent
     * @param paymentIntentId ID du PaymentIntent
     * @return PaymentIntent annulé
     * @throws StripeException
     */
    public PaymentIntent cancelPayment(String paymentIntentId) throws StripeException {
        System.out.println("❌ Annulation du paiement: " + paymentIntentId);

        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        return paymentIntent.cancel();
    }

    /**
     * Vérifier le statut d'un paiement
     * @param paymentIntentId ID du PaymentIntent
     * @return true si le paiement est réussi
     * @throws StripeException
     */
    public boolean isPaymentSuccessful(String paymentIntentId) throws StripeException {
        PaymentIntent paymentIntent = getPaymentIntent(paymentIntentId);
        boolean isSuccessful = "succeeded".equals(paymentIntent.getStatus());

        System.out.println("🔍 Statut paiement " + paymentIntentId + ": " + paymentIntent.getStatus());
        System.out.println("✅ Paiement réussi: " + isSuccessful);

        return isSuccessful;
    }

    /**
     * Créer les métadonnées pour un paiement
     * @param commandeId ID de la commande
     * @param userEmail Email de l'utilisateur
     * @return Map des métadonnées
     */
    public Map<String, String> createPaymentMetadata(Long commandeId, String userEmail) {
        Map<String, String> metadata = new HashMap<>();
        metadata.put("commande_id", commandeId.toString());
        metadata.put("customer_email", userEmail);
        metadata.put("source", "parapharmacie_app");
        return metadata;
    }
}