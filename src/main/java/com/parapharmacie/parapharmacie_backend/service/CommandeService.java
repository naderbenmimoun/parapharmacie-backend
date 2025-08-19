package com.parapharmacie.parapharmacie_backend.service;

import com.parapharmacie.parapharmacie_backend.dto.*;
import com.parapharmacie.parapharmacie_backend.entity.*;
import com.parapharmacie.parapharmacie_backend.repository.CommandeRepository;
import com.parapharmacie.parapharmacie_backend.repository.CommandeItemRepository;
import com.parapharmacie.parapharmacie_backend.repository.UserRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CommandeService {

    @Autowired
    private CommandeRepository commandeRepository;

    @Autowired
    private CommandeItemRepository commandeItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StripeService stripeService;

    /**
     * Créer une nouvelle commande
     */
    @Transactional
    public CommandeResponse createCommande(String userEmail, CreateCommandeRequest request) {
        System.out.println("🛒 Création commande pour: " + userEmail);
        System.out.println("💰 Montant total: " + request.getMontantTotal() + " TND");

        try {
            // 1. Récupérer l'utilisateur
            Optional<User> userOptional = userRepository.findByEmail(userEmail);
            if (userOptional.isEmpty()) {
                throw new RuntimeException("Utilisateur non trouvé: " + userEmail);
            }
            User user = userOptional.get();

            // 2. Créer la commande
            Commande commande = new Commande();
            commande.setUser(user);
            commande.setMontantTotal(request.getMontantTotal());
            commande.setAdresseLivraison(request.getAdresseLivraison());
            commande.setTelephone(request.getTelephone());
            commande.setNotes(request.getNotes());
            commande.setStatut(StatutCommande.EN_ATTENTE);

            // Convertir String en Enum
            MethodePaiement methodePaiement = MethodePaiement.valueOf(request.getMethodePaiement());
            commande.setMethodePaiement(methodePaiement);

            // Générer référence unique
            commande.setReferenceCommande("CMD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

            // 3. Sauvegarder la commande
            Commande savedCommande = commandeRepository.save(commande);
            System.out.println("✅ Commande sauvegardée avec ID: " + savedCommande.getId());

            // 4. Créer les items de commande
            List<CommandeItem> commandeItems = request.getItems().stream()
                    .map(itemDto -> {
                        CommandeItem item = new CommandeItem();
                        item.setCommande(savedCommande);
                        item.setProductId(itemDto.getProductId());
                        item.setProductTitle(itemDto.getProductTitle());
                        item.setPrixUnitaire(itemDto.getPrixUnitaire());
                        item.setQuantite(itemDto.getQuantite());
                        item.setTaille(itemDto.getTaille());
                        item.setImageUrl(itemDto.getImageUrl());
                        return item;
                    })
                    .collect(Collectors.toList());

            commandeItemRepository.saveAll(commandeItems);
            System.out.println("✅ " + commandeItems.size() + " items sauvegardés");

            // 5. Traiter le paiement selon la méthode
            CommandeResponse response = convertToResponse(savedCommande);

            if (methodePaiement == MethodePaiement.STRIPE_CARD) {
                // Créer PaymentIntent Stripe
                String description = "Commande " + savedCommande.getReferenceCommande() +
                        " - " + commandeItems.size() + " produit(s)";

                PaymentIntent paymentIntent = stripeService.createPaymentIntent(
                        request.getMontantTotal(),
                        userEmail,
                        description
                );

                // Sauvegarder l'ID du PaymentIntent
                savedCommande.setStripePaymentIntentId(paymentIntent.getId());
                commandeRepository.save(savedCommande);

                // Ajouter les infos Stripe à la réponse
                response.setClientSecret(paymentIntent.getClientSecret());
                response.setStripePaymentIntentId(paymentIntent.getId());

                System.out.println("🎫 PaymentIntent créé: " + paymentIntent.getId());
            }

            // Convertir items pour la réponse
            List<CommandeItemDto> itemDtos = commandeItems.stream()
                    .map(this::convertItemToDto)
                    .collect(Collectors.toList());
            response.setItems(itemDtos);

            System.out.println("🎉 Commande créée avec succès: " + response.getReferenceCommande());
            return response;

        } catch (StripeException e) {
            System.out.println("❌ Erreur Stripe: " + e.getMessage());
            throw new RuntimeException("Erreur lors de la création du paiement: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("❌ Erreur création commande: " + e.getMessage());
            throw new RuntimeException("Erreur lors de la création de la commande: " + e.getMessage());
        }
    }

    /**
     * Confirmer le paiement d'une commande (webhook Stripe)
     */
    @Transactional
    public void confirmPayment(String paymentIntentId) {
        System.out.println("✅ Confirmation paiement: " + paymentIntentId);

        try {
            Optional<Commande> commandeOptional = commandeRepository.findByStripePaymentIntentId(paymentIntentId);

            if (commandeOptional.isEmpty()) {
                System.out.println("❌ Commande non trouvée pour PaymentIntent: " + paymentIntentId);
                return;
            }

            Commande commande = commandeOptional.get();

            // Vérifier le statut du paiement sur Stripe
            if (stripeService.isPaymentSuccessful(paymentIntentId)) {
                commande.setStatut(StatutCommande.CONFIRMEE);
                commande.setDatePaiement(LocalDateTime.now());
                commandeRepository.save(commande);

                System.out.println("🎉 Paiement confirmé pour commande: " + commande.getReferenceCommande());
            }

        } catch (Exception e) {
            System.out.println("❌ Erreur confirmation paiement: " + e.getMessage());
        }
    }

    /**
     * Récupérer les commandes d'un utilisateur
     */
    public List<CommandeResponse> getUserCommandes(String userEmail) {
        System.out.println("📋 Récupération commandes pour: " + userEmail);

        List<Commande> commandes = commandeRepository.findByUserEmailOrderByDateCreationDesc(userEmail);

        return commandes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer une commande par ID
     */
    public Optional<CommandeResponse> getCommandeById(Long commandeId, String userEmail) {
        Optional<Commande> commandeOptional = commandeRepository.findById(commandeId);

        if (commandeOptional.isEmpty()) {
            return Optional.empty();
        }

        Commande commande = commandeOptional.get();

        // Vérifier que la commande appartient à l'utilisateur
        if (!commande.getUser().getEmail().equals(userEmail)) {
            return Optional.empty();
        }

        return Optional.of(convertToResponse(commande));
    }

    /**
     * Convertir Commande en CommandeResponse
     */
    private CommandeResponse convertToResponse(Commande commande) {
        CommandeResponse response = new CommandeResponse();
        response.setId(commande.getId());
        response.setReferenceCommande(commande.getReferenceCommande());
        response.setMontantTotal(commande.getMontantTotal());
        response.setStatut(commande.getStatut());
        response.setMethodePaiement(commande.getMethodePaiement());
        response.setDateCreation(commande.getDateCreation());
        response.setDatePaiement(commande.getDatePaiement());
        response.setAdresseLivraison(commande.getAdresseLivraison());
        response.setTelephone(commande.getTelephone());
        response.setNotes(commande.getNotes());
        response.setStripePaymentIntentId(commande.getStripePaymentIntentId());
        return response;
    }

    /**
     * Convertir CommandeItem en CommandeItemDto
     */
    private CommandeItemDto convertItemToDto(CommandeItem item) {
        CommandeItemDto dto = new CommandeItemDto();
        dto.setProductId(item.getProductId());
        dto.setProductTitle(item.getProductTitle());
        dto.setPrixUnitaire(item.getPrixUnitaire());
        dto.setQuantite(item.getQuantite());
        dto.setTaille(item.getTaille());
        dto.setImageUrl(item.getImageUrl());
        return dto;
    }
}