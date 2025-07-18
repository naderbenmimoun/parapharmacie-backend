package com.parapharmacie.parapharmacie_backend.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Sexe {
    HOMME("HOMME"),
    FEMME("FEMME");

    private final String value;

    Sexe(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static Sexe fromValue(String value) {
        for (Sexe sexe : Sexe.values()) {
            if (sexe.value.equals(value)) {
                return sexe;
            }
        }
        throw new IllegalArgumentException("Valeur invalide pour Sexe: " + value);
    }
}
