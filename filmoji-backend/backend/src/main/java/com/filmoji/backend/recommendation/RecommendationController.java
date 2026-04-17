package com.filmoji.backend.recommendation;

import com.filmoji.backend.movie.Movie;
import com.filmoji.backend.security.FilmojiUserPrincipal;
import com.filmoji.backend.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.filmoji.backend.movie.Genre;

import java.util.*;

/**
 * POST /api/recommendations
 * Body: { "emojis": "😊❤️" }
 * Returns top 3 movie recommendations.
 */
@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private static final Logger log = LoggerFactory.getLogger(RecommendationController.class);

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    /**
     * 
     * @param principal Object: FilmojiUserPrincipal, includes onboarding status, UUID, user details
     * @param body Requests: Seemed Like emoji && content of userInput
     * @return A ResponseEntity: Stuctured with A List contains several Mapping relationship with 
     * ```java
     *  public RecommendationService(MovieRepository movieRepository,
                                  EmbeddingService embeddingService,
                                  UserProfileService userProfileService,
                                  TmdbService tmdbService) {
            this.movieRepository    = movieRepository;
            this.embeddingService   = embeddingService;
            this.userProfileService = userProfileService;
            this.tmdbService        = tmdbService;
        }
     * These should be the attributes of what we have 🔼
     */
    @PostMapping
    public ResponseEntity<List<Map<String, Object>>> getRecommendations(
            @AuthenticationPrincipal FilmojiUserPrincipal principal,
            @RequestBody Map<String, String> body) {

        String emojis = body.getOrDefault("emojis", "");

        if (emojis.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        User user = (principal != null) ? principal.getUser() : null;
        log.info("Recommendation request for user {} with emojis: {}",
                  user != null ? user.getId() : "anonymous", emojis);

        List<RecommendationService.RecommendationResult> results =
                recommendationService.recommend(user, emojis, 3);

        List<Map<String, Object>> response = new ArrayList<>();
        for (RecommendationService.RecommendationResult result : results) {
            response.add(movieToResponse(result.getMovie(), result.getWhyRecommended()));
        }

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> movieToResponse(Movie movie, String whyRecommended) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id",             movie.getId());
        map.put("tmdbId",         movie.getTmdbId());
        map.put("title",          movie.getTitle());
        map.put("synopsis",       movie.getSynopsis() != null ? movie.getSynopsis() : "");
        map.put("genres", 
            movie.getGenres() != null 
            ? movie.getGenres().stream()
                .map(Genre::getName)
                .toList()
            : List.of());
        map.put("posterUrl",      movie.getPosterUrl() != null ? movie.getPosterUrl() : "");
        map.put("trailerKey",     movie.getTrailerKey() != null ? movie.getTrailerKey() : "");
        map.put("releaseYear",    movie.getReleaseYear());
        map.put("rating",         movie.getRating());
        map.put("language",       movie.getLanguage());
        map.put("whyRecommended", whyRecommended);
        return map;
    }
}
