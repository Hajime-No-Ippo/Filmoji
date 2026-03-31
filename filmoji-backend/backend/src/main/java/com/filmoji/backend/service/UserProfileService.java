package com.filmoji.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.filmoji.backend.movie.Movie;
import com.filmoji.backend.user.User;
import com.filmoji.backend.user.UserProfile;
import com.filmoji.backend.user.UserProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class UserProfileService {

    private static final Logger log = LoggerFactory.getLogger(UserProfileService.class);

    private static final float LIKE_LEARNING_RATE    = 0.1f;
    private static final float DISLIKE_LEARNING_RATE = 0.05f;
    private static final int   VECTOR_DIM            = 384;

    private final UserProfileRepository profileRepository;
    private final EmbeddingService embeddingService;
    private final ObjectMapper objectMapper;

    public UserProfileService(UserProfileRepository profileRepository,
                               EmbeddingService embeddingService) {
        this.profileRepository = profileRepository;
        this.embeddingService  = embeddingService;
        this.objectMapper      = new ObjectMapper();
    }

    @Transactional
    public UserProfile getOrCreateProfile(User user) {
        return profileRepository.findByUser(user).orElseGet(() -> {
            UserProfile profile = new UserProfile();
            profile.setUser(user);
            profile.setQuizAnswers("{}");
            return profileRepository.save(profile);
        });
    }

    @Transactional
    public UserProfile initializeFromQuiz(User user,
                                          Map<String, Object> quizAnswers,
                                          Map<String, Integer> scores) throws JsonProcessingException {
        UserProfile profile = getOrCreateProfile(user);
        profile.setQuizAnswers(objectMapper.writeValueAsString(quizAnswers));

        String profileText = buildProfileText(scores);
        log.info("Building profile vector from text: {}", profileText);

        float[] vector = embeddingService.getEmbedding(profileText);
        profile.setProfileVector(embeddingService.normalize(vector));
        profile.setUpdatedAt(LocalDateTime.now());

        return profileRepository.save(profile);
    }

    @Transactional
    public void updateProfileFromInteraction(User user, Movie movie, boolean liked) {
        if (movie.getMovieVector() == null) {
            log.warn("Movie {} has no vector, skipping profile update", movie.getId());
            return;
        }

        UserProfile profile = getOrCreateProfile(user);
        float[] currentVector = profile.getProfileVector();

        if (currentVector == null) {
            if (liked) {
                profile.setProfileVector(embeddingService.normalize(movie.getMovieVector()));
                profile.setUpdatedAt(LocalDateTime.now());
                profileRepository.save(profile);
            }
            return;
        }

        float[] movieVector = movie.getMovieVector();
        float rate = liked ? LIKE_LEARNING_RATE : -DISLIKE_LEARNING_RATE;

        float[] updated = new float[VECTOR_DIM];
        for (int i = 0; i < VECTOR_DIM; i++) {
            updated[i] = currentVector[i] + rate * (movieVector[i] - currentVector[i]);
        }

        profile.setProfileVector(embeddingService.normalize(updated));
        profile.setUpdatedAt(LocalDateTime.now());
        profileRepository.save(profile);

        log.debug("Updated profile vector for user {} (liked={})", user.getId(), liked);
    }

    public float[] getProfileVector(User user) {
        return profileRepository.findByUser(user)
                .map(UserProfile::getProfileVector)
                .orElse(null);
    }

    private String buildProfileText(Map<String, Integer> scores) {
        Map<String, String> scoreToText = Map.ofEntries(
                Map.entry("comfort",       "comfortable cozy relaxing warm homey"),
                Map.entry("social",        "social fun energetic upbeat"),
                Map.entry("adventure",     "adventurous exciting action epic"),
                Map.entry("intellectual",  "intellectual cerebral thoughtful complex"),
                Map.entry("sophisticated", "sophisticated artistic elegant"),
                Map.entry("classic",       "classic timeless popular mainstream"),
                Map.entry("spontaneous",   "spontaneous chaotic unpredictable"),
                Map.entry("thriller",      "thriller suspense tense dark"),
                Map.entry("sci_fi",        "science fiction futuristic space"),
                Map.entry("drama",         "drama emotional serious"),
                Map.entry("romance",       "romantic love heartwarming"),
                Map.entry("action",        "action fast-paced intense"),
                Map.entry("comedy",        "comedy funny humorous"),
                Map.entry("emotional",     "emotional touching moving tearful"),
                Map.entry("intense",       "intense gripping suspenseful"),
                Map.entry("feel_good",     "feel-good uplifting happy"),
                Map.entry("reflective",    "reflective contemplative quiet"),
                Map.entry("nostalgia",     "nostalgic classic childhood")
        );

        StringBuilder sb = new StringBuilder();
        scores.entrySet().stream()
              .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
              .limit(5)
              .forEach(entry -> {
                  String text = scoreToText.getOrDefault(entry.getKey(), entry.getKey());
                  for (int i = 0; i < Math.min(entry.getValue(), 3); i++) {
                      sb.append(text).append(" ");
                  }
              });

        return sb.toString().trim();
    }
}
