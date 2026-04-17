package com.filmoji.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.Random;

/**
 * Calls the HuggingFace Inference API to get sentence embeddings
 * from sentence-transformers/all-MiniLM-L6-v2 (384 dimensions).
 */
@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);
    private static final int VECTOR_DIM = 384;

    @Value("${huggingface.api.token:dev-mode}")
    private String hfToken;

    @Value("${huggingface.model.url:https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2}")
    private String modelUrl;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public EmbeddingService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Get a 384-dimensional embedding for the given text.
     * Falls back to a pseudo-random unit vector if the API call fails.
     */

    public float[] getEmbedding(String text) {
        if (text == null || text.isBlank()) {
            return new float[VECTOR_DIM];
        }

        try {
            String json = objectMapper.writeValueAsString(Map.of("text", text));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://ai-service:8000/embed"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode arr = root.get("vector");

            float[] vector = new float[arr.size()];
            for (int i = 0; i < arr.size(); i++) {
                vector[i] = (float) arr.get(i).asDouble();
            }

            return vector;

        } catch (IOException | InterruptedException e) {
            log.error("Python embedding failed: {}", e.getMessage());
            return fallbackVector(text);
        }
    }

    private float[] parseEmbeddingResponse(String responseBody) throws IOException {
        JsonNode root = objectMapper.readTree(responseBody);
        float[] vector = new float[VECTOR_DIM];

        if (root.isArray()) {
            JsonNode first = root.get(0);
            if (first != null && first.isArray()) {
                for (int i = 0; i < Math.min(first.size(), VECTOR_DIM); i++) {
                    vector[i] = (float) first.get(i).asDouble();
                }
            } else if (first != null && first.isNumber()) {
                for (int i = 0; i < Math.min(root.size(), VECTOR_DIM); i++) {
                    vector[i] = (float) root.get(i).asDouble();
                }
            }
        }

        return vector;
    }

    public float[] normalize(float[] vector) {
        double norm = 0;
        for (float v : vector) norm += v * v;
        norm = Math.sqrt(norm);
        if (norm == 0) return vector;

        float[] normalized = new float[vector.length];
        for (int i = 0; i < vector.length; i++) {
            normalized[i] = (float) (vector[i] / norm);
        }
        return normalized;
    }

    public float[] weightedCombine(float[] a, float[] b, float weightA, float weightB) {
        if (a == null && b == null) return new float[VECTOR_DIM];
        if (a == null) return normalize(b);
        if (b == null) return normalize(a);

        float[] combined = new float[VECTOR_DIM];
        for (int i = 0; i < VECTOR_DIM; i++) {
            combined[i] = (a[i] * weightA) + (b[i] * weightB);
        }
        return normalize(combined);
    }

    public String vectorToString(float[] vector) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(vector[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    private float[] fallbackVector(String text) {
        log.warn("Using fallback vector for text (HuggingFace API unavailable)");
        Random rng = new Random(text.hashCode());
        float[] v = new float[VECTOR_DIM];
        for (int i = 0; i < VECTOR_DIM; i++) {
            v[i] = rng.nextFloat() * 2 - 1;
        }
        return normalize(v);
    }

    public int getVectorDim() {
        return VECTOR_DIM;
    }
}
