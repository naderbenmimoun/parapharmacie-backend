package com.parapharmacie.parapharmacie_backend.repository;

import com.parapharmacie.parapharmacie_backend.entity.Commande;
import com.parapharmacie.parapharmacie_backend.entity.User;
import com.parapharmacie.parapharmacie_backend.entity.StatutCommande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommandeRepository extends JpaRepository<Commande, Long> {

    // Trouver toutes les commandes d'un utilisateur, triées par date décroissante
    List<Commande> findByUserOrderByDateCreationDesc(User user);

    // Trouver les commandes d'un utilisateur par email
    @Query("SELECT c FROM Commande c WHERE c.user.email = :email ORDER BY c.dateCreation DESC")
    List<Commande> findByUserEmailOrderByDateCreationDesc(@Param("email") String email);

    // Trouver une commande par son ID Stripe PaymentIntent
    Optional<Commande> findByStripePaymentIntentId(String stripePaymentIntentId);

    // Trouver les commandes par statut
    List<Commande> findByStatutOrderByDateCreationDesc(StatutCommande statut);

    // Trouver une commande par référence
    Optional<Commande> findByReferenceCommande(String referenceCommande);

    // Compter les commandes d'un utilisateur
    long countByUser(User user);

    // Trouver les commandes récentes (derniers 30 jours)
    @Query("SELECT c FROM Commande c WHERE c.dateCreation >= CURRENT_TIMESTAMP - 30 DAY ORDER BY c.dateCreation DESC")
    List<Commande> findRecentCommandes();
}