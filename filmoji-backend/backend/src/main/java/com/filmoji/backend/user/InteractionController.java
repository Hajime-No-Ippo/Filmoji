package com.filmoji.backend.user;

import com.filmoji.backend.movie.Movie;
import com.filmoji.backend.movie.MovieRepository;
import com.filmoji.backend.security.FilmojiUserPrincipal;
import com.filmoji.backend.service.UserProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/interactions")
public class InteractionController {

    private static final Logger log = LoggerFactory.getLogger(InteractionController.class);

    private final UserInteractionRepository interactionRepository;
    private final MovieRepository movieRepository;
    private final UserProfileService userProfileService;

    public InteractionController(UserInteractionRepository interactionRepository,
                                  MovieRepository movieRepository,
                                  UserProfileService userProfileService) {
        this.interactionRepository = interactionRepository;
        this.movieRepository       = movieRepository;
        this.userProfileService    = userProfileService;
    }

    /**
     * POST /api/interactions
     * Body: { "movieId": 5, "type": "like" | "dislike" | "watch", "emojiContext": "😊" }
     */
    @PostMapping
    public ResponseEntity<Void> record(
            @AuthenticationPrincipal FilmojiUserPrincipal principal,
            @RequestBody Map<String, Object> body) {

        if (principal == null) return ResponseEntity.status(401).build();

        Integer movieId = (Integer) body.get("movieId");
        String type     = (String) body.getOrDefault("type", "");
        String emoji    = (String) body.getOrDefault("emojiContext", "");

        if (movieId == null || type.isBlank()) return ResponseEntity.badRequest().build();

        Movie movie = movieRepository.findById(movieId).orElse(null);
        if (movie == null) return ResponseEntity.notFound().build();

        Optional<UserInteraction> existing =
                interactionRepository.findByUserIdAndMovieId(principal.getUserId(), movieId);

        if (existing.isPresent()) {
            UserInteraction interaction = existing.get();
            String previousType = interaction.getInteractionType();

            // Same type clicked again — no-op (frontend already toggles UI)
            if (previousType.equals(type)) {
                return ResponseEntity.ok().build();
            }

            // Type changed (like → dislike or vice versa) — update and re-adjust vector
            interaction.setInteractionType(type);
            interaction.setEmojiContext(emoji);
            interactionRepository.save(interaction);

            // Reverse previous effect then apply new one
            if ((previousType.equals("like") || previousType.equals("dislike")) &&
                (type.equals("like") || type.equals("dislike"))) {
                userProfileService.updateProfileFromInteraction(principal.getUser(), movie, previousType.equals("dislike")); // reverse
                userProfileService.updateProfileFromInteraction(principal.getUser(), movie, type.equals("like"));           // apply new
                log.info("User {} changed interaction on movie {} from {} to {}", principal.getUserId(), movieId, previousType, type);
            }
        } else {
            // New interaction
            UserInteraction interaction = new UserInteraction();
            interaction.setUser(principal.getUser());
            interaction.setMovie(movie);
            interaction.setInteractionType(type);
            interaction.setEmojiContext(emoji);
            interactionRepository.save(interaction);

            if (type.equals("like") || type.equals("dislike")) {
                userProfileService.updateProfileFromInteraction(principal.getUser(), movie, type.equals("like"));
                log.info("User {} {} movie {}", principal.getUserId(), type, movieId);
            }
        }

        return ResponseEntity.ok().build();
    }
}
