package com.parapharmacie.parapharmacie_backend.service;

import com.parapharmacie.parapharmacie_backend.dto.AuthResponse;
import com.parapharmacie.parapharmacie_backend.dto.LoginRequest;
import com.parapharmacie.parapharmacie_backend.dto.SignupRequest;
import com.parapharmacie.parapharmacie_backend.entity.User;
import com.parapharmacie.parapharmacie_backend.entity.Sexe;
import com.parapharmacie.parapharmacie_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Inscription d'un nouvel utilisateur
    public AuthResponse signup(SignupRequest request) {
        System.out.println("=== 📝 DÉBUT INSCRIPTION ===");
        System.out.println("📧 Email: " + request.getEmail());
        System.out.println("👤 Nom: " + request.getNom());
        System.out.println("🚻 Sexe: " + request.getSexe());

        try {
            // Vérifier si l'email existe déjà
            if (userRepository.existsByEmail(request.getEmail())) {
                System.out.println("❌ Email déjà utilisé: " + request.getEmail());
                return new AuthResponse("Email déjà utilisé");
            }

            // Créer un nouvel utilisateur
            User user = new User();
            user.setNom(request.getNom());
            user.setEmail(request.getEmail());
            user.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));

            // Convertir String en Enum Sexe
            try {
                user.setSexe(Sexe.valueOf(request.getSexe().toUpperCase()));
            } catch (IllegalArgumentException e) {
                System.out.println("❌ Sexe invalide: " + request.getSexe());
                return new AuthResponse("Sexe invalide. Utilisez HOMME ou FEMME");
            }

            System.out.println("🔒 Mot de passe chiffré: " + user.getMotDePasse().substring(0, 10) + "...");

            // Sauvegarder l'utilisateur
            User savedUser = userRepository.save(user);
            System.out.println("💾 Utilisateur sauvegardé avec ID: " + savedUser.getId());

            // Générer le token JWT
            String token = jwtService.generateToken(savedUser.getEmail());

            System.out.println("✅ INSCRIPTION RÉUSSIE pour " + savedUser.getEmail());
            return new AuthResponse(token, savedUser.getEmail(), savedUser.getNom(), savedUser.getSexe().name());

        } catch (Exception e) {
            System.out.println("❌ Erreur lors de l'inscription: " + e.getMessage());
            e.printStackTrace();
            return new AuthResponse("Erreur lors de l'inscription: " + e.getMessage());
        }
    }

    // Connexion d'un utilisateur existant
    public AuthResponse login(LoginRequest request) {
        System.out.println("=== 🔐 DÉBUT CONNEXION ===");
        System.out.println("📧 Email: " + request.getEmail());

        try {
            // Chercher l'utilisateur par email
            Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

            if (userOptional.isEmpty()) {
                System.out.println("❌ Utilisateur non trouvé: " + request.getEmail());
                return new AuthResponse("Email ou mot de passe incorrect");
            }

            User user = userOptional.get();
            System.out.println("👤 Utilisateur trouvé: " + user.getNom());

            // Vérifier le mot de passe
            if (!passwordEncoder.matches(request.getMotDePasse(), user.getMotDePasse())) {
                System.out.println("❌ Mot de passe incorrect pour: " + request.getEmail());
                return new AuthResponse("Email ou mot de passe incorrect");
            }

            System.out.println("✅ Mot de passe correct !");

            // Générer le token JWT
            String token = jwtService.generateToken(user.getEmail());

            System.out.println("🎉 CONNEXION RÉUSSIE pour " + user.getEmail());
            return new AuthResponse(token, user.getEmail(), user.getNom(), user.getSexe().name());

        } catch (Exception e) {
            System.out.println("❌ Erreur lors de la connexion: " + e.getMessage());
            e.printStackTrace();
            return new AuthResponse("Erreur lors de la connexion");
        }
    }

    // Vérifier si un utilisateur existe par email
    public boolean userExists(String email) {
        return userRepository.existsByEmail(email);
    }

    // Récupérer un utilisateur par email
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}