package com.filmoji.backend.user;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.filmoji.backend.movie.Genre;
import com.filmoji.backend.movie.Movie;
import com.filmoji.backend.movie.MovieRepository;
import com.filmoji.backend.security.FilmojiUserPrincipal;
import com.filmoji.backend.service.UserProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    // Curated TMDB IDs for the onboarding swipe deck (ported from filmoji-test)
    private static final List<Integer> ONBOARDING_TMDB_IDS = List.of(
        155, 194, 496243, 120467, 157336, 27578, 419430, 129, 76341, 38,
        546554, 545611, 598, 376867, 2493, 438631, 399055, 9603, 1417, 372058
    );

    private final UserRepository userRepository;
    private final UserProfileService userProfileService;
    private final MovieRepository movieRepository;
    private final UserInteractionRepository interactionRepository;

    public UserController(UserRepository userRepository,
                          UserProfileService userProfileService,
                          MovieRepository movieRepository,
                          UserInteractionRepository interactionRepository) {
        this.userRepository        = userRepository;
        this.userProfileService    = userProfileService;
        this.movieRepository       = movieRepository;
        this.interactionRepository = interactionRepository;
    }

    /** GET /api/users/me — returns onboarding status for the current user */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(
            @AuthenticationPrincipal FilmojiUserPrincipal principal) {

        if (principal == null) return ResponseEntity.status(401).build();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("onboardingComplete", principal.isOnboardingComplete());
        res.put("email",              principal.getEmail());
        res.put("displayName",        principal.getDisplayName());
        return ResponseEntity.ok(res);
    }

    /**
     * POST /api/users/onboarding
     * Body: { "answers": { "q1": 0, "q2": 2, ... }, "scores": { "drama": 3, "comedy": 1, ... } }
     *
     * Builds the user's initial profile vector from the quiz scores.
     * Does NOT mark onboarding complete — that happens after the swipe phase.
     */
    @PostMapping("/onboarding")
    public ResponseEntity<Void> submitQuiz(
            @AuthenticationPrincipal FilmojiUserPrincipal principal,
            @RequestBody Map<String, Object> body) {

        if (principal == null) return ResponseEntity.status(401).build();

        Map<String, Object> answers = extractMap(body, "answers");
        Map<String, Integer> scores = extractIntegerMap(body, "scores");

        try {
            userProfileService.initializeFromQuiz(principal.getUser(), answers, scores);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize quiz answers for user {}", principal.getUserId(), e);
            return ResponseEntity.internalServerError().build();
        }

        log.info("Quiz submitted for user {}", principal.getUserId());
        return ResponseEntity.ok().build();
    }

    /**
     * GET /api/users/onboarding/swipe-deck
     * Returns the curated movie list filtered to titles present in the local DB.
     */
    @GetMapping("/onboarding/swipe-deck")
    public ResponseEntity<List<Map<String, Object>>> getSwipeDeck(
            @AuthenticationPrincipal FilmojiUserPrincipal principal) {

        if (principal == null) return ResponseEntity.status(401).build();

        List<Map<String, Object>> deck = new ArrayList<>();
        for (Integer tmdbId : ONBOARDING_TMDB_IDS) {
            movieRepository.findByTmdbIdWithGenres(tmdbId).ifPresent(m -> {
                Map<String, Object> dto = new LinkedHashMap<>();
                dto.put("tmdbId",      m.getTmdbId());
                dto.put("title",       m.getTitle());
                dto.put("releaseYear", m.getReleaseYear());
                dto.put("posterUrl",   m.getPosterUrl());
                dto.put("genres",      m.getGenres().stream().map(Genre::getName).sorted().toList());
                deck.add(dto);
            });
        }
        return ResponseEntity.ok(deck);
    }

    /**
     * POST /api/users/onboarding/swipes
     * Body: { "swipes": [{ "tmdbId": 155, "liked": true }, ...] }
     *
     * Records each swipe as a UserInteraction, updates the profile vector
     * via online learning, and marks onboarding as complete.
     */
    @PostMapping("/onboarding/swipes")
    public ResponseEntity<Map<String, Object>> submitSwipes(
            @AuthenticationPrincipal FilmojiUserPrincipal principal,
            @RequestBody Map<String, Object> body) {

        if (principal == null) return ResponseEntity.status(401).build();

        List<Map<String, Object>> swipes = extractList(body, "swipes");
        User user = principal.getUser();

        int processed = 0;
        for (Map<String, Object> swipe : swipes) {
            Integer tmdbId = asInt(swipe.get("tmdbId"));
            Boolean liked  = swipe.get("liked") instanceof Boolean b ? b : null;
            if (tmdbId == null || liked == null) continue;

            Optional<Movie> movieOpt = movieRepository.findByTmdbId(tmdbId);
            if (movieOpt.isEmpty()) {
                log.warn("Onboarding swipe for unknown TMDB id {}", tmdbId);
                continue;
            }
            Movie movie = movieOpt.get();

            UserInteraction interaction = new UserInteraction();
            interaction.setUser(user);
            interaction.setMovie(movie);
            interaction.setInteractionType(liked ? "swipe_right" : "swipe_left");
            interaction.setEmojiContext("onboarding");
            interaction.setCreatedAt(LocalDateTime.now());
            interactionRepository.save(interaction);

            userProfileService.updateProfileFromInteraction(user, movie, liked);
            processed++;
        }

        user.setOnboardingComplete(true);
        userRepository.save(user);

        log.info("Onboarding complete for user {}. Processed {} swipes.", principal.getUserId(), processed);

        return ResponseEntity.ok(Map.of("processed", processed));
    }

    // ── Body parsing helpers ──

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractMap(Map<String, Object> body, String key) {
        Object val = body.get(key);
        return val instanceof Map ? (Map<String, Object>) val : Map.of();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Integer> extractIntegerMap(Map<String, Object> body, String key) {
        Object val = body.get(key);
        if (!(val instanceof Map)) return Map.of();
        Map<String, Object> raw = (Map<String, Object>) val;
        Map<String, Integer> result = new HashMap<>();
        raw.forEach((k, v) -> {
            if (v instanceof Number n) result.put(k, n.intValue());
        });
        return result;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractList(Map<String, Object> body, String key) {
        Object val = body.get(key);
        return val instanceof List ? (List<Map<String, Object>>) val : List.of();
    }

    private Integer asInt(Object v) {
        return v instanceof Number n ? n.intValue() : null;
    }
}
