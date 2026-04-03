
package com.filmoji.backend.movie;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
/**
 * Mulitiple mapping available
 * @apiNote: Two class-level endpoint remain works same here -> "/movies", "/api/movies" 
 */
@RequestMapping({"/movies", "/api/movies"})
public class MovieController {

    private final MovieRepository movies;

    public MovieController(MovieRepository movies) {
        this.movies = movies;
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

    // Lists all movies in the database
    @GetMapping()
    public List<Movie> list() {
        return movies.findAll();
    }

    // DELETE /api/movies/{id} — remove a movie from the database
    /**
     * 
     * @param id movie.id
     * @return // StateCode: 204
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!movies.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        movies.deleteById(id);
        return ResponseEntity.noContent().build(); // 204
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
                    Map<String, Object> response = new LinkedHashMap<>();
                    response.put("id", movie.getId());
                    response.put("tmdbId", movie.getTmdbId());
                    response.put("trailerKey", movie.getTrailerKey());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
