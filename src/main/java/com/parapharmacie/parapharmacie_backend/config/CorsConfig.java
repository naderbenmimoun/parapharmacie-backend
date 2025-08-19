package com.parapharmacie.parapharmacie_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Autoriser les requêtes depuis le frontend Angular
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));

        // Autoriser toutes les méthodes HTTP
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Autoriser tous les headers
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Autoriser les credentials (pour JWT)
        configuration.setAllowCredentials(true);

        // Appliquer cette configuration à toutes les routes
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        System.out.println("✅ Configuration CORS activée pour http://localhost:4200");

        return source;
    }
}