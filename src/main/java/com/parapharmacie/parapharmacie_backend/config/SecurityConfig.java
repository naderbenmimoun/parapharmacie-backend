package com.parapharmacie.parapharmacie_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()                      // Routes d'auth libres
                        .requestMatchers("/api/users/**").permitAll()                     // Routes users libres (temporaire)
                        .requestMatchers("/api/user/reset-password-request").permitAll()  // Reset password libre
                        .requestMatchers("/api/user/reset-password-confirm").permitAll()  // Confirm reset libre
                        .requestMatchers("/api/user/test").permitAll()                    // Test libre
                        .requestMatchers("/api/user/profile").permitAll()                 // Profil libre (TEMPORAIRE)
                        .requestMatchers("/api/user/change-password").permitAll()         // Change password libre (TEMPORAIRE)
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}