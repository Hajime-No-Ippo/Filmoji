
package com.filmoji.backend.movie;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.filmoji.backend.service.TmdbService;

@RestController
@RequestMapping({"/movies", "/api/movies"})
public class MovieController {

    private static final Logger log = LoggerFactory.getLogger(MovieController.class);

    private final MovieRepository movies;
    private final TmdbService tmdbService;

    public MovieController(MovieRepository movies, TmdbService tmdbService) {
        this.movies = movies;
        this.tmdbService = tmdbService;
    }

    // Quick test endpoint: adds one movie if it's not already there
    @PostMapping("/debug/seed")
    public Movie seedOne() {
        return movies.findByTmdbId(550).orElseGet(() -> {
            Movie m = new Movie();
            m.setTmdbId(550);
            m.setTitle("Fight Club");
            m.setSynopsis("An insomniac office worker and a soap maker form an underground fight club.");
            m.setReleaseYear(1999);
            return movies.save(m);
        });
    }

    // Lists movies with optional limit (default 50)
    @GetMapping()
    public List<Movie> list(@RequestParam(defaultValue = "50") int limit) {
        return movies.findAllWithGenres().stream().limit(limit).toList();
    }

    // API GET/ Get the trailerKey 
    /** 
     * So for this endpoint, we need to get the trailerKey from db
     * Which means we need to use movieID as a searchKey and fetch trailerKey for frontend to fetch the trailer
     * @Param id, the one attributes of movies like what we stored in DB
     * ```java
     * 
     * @return trailerKey, this will be used to help frontend to fetch the correct movie
     * ```json
     * {
        "id": 5,
        "results": [
                {
                "iso_639_1": "en",
                "iso_3166_1": "US",
                "name": "Four Rooms - Trailer",
                "key": "S_Pd2pGkq54",
                "published_at": "2013-10-08T10:48:42.000Z",
                "site": "YouTube",
                "size": 480,
                "type": "Trailer",
                "official": true,
                "id": "533ec651c3a3685448000002"
                }
            ]
        }
     * 
     * This will be the return body from TMDB
     * 
     */
    @GetMapping("/{id}/trailer")
    public ResponseEntity<Map<String, Object>> getTrailerKey(@PathVariable Integer id) {
        return movies.findById(id)
                .map(movie -> {
                    String trailerKey = movie.getTrailerKey();
                    if (trailerKey == null || trailerKey.isBlank()) {
                        try {
                            trailerKey = tmdbService.fetchTrailerKey(movie.getTmdbId());
                            if (trailerKey != null) {
                                movie.setTrailerKey(trailerKey);
                                movies.save(movie);
                            }
                        } catch (Exception e) {
                            log.warn("Could not fetch trailer for movie {}: {}", movie.getTmdbId(), e.getMessage());
                        }
                    }
                    Map<String, Object> response = new LinkedHashMap<>();
                    response.put("id", movie.getId());
                    response.put("tmdbId", movie.getTmdbId());
                    response.put("trailerKey", trailerKey);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getMovie(@PathVariable Integer id) {
        return movies.findByIdWithGenres(id)
            .map(movie -> {
                Map<String, Object> response = new LinkedHashMap<>();
                response.put("id",          movie.getId());
                response.put("tmdbId",       movie.getTmdbId());
                response.put("title",        movie.getTitle());
                response.put("synopsis",     movie.getSynopsis() != null ? movie.getSynopsis() : "");
                response.put("posterUrl",    movie.getPosterUrl() != null ? movie.getPosterUrl() : "");
                response.put("trailerKey",   movie.getTrailerKey() != null ? movie.getTrailerKey() : "");
                response.put("releaseYear",  movie.getReleaseYear());
                response.put("rating",       movie.getRating());
                response.put("language",     movie.getLanguage());
                response.put("genres",       movie.getGenres() != null
                    ? movie.getGenres().stream().map(g -> g.getName()).toList()
                    : List.of());
                return ResponseEntity.ok(response);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
