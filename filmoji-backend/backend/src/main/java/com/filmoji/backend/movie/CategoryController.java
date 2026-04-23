package com.filmoji.backend.movie;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.time.Instant;
import java.time.Duration;

@RestController
@RequestMapping({"/categories", "/api/categories"})
public class CategoryController {

    private final GenreRepository genreRepository;

    public CategoryController(GenreRepository genreRepository) {
        this.genreRepository = genreRepository;
        this.cache = new AtomicReference<>(null);
    }

    @GetMapping("/counts")
    public List<GenreCount> counts() {
        // Simple in-memory cache with TTL to avoid hitting DB on every request
        final Duration TTL = Duration.ofSeconds(60);
        CachedValue cached = cache.get();
        Instant now = Instant.now();
        if (cached != null && now.isBefore(cached.expiresAt)) {
            return cached.value;
        }

        List<GenreCount> counts = genreRepository.findGenreCounts();
        CachedValue next = new CachedValue(counts, now.plus(TTL));
        cache.set(next);
        return counts;
    }

    // Simple holder types for cache
    private final AtomicReference<CachedValue> cache;

    private static class CachedValue {
        final List<GenreCount> value;
        final Instant expiresAt;

        CachedValue(List<GenreCount> value, Instant expiresAt) {
            this.value = value;
            this.expiresAt = expiresAt;
        }
    }
}
