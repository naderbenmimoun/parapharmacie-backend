package com.parapharmacie.parapharmacie_backend.controller;
import com.parapharmacie.parapharmacie_backend.dto.*;
import com.parapharmacie.parapharmacie_backend.service.UserManagementService;
import com.parapharmacie.parapharmacie_backend.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:4200")
public class UserManagementController {

    @Autowired
    private UserManagementService userManagementService;

    @Autowired
    private JwtService jwtService;

    // Demander reset mot de passe
    @PostMapping("/reset-password-request")
    public ResponseEntity<AuthResponse> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        System.out.println("🌐 POST /api/user/reset-password-request");
        System.out.println("📧 Email: " + request.getEmail());

        AuthResponse response = userManagementService.requestPasswordReset(request);

        // Modifier la réponse pour ne pas envoyer le code dans le message
        if (response.getMessage().contains("envoyé") || response.getMessage().contains("CODE")) {
            // remplacer le message par un message générique
            String message = "Code de reset envoyé par email à : " + request.getEmail();
            return ResponseEntity.ok(new AuthResponse(message));
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }


    // Confirmer reset mot de passe
    @PostMapping("/reset-password-confirm")
    public ResponseEntity<AuthResponse> confirmPasswordReset(@Valid @RequestBody PasswordResetConfirm request) {
        System.out.println("🌐 POST /api/user/reset-password-confirm");
        System.out.println("📧 Email: " + request.getEmail());
        System.out.println("🔢 Code: " + request.getResetCode());

        AuthResponse response = userManagementService.confirmPasswordReset(request);

        if (response.getMessage().contains("succès")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Modifier profil (nécessite JWT)
    @PutMapping("/profile")
    public ResponseEntity<AuthResponse> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UpdateProfileRequest request) {

        System.out.println("🌐 PUT /api/user/profile");
        System.out.println("👤 Nouveau nom: " + request.getNom());

        try {
            // Extraire le token du header Authorization
            String token = authHeader.replace("Bearer ", "");
            String email = jwtService.extractEmail(token);

            if (!jwtService.isTokenValid(token)) {
                System.out.println("❌ Token invalide");
                return ResponseEntity.status(401).body(new AuthResponse("Token invalide"));
            }

            System.out.println("✅ Token valide pour: " + email);

            AuthResponse response = userManagementService.updateProfile(email, request);

            if (response.getMessage().contains("succès")) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            System.out.println("❌ Erreur token: " + e.getMessage());
            return ResponseEntity.status(401).body(new AuthResponse("Token manquant ou invalide"));
        }
    }

    // Changer mot de passe (nécessite JWT)
    @PutMapping("/change-password")
    public ResponseEntity<AuthResponse> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody ChangePasswordRequest request) {

        System.out.println("🌐 PUT /api/user/change-password");

        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtService.extractEmail(token);

            if (!jwtService.isTokenValid(token)) {
                System.out.println("❌ Token invalide");
                return ResponseEntity.status(401).body(new AuthResponse("Token invalide"));
            }

            System.out.println("✅ Token valide pour: " + email);

            AuthResponse response = userManagementService.changePassword(email, request);

            if (response.getMessage().contains("succès")) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            System.out.println("❌ Erreur token: " + e.getMessage());
            return ResponseEntity.status(401).body(new AuthResponse("Token manquant ou invalide"));
        }
    }

    // Obtenir profil utilisateur (nécessite JWT)
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestHeader("Authorization") String authHeader) {
        System.out.println("🌐 GET /api/user/profile");

        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtService.extractEmail(token);

            if (!jwtService.isTokenValid(token)) {
                System.out.println("❌ Token invalide");
                return ResponseEntity.status(401).body(new AuthResponse("Token invalide"));
            }

            System.out.println("✅ Token valide pour: " + email);

            UserProfileResponse profile = userManagementService.getUserProfile(email);

            if (profile != null) {
                return ResponseEntity.ok(profile);
            } else {
                return ResponseEntity.badRequest().body(new AuthResponse("Profil non trouvé"));
            }

        } catch (Exception e) {
            System.out.println("❌ Erreur token: " + e.getMessage());
            return ResponseEntity.status(401).body(new AuthResponse("Token manquant ou invalide"));
        }
    }

    // Test du controller
  /*  @GetMapping("/test")
    public ResponseEntity<String> test() {
        System.out.println("🧪 GET /api/user/test appelé");
        return ResponseEntity.ok("🎉 User Management Controller fonctionne !");
    }*/
}