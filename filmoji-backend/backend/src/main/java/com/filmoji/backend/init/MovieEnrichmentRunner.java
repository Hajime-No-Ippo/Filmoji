package com.filmoji.backend.init;

import com.filmoji.backend.movie.Movie;
import com.filmoji.backend.movie.MovieRepository;
import com.filmoji.backend.service.TmdbService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class MovieEnrichmentRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(MovieEnrichmentRunner.class);

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TmdbService tmdbService;

    @Override
    public void run(ApplicationArguments args) {
        movieRepository.findAll().forEach(movie -> {
            if (movie.getPosterUrl() == null || movie.getPosterUrl().isBlank()
                    || movie.getTrailerKey() == null || movie.getTrailerKey().isBlank()) {
                try {
                    Movie enriched = tmdbService.enrichMovieFromTmdb(movie);
                    // Use native query to avoid vector type cast issue
                    String vectorStr = enriched.getMovieVector() != null
                        ? buildVectorString(enriched.getMovieVector()) : null;
                    movieRepository.updateMovieVectorAndMedia(
                        enriched.getId(),
                        vectorStr,
                        enriched.getPosterUrl() != null ? enriched.getPosterUrl() : "",
                        enriched.getTrailerKey() != null ? enriched.getTrailerKey() : ""
                    );
                    log.info("Enriched movie: {}", enriched.getTitle());
                } catch (Exception e) {
                    log.warn("Failed to enrich movie {}: {}", movie.getTitle(), e.getMessage());
                }
            }
        });
    }

    private String buildVectorString(float[] vector) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            sb.append(vector[i]);
            if (i < vector.length - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
}
