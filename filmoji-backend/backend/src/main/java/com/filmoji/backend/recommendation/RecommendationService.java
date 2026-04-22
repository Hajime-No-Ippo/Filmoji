package com.filmoji.backend.recommendation;

import com.filmoji.backend.movie.Movie;
import com.filmoji.backend.movie.MovieRepository;
import com.filmoji.backend.service.EmbeddingService;
import com.filmoji.backend.service.TmdbService;
import com.filmoji.backend.service.UserProfileService;
import com.filmoji.backend.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import com.filmoji.backend.movie.Genre;

import java.util.*;

/**
 * Core recommendation engine.
 *
 * Algorithm:
 * 1. Map emoji string to emotion text using the EMOJI_EMOTIONS catalog
 * 2. Call HuggingFace API to get 384-dim embedding of the emotion text
 * 3. Get user's profile_vector from DB
 * 4. Combine: combined = normalize((emoji_vector * 0.6) + (profile_vector * 0.4))
 * 5. Query pgvector: SELECT * FROM movies ORDER BY movie_vector <=> combined LIMIT 3
 * 6. Enrich with fresh TMDB data
 * 7. Return top 3 with why_recommended explanation
 */
@Service
public class RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);

    private static final Map<String, List<String>> EMOJI_GENRES = Map.ofEntries(
        Map.entry("😊", List.of("Comedy", "Animation", "Family", "Adventure")),
        Map.entry("😢", List.of("Drama", "Romance")),
        Map.entry("😱", List.of("Horror", "Thriller", "Mystery")),
        Map.entry("😂", List.of("Comedy", "Animation")),
        Map.entry("❤️", List.of("Romance", "Drama")),
        Map.entry("😍", List.of("Romance", "Drama")),
        Map.entry("🔥", List.of("Action", "Thriller", "Crime")),
        Map.entry("🤔", List.of("Drama", "Science Fiction", "Mystery", "Documentary")),
        Map.entry("👻", List.of("Horror", "Thriller")),
        Map.entry("🚀", List.of("Science Fiction", "Adventure", "Action")),
        Map.entry("🤯", List.of("Science Fiction", "Thriller", "Mystery")),
        Map.entry("🥱", List.of("Comedy", "Animation", "Family")),
        Map.entry("😌", List.of("Animation", "Family", "Documentary")),
        Map.entry("🥳", List.of("Comedy", "Animation", "Family", "Adventure")),
        Map.entry("🫠", List.of("Thriller", "Drama", "Science Fiction")),
        Map.entry("😤", List.of("Action", "Crime", "Thriller")),
        Map.entry("🥺", List.of("Drama", "Romance")),
        Map.entry("😎", List.of("Action", "Crime", "Comedy"))
    );

    private static final Map<String, String> EMOJI_EMOTIONS = Map.ofEntries(
            Map.entry("😊", "happy joyful cheerful uplifting"),
            Map.entry("😢", "sad melancholic emotional tearful"),
            Map.entry("😱", "scared thrilled suspenseful terrified"),
            Map.entry("😂", "funny hilarious comedic laughing"),
            Map.entry("❤️", "romantic love heartwarming tender"),
            Map.entry("🔥", "intense exciting passionate thrilling"),
            Map.entry("🤔", "thoughtful intellectual mind-bending cerebral"),
            Map.entry("😴", "relaxed calm peaceful cozy comfortable"),
            Map.entry("🌈", "colorful whimsical fantasy magical uplifting"),
            Map.entry("💪", "empowering inspiring motivational triumphant"),
            Map.entry("👻", "spooky scary horror creepy"),
            Map.entry("🚀", "adventurous epic sci-fi futuristic"),
            Map.entry("💔", "heartbreak sad emotional bittersweet"),
            Map.entry("🤩", "amazing spectacular impressive awe-inspiring"),
            Map.entry("😤", "frustrated intense dramatic tense"),
            Map.entry("🥺", "emotional touching vulnerable gentle"),
            Map.entry("🌙", "mysterious dark atmospheric moody"),
            Map.entry("⚡", "fast-paced action energetic dynamic"),
            Map.entry("🧠", "intelligent complex cerebral thought-provoking"),
            Map.entry("🎭", "dramatic theatrical intense emotional"),
            Map.entry("🌊", "flowing contemplative deep emotional journey"),
            Map.entry("✨", "magical whimsical beautiful enchanting"),
            Map.entry("😎", "cool stylish confident action-packed"),
            Map.entry("🥱", "relaxed slow calm easygoing cozy"),
            Map.entry("😌", "peaceful serene gentle quiet contemplative"),
            Map.entry("🥳", "festive celebratory fun exciting party"),
            Map.entry("😍", "romantic love passionate heartwarming"),
            Map.entry("🫠", "overwhelmed anxious intense chaotic"),
            Map.entry("🫂", "warm comforting family friendship bonds"),
            Map.entry("🎬", "cinematic dramatic epic storytelling"),
            Map.entry("🥰", "loving warm tender romantic adoring"),
            Map.entry("😭", "deeply moving cathartic tearful emotional"),
            Map.entry("🤯", "mind-blowing shocking intense surprising"),
            Map.entry("💥", "explosive action intense dramatic"),
            Map.entry("🏃", "action chase thriller fast-paced"),
            Map.entry("⚔️", "conflict battle action dramatic"),
            Map.entry("🦇", "dark gothic horror mysterious"),
            Map.entry("🔪", "horror thriller suspense danger"),
            Map.entry("💀", "dark death horror thriller"),
            Map.entry("🌑", "dark mysterious ominous foreboding"),
            Map.entry("😈", "villain dark twisted thriller"),
            Map.entry("🌍", "adventure travel discovery epic"),
            Map.entry("🗺️", "adventure quest exploration journey"),
            Map.entry("🏔️", "epic grand adventure ambitious"),
            Map.entry("🔭", "sci-fi exploration wonder discovery"),
            Map.entry("🛸", "sci-fi futuristic space alien"),
            Map.entry("🌌", "cosmic epic grand sci-fi"),
            Map.entry("☕", "cozy warm comfortable relaxing"),
            Map.entry("🛋️", "comfort cozy relaxing homey"),
            Map.entry("🌸", "gentle peaceful beautiful serene"),
            Map.entry("📚", "intellectual slow-burn cerebral thoughtful"),
            Map.entry("🎵", "musical melodic emotional soundtrack"),
            Map.entry("🌅", "beautiful hopeful peaceful uplifting"),
            Map.entry("💕", "romance sweet tender loving"),
            Map.entry("🍂", "melancholic nostalgic bittersweet autumn"),
            Map.entry("🎉", "celebratory festive exciting fun"),
            Map.entry("💃", "fun energetic lively dance")
    );

    private final MovieRepository movieRepository;
    private final EmbeddingService embeddingService;
    private final UserProfileService userProfileService;
    private final TmdbService tmdbService;

    public RecommendationService(MovieRepository movieRepository,
                                  EmbeddingService embeddingService,
                                  UserProfileService userProfileService,
                                  TmdbService tmdbService) {
        this.movieRepository    = movieRepository;
        this.embeddingService   = embeddingService;
        this.userProfileService = userProfileService;
        this.tmdbService        = tmdbService;
    }

    /**
     * This is actually how recommend works:
     * 
     * @param user 
     * @param emojiString : Emoji Input
     * @param limit : Now has been hard-coded as 3 in HTTP layer, could be changed in Controller layer
     * ```java
     *  List<RecommendationService.RecommendationResult> results =
                recommendationService.recommend(user, emojis, 3);
        ```
     * @return  A recommendation List, which will add movie object and Recommend reasons under:
        ```java
         private String buildWhyRecommended(Movie movie, String emojiString, String primaryEmotion) {
            String genres = movie.getGenres();
            String genreText = (genres != null && !genres.isEmpty())
                    ? genres.split(",")[0].trim().toLowerCase() : "this";
            return String.format("We picked this because you're feeling %s and it's a great %s pick %s",
                    primaryEmotion, genreText, emojiString.substring(0, Math.min(3, emojiString.length())));
        
         }
        ```
        "We picked this because you're feeling __ and it's a great __ pick __" -> Fill with the params up there

     */
    public List<RecommendationResult> recommend(User user, String emojiString, int limit) {
        String emotionText = emojiToEmotionText(emojiString);
        log.info("Emotion text for '{}': {}", emojiString, emotionText);

        float[] emojiVector   = embeddingService.getEmbedding(emotionText);
        float[] profileVector = (user != null) ? userProfileService.getProfileVector(user) : null;

        // Get compatible genres for this emoji first
        List<String> primaryEmoji = extractEmojis(emojiString);
        List<String> genreFilter = primaryEmoji.isEmpty() ? List.of()
                : EMOJI_GENRES.getOrDefault(primaryEmoji.get(0), List.of());

        float[] queryVector;
        if (profileVector != null && !genreFilter.isEmpty()) {
            // Genre filter already constrains results — use pure emoji vector for quality
            queryVector = embeddingService.normalize(emojiVector);
        } else if (profileVector != null) {
            queryVector = embeddingService.weightedCombine(emojiVector, profileVector, 0.8f, 0.2f);
        } else {
            queryVector = embeddingService.normalize(emojiVector);
        }

        String vectorStr = embeddingService.vectorToString(queryVector);
        List<Movie> raw;

        if (!genreFilter.isEmpty()) {
            raw = movieRepository.findTopNByVectorSimilarityAndGenres(vectorStr, genreFilter, limit + 2);
            log.info("Genre-filtered search with genres: {}", genreFilter);
        } else {
            raw = movieRepository.findTopNByVectorSimilarity(vectorStr, limit + 2);
        }

        if (raw.isEmpty()) {
            log.warn("No movies found via vector search — falling back to random picks.");
            raw = movieRepository.findRandomMovies(limit + 2);
        }

        List<Integer> ids = raw.stream().map(Movie::getId).toList();
        List<Movie> movies = ids.isEmpty() ? raw : movieRepository.findByIdsWithGenres(ids);

        if (movies.isEmpty()) {
            log.error("No movies in database at all.");
            return List.of();
        }

        List<RecommendationResult> results = new ArrayList<>();
        String primaryEmotion = getPrimaryEmotion(emojiString);

        for (Movie movie : movies) {
            if (results.size() >= limit) break;
            movie = enrichIfNeeded(movie);
            results.add(new RecommendationResult(movie, buildWhyRecommended(movie, emojiString, primaryEmotion)));
        }

        return results;
    }

    public String emojiToEmotionText(String emojiString) {
        if (emojiString == null || emojiString.isEmpty()) return "interesting movies";

        StringBuilder sb = new StringBuilder();
        for (String emoji : extractEmojis(emojiString)) {
            String emotion = EMOJI_EMOTIONS.get(emoji);
            if (emotion != null) sb.append(emotion).append(" ");
        }

        String result = sb.toString().trim();
        return result.isEmpty() ? "interesting movies" : result;
    }

    private List<String> extractEmojis(String s) {
        List<String> result = new ArrayList<>();
        int i = 0;
        while (i < s.length()) {
            boolean found = false;
            if (i + 2 <= s.length()) {
                String two = s.substring(i, Math.min(i + 4, s.length()));
                for (String key : EMOJI_EMOTIONS.keySet()) {
                    if (two.startsWith(key) && key.length() > 1) {
                        result.add(key);
                        i += key.length();
                        found = true;
                        break;
                    }
                }
            }
            if (!found) {
                String single = s.substring(i, i + 1);
                if (EMOJI_EMOTIONS.containsKey(single)) result.add(single);
                if (i + 2 <= s.length()) {
                    String twoChar = s.substring(i, i + 2);
                    if (EMOJI_EMOTIONS.containsKey(twoChar)) {
                        if (!result.isEmpty()) result.remove(result.size() - 1);
                        result.add(twoChar);
                        i += 2;
                        continue;
                    }
                }
                i++;
            }
        }
        return result;
    }

    private String getPrimaryEmotion(String emojiString) {
        List<String> emojis = extractEmojis(emojiString);
        if (emojis.isEmpty()) return "interesting";
        String emotion = EMOJI_EMOTIONS.get(emojis.get(0));
        if (emotion == null) return "interesting";
        return emotion.split(" ")[0];
    }

    private Movie enrichIfNeeded(Movie movie) {
        if (movie.getPosterUrl() == null || movie.getTrailerKey() == null) {
            try {
                return tmdbService.enrichMovieFromTmdb(movie);
            } catch (Exception e) {
                log.warn("Could not enrich movie {} from TMDB: {}", movie.getId(), e.getMessage());
            }
        }
        return movie;
    }

    private String buildWhyRecommended(Movie movie, String emojiString, String primaryEmotion) {
        Set<Genre> genres = movie.getGenres();
        String genreText = (!genres.isEmpty())
                ? genres.iterator().next().getName().toLowerCase() : "this";
        return String.format("We picked this because you're feeling %s and it's a great %s pick %s",
                primaryEmotion, genreText, emojiString.substring(0, Math.min(3, emojiString.length())));
    }

    public static class RecommendationResult {
        private final Movie movie;
        private final String whyRecommended;

        public RecommendationResult(Movie movie, String whyRecommended) {
            this.movie          = movie;
            this.whyRecommended = whyRecommended;
        }

        public Movie getMovie() { return movie; }
        public String getWhyRecommended() { return whyRecommended; }
    }
}
