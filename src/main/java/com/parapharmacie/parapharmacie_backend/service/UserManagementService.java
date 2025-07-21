package com.parapharmacie.parapharmacie_backend.service;

import com.parapharmacie.parapharmacie_backend.dto.*;
import com.parapharmacie.parapharmacie_backend.entity.User;
import com.parapharmacie.parapharmacie_backend.entity.Sexe;
import com.parapharmacie.parapharmacie_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class UserManagementService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Générer un code de reset aléatoire
    private String generateResetCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // Code 6 chiffres
        return String.valueOf(code);
    }

    // Demander reset mot de passe
    public AuthResponse requestPasswordReset(PasswordResetRequest request) {
        System.out.println("🔄 Demande de reset pour: " + request.getEmail());

        try {
            Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

            if (userOptional.isEmpty()) {
                System.out.println("❌ Utilisateur non trouvé: " + request.getEmail());
                return new AuthResponse("Utilisateur non trouvé");
            }

            User user = userOptional.get();

            // Générer code de reset
            String resetCode = generateResetCode();
            user.setResetCode(resetCode);
            user.setResetCodeExpiration(LocalDateTime.now().plusHours(1)); // 1h d'expiration

            userRepository.save(user);

            System.out.println("✅ Code de reset généré: " + resetCode);
            System.out.println("📧 (Simulation) Email envoyé à: " + request.getEmail());

            return new AuthResponse("Code de reset envoyé par email (CODE: " + resetCode + ")");

        } catch (Exception e) {
            System.out.println("❌ Erreur demande reset: " + e.getMessage());
            return new AuthResponse("Erreur lors de la demande de reset");
        }
    }

    // Confirmer reset mot de passe
    @Transactional
    public AuthResponse confirmPasswordReset(PasswordResetConfirm request) {
        System.out.println("🔐 Confirmation reset pour: " + request.getEmail());
        System.out.println("🔢 Code fourni: " + request.getResetCode());

        try {
            Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

            if (userOptional.isEmpty()) {
                System.out.println("❌ Utilisateur non trouvé");
                return new AuthResponse("Utilisateur non trouvé");
            }

            User user = userOptional.get();

            // Vérifier le code de reset
            if (user.getResetCode() == null || !user.getResetCode().equals(request.getResetCode())) {
                System.out.println("❌ Code de reset invalide");
                return new AuthResponse("Code de reset invalide");
            }

            // Vérifier l'expiration
            if (user.getResetCodeExpiration() == null ||
                    LocalDateTime.now().isAfter(user.getResetCodeExpiration())) {
                System.out.println("❌ Code de reset expiré");
                return new AuthResponse("Code de reset expiré");
            }

            // Changer le mot de passe
            user.setMotDePasse(passwordEncoder.encode(request.getNouveauMotDePasse()));
            user.setResetCode(null);
            user.setResetCodeExpiration(null);

            userRepository.save(user);

            System.out.println("✅ Mot de passe changé avec succès");
            return new AuthResponse("Mot de passe changé avec succès");

        } catch (Exception e) {
            System.out.println("❌ Erreur confirmation reset: " + e.getMessage());
            return new AuthResponse("Erreur lors du reset");
        }
    }

    // Modifier le profil
    @Transactional
    public AuthResponse updateProfile(String currentEmail, UpdateProfileRequest request) {
        System.out.println("👤 Modification profil pour: " + currentEmail);

        try {
            Optional<User> userOptional = userRepository.findByEmail(currentEmail);

            if (userOptional.isEmpty()) {
                return new AuthResponse("Utilisateur non trouvé");
            }

            User user = userOptional.get();

            // Vérifier si le nouvel email est déjà utilisé (si différent)
            if (!currentEmail.equals(request.getEmail())) {
                if (userRepository.existsByEmail(request.getEmail())) {
                    return new AuthResponse("Nouvel email déjà utilisé");
                }
            }

            // Mettre à jour les champs
            user.setNom(request.getNom());
            user.setEmail(request.getEmail());
            user.setSexe(Sexe.valueOf(request.getSexe().toUpperCase()));

            userRepository.save(user);

            System.out.println("✅ Profil mis à jour");
            return new AuthResponse("Profil mis à jour avec succès");

        } catch (Exception e) {
            System.out.println("❌ Erreur modification profil: " + e.getMessage());
            return new AuthResponse("Erreur lors de la modification");
        }
    }

    // Changer mot de passe
    @Transactional
    public AuthResponse changePassword(String email, ChangePasswordRequest request) {
        System.out.println("🔐 Changement mot de passe pour: " + email);

        try {
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isEmpty()) {
                return new AuthResponse("Utilisateur non trouvé");
            }

            User user = userOptional.get();

            // Vérifier l'ancien mot de passe
            if (!passwordEncoder.matches(request.getAncienMotDePasse(), user.getMotDePasse())) {
                System.out.println("❌ Ancien mot de passe incorrect");
                return new AuthResponse("Ancien mot de passe incorrect");
            }

            // Changer le mot de passe
            user.setMotDePasse(passwordEncoder.encode(request.getNouveauMotDePasse()));
            userRepository.save(user);

            System.out.println("✅ Mot de passe changé");
            return new AuthResponse("Mot de passe changé avec succès");

        } catch (Exception e) {
            System.out.println("❌ Erreur changement mot de passe: " + e.getMessage());
            return new AuthResponse("Erreur lors du changement");
        }
    }

    // Obtenir le profil utilisateur
    public UserProfileResponse getUserProfile(String email) {
        System.out.println("👤 Récupération profil pour: " + email);

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return null;
        }

        User user = userOptional.get();

        return new UserProfileResponse(
                user.getId(),
                user.getNom(),
                user.getEmail(),
                user.getSexe().name(),
                user.getDateCreation(),
                user.getDerniereConnexion()
        );
    }
}