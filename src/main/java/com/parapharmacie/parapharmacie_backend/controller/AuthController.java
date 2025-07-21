package com.parapharmacie.parapharmacie_backend.controller;

import com.parapharmacie.parapharmacie_backend.dto.AuthResponse;
import com.parapharmacie.parapharmacie_backend.dto.LoginRequest;
import com.parapharmacie.parapharmacie_backend.dto.SignupRequest;
import com.parapharmacie.parapharmacie_backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200") // Pour Angular plus tard
public class AuthController {

    @Autowired
    private AuthService authService;

    // Endpoint d'inscription
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        System.out.println("🌐 POST /api/auth/signup appelé");
        System.out.println("📊 Données reçues - Email: " + request.getEmail() + ", Nom: " + request.getNom());

        AuthResponse response = authService.signup(request);

        // Si le token est présent, l'inscription a réussi
        if (response.getToken() != null) {
            System.out.println("✅ Réponse d'inscription: Succès");
            return ResponseEntity.ok(response);
        } else {
            System.out.println("❌ Réponse d'inscription: Échec - " + response.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Endpoint de connexion
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        System.out.println("🌐 POST /api/auth/login appelé");
        System.out.println("📊 Tentative de connexion pour: " + request.getEmail());

        AuthResponse response = authService.login(request);

        // Si le token est présent, la connexion a réussi
        if (response.getToken() != null) {
            System.out.println("✅ Réponse de connexion: Succès");
            return ResponseEntity.ok(response);
        } else {
            System.out.println("❌ Réponse de connexion: Échec - " + response.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Endpoint de test
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        System.out.println("🧪 GET /api/auth/test appelé");
        return ResponseEntity.ok("🎉 Auth Controller fonctionne parfaitement !");
    }

    // Endpoint pour vérifier si un email existe
    @GetMapping("/check-email/{email}")
    public ResponseEntity<Boolean> checkEmail(@PathVariable String email) {
        System.out.println("🔍 Vérification email: " + email);
        boolean exists = authService.userExists(email);
        return ResponseEntity.ok(exists);
    }
}