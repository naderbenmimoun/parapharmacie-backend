package com.parapharmacie.parapharmacie_backend.repository;

import com.parapharmacie.parapharmacie_backend.entity.CommandeItem;
import com.parapharmacie.parapharmacie_backend.entity.Commande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommandeItemRepository extends JpaRepository<CommandeItem, Long> {

    // Trouver tous les items d'une commande
    List<CommandeItem> findByCommande(Commande commande);

    // Trouver tous les items d'une commande par ID
    List<CommandeItem> findByCommandeId(Long commandeId);

    // Trouver les produits les plus vendus
    @Query("SELECT ci.productId, ci.productTitle, SUM(ci.quantite) as totalQuantite " +
            "FROM CommandeItem ci " +
            "GROUP BY ci.productId, ci.productTitle " +
            "ORDER BY totalQuantite DESC")
    List<Object[]> findTopSellingProducts();

    // Compter le nombre total d'items vendus pour un produit
    @Query("SELECT SUM(ci.quantite) FROM CommandeItem ci WHERE ci.productId = :productId")
    Long countTotalQuantitySoldForProduct(@Param("productId") Long productId);
}
