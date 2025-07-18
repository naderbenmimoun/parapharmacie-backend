package com.parapharmacie.parapharmacie_backend.controller;
import com.parapharmacie.parapharmacie_backend.entity.User;
import com.parapharmacie.parapharmacie_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        System.out.println("GET /api/users appelé");
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // POST - Créer un utilisateur
    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        System.out.println("POST /api/users appelé avec email: " + user.getEmail());

        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().build();
        }

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    // GET - Utilisateur par ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        System.out.println("GET /api/users/" + id + " appelé");
        Optional<User> user = userRepository.findById(id);

        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }



}
