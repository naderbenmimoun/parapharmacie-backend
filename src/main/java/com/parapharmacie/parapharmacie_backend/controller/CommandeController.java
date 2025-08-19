package com.parapharmacie.parapharmacie_backend.controller;

import com.parapharmacie.parapharmacie_backend.dto.*;
import com.parapharmacie.parapharmacie_backend.service.CommandeService;
import com.parapharmacie.parapharmacie_backend.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/commandes")
@CrossOrigin(origins = "http://localhost:4200")
public class CommandeController {

    @Autowired
    private CommandeService commandeService;

    @Autowired
    private JwtService jwtService;

    /**
     * Créer une nouvelle commande
     */
    @PostMapping
    public ResponseEntity<?> createCommande(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CreateCommandeRequest request) {

        System.out.println("🛒 POST /api/commandes - Création commande");
        System.out.println("💰 Montant: " + request.getMontantTotal() + " TND");
        System.out.println("🏠 Adresse: " + request.getAdresseLivraison());
        System.out.println("💳 Méthode: " + request.getMethodePaiement());

        try {
            // Extraire et valider le token
            String token = authHeader.replace("Bearer ", "");
            String userEmail = jwtService.extractEmail(token);

            if (!jwtService.isTokenValid(token)) {
                System.out.println("❌ Token invalide");
                return ResponseEntity.status(401).body(new AuthResponse("Token invalide"));
            }

            System.out.println("✅ Token valide pour: " + userEmail);

            // Créer la commande
            CommandeResponse response = commandeService.createCommande(userEmail, request);

            System.out.println("🎉 Commande créée: " + response.getReferenceCommande());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("❌ Erreur création commande: " + e.getMessage());
            return ResponseEntity.badRequest().body(new AuthResponse("Erreur: " + e.getMessage()));
        }
    }

    /**
     * Récupérer toutes les commandes de l'utilisateur
     */
    @GetMapping
    public ResponseEntity<?> getUserCommandes(@RequestHeader("Authorization") String authHeader) {

        System.out.println("📋 GET /api/commandes - Récupération commandes utilisateur");

        try {
            // Extraire et valider le token
            String token = authHeader.replace("Bearer ", "");
            String userEmail = jwtService.extractEmail(token);

            if (!jwtService.isTokenValid(token)) {
                System.out.println("❌ Token invalide");
                return ResponseEntity.status(401).body(new AuthResponse("Token invalide"));
            }

            System.out.println("✅ Token valide pour: " + userEmail);

            // Récupérer les commandes
            List<CommandeResponse> commandes = commandeService.getUserCommandes(userEmail);

            System.out.println("📦 " + commandes.size() + " commande(s) trouvée(s)");
            return ResponseEntity.ok(commandes);

        } catch (Exception e) {
            System.out.println("❌ Erreur récupération commandes: " + e.getMessage());
            return ResponseEntity.badRequest().body(new AuthResponse("Erreur: " + e.getMessage()));
        }
    }

    /**
     * Récupérer une commande spécifique par ID
     */
    @GetMapping("/{commandeId}")
    public ResponseEntity<?> getCommandeById(
            @PathVariable Long commandeId,
            @RequestHeader("Authorization") String authHeader) {

        System.out.println("🔍 GET /api/commandes/" + commandeId);

        try {
            // Extraire et valider le token
            String token = authHeader.replace("Bearer ", "");
            String userEmail = jwtService.extractEmail(token);

            if (!jwtService.isTokenValid(token)) {
                System.out.println("❌ Token invalide");
                return ResponseEntity.status(401).body(new AuthResponse("Token invalide"));
            }

            System.out.println("✅ Token valide pour: " + userEmail);

            // Récupérer la commande
            Optional<CommandeResponse> commandeOptional = commandeService.getCommandeById(commandeId, userEmail);

            if (commandeOptional.isEmpty()) {
                System.out.println("❌ Commande non trouvée: " + commandeId);
                return ResponseEntity.notFound().build();
            }

            CommandeResponse commande = commandeOptional.get();
            System.out.println("✅ Commande trouvée: " + commande.getReferenceCommande());
            return ResponseEntity.ok(commande);

        } catch (Exception e) {
            System.out.println("❌ Erreur récupération commande: " + e.getMessage());
            return ResponseEntity.badRequest().body(new AuthResponse("Erreur: " + e.getMessage()));
        }
    }

    /**
     * Endpoint de test
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        System.out.println("🧪 GET /api/commandes/test");
        return ResponseEntity.ok("🎉 Commande Controller fonctionne parfaitement !");
    }

    /**
     * Endpoint pour obtenir la clé publique Stripe
     */
    @GetMapping("/stripe/public-key")
    public ResponseEntity<?> getStripePublicKey() {
        System.out.println("🔑 GET /api/commandes/stripe/public-key");

        // Cette clé sera utilisée côté frontend
        String publicKey = "pk_test_51Rxq8dA5EN7TQfnHkyMM8Q98dyGhX0fT5wC0ljFAJAeBa4VI1Nc3jc666bNSQDpt0u0JbmLniQfElPYL4SrPZf6p009FLEEh0i";

        return ResponseEntity.ok(new StripePublicKeyResponse(publicKey));
    }

    /**
     * Classe pour la réponse de la clé publique
     */
    public static class StripePublicKeyResponse {
        private String publicKey;

        public StripePublicKeyResponse(String publicKey) {
            this.publicKey = publicKey;
        }

        public String getPublicKey() { return publicKey; }
        public void setPublicKey(String publicKey) { this.publicKey = publicKey; }
    }
}