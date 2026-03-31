package com.filmoji.backend.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Converts float[] (Java) <-> pgvector string format "[0.1,0.2,...]" (PostgreSQL).
 */
@Converter
public class VectorConverter implements AttributeConverter<float[], String> {

    @Override
    public String convertToDatabaseColumn(float[] vector) {
        if (vector == null) return null;
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            sb.append(vector[i]);
            if (i < vector.length - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    @Override
    public float[] convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return null;
        String clean = dbData.replaceAll("[\\[\\]\\s]", "");
        String[] parts = clean.split(",");
        float[] vector = new float[parts.length];
        for (int i = 0; i < parts.length; i++) {
            vector[i] = Float.parseFloat(parts[i]);
        }
        return vector;
    }
}
