package com.filmoji.backend.user;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.filmoji.backend.security.FilmojiUserPrincipal;
import com.filmoji.backend.service.UserProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    // Genre name → score key (matches UserProfileService.buildProfileText keys)
    private static final Map<String, String> GENRE_TO_SCORE_KEY = Map.of(
        "Sci-Fi",      "sci_fi",
        "Drama",       "drama",
        "Comedy",      "comedy",
        "Horror",      "thriller",
        "Intense",     "intense",
        "Thoughtful",  "intellectual",
        "Adventure",   "adventure",
        "Romance",     "romance",
        "Action",      "action",
        "Animation",   "feel_good"
    );

    private final UserRepository userRepository;
    private final UserProfileService userProfileService;

    public UserController(UserRepository userRepository, UserProfileService userProfileService) {
        this.userRepository     = userRepository;
        this.userProfileService = userProfileService;
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
     * Body: { "genres": ["Sci-Fi", "Drama"], "likedVibes": [{"cat":"Sci-Fi","prompt":"..."}] }
     *
     * Builds a profile vector from the selected genres + vibe data,
     * saves it to UserProfile, and marks the user's onboarding as complete.
     */
    @PostMapping("/onboarding")
    public ResponseEntity<Void> completeOnboarding(
            @AuthenticationPrincipal FilmojiUserPrincipal principal,
            @RequestBody Map<String, Object> body) {

        if (principal == null) return ResponseEntity.status(401).build();

        @SuppressWarnings("unchecked")
        List<String> genres = (List<String>) body.getOrDefault("genres", List.of());

        @SuppressWarnings("unchecked")
        List<Map<String, String>> likedVibes = (List<Map<String, String>>) body.getOrDefault("likedVibes", List.of());

        // Build scores: each selected genre contributes 2 points, each liked vibe adds 1
        Map<String, Integer> scores = new HashMap<>();
        for (String genre : genres) {
            String key = GENRE_TO_SCORE_KEY.getOrDefault(genre, genre.toLowerCase());
            scores.merge(key, 2, Integer::sum);
        }
        for (Map<String, String> vibe : likedVibes) {
            String cat = vibe.getOrDefault("cat", "");
            String key = GENRE_TO_SCORE_KEY.getOrDefault(cat, cat.toLowerCase());
            if (!key.isBlank()) scores.merge(key, 1, Integer::sum);
        }

        Map<String, Object> quizAnswers = new LinkedHashMap<>();
        quizAnswers.put("genres",     genres);
        quizAnswers.put("likedVibes", likedVibes);

        try {
            userProfileService.initializeFromQuiz(principal.getUser(), quizAnswers, scores);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize quiz answers for user {}", principal.getUserId(), e);
            return ResponseEntity.internalServerError().build();
        }

        // Mark onboarding complete
        User user = principal.getUser();
        user.setOnboardingComplete(true);
        userRepository.save(user);

        log.info("Onboarding complete for user {}", principal.getUserId());
        return ResponseEntity.ok().build();
    }
}
