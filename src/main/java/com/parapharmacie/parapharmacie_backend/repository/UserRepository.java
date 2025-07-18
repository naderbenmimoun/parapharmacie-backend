package com.parapharmacie.parapharmacie_backend.repository;
import com.parapharmacie.parapharmacie_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface UserRepository extends JpaRepository<User,Long>   {

    // Méthode personnalisée pour trouver par email
    Optional<User> findByEmail(String email);

    // Méthode pour vérifier si un email existe
    boolean existsByEmail(String email);


}
