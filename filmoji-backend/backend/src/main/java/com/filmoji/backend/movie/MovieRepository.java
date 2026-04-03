package com.filmoji.backend.movie;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository // The file which contacted with DB
public interface MovieRepository extends JpaRepository<Movie, Integer> {

    Optional<Movie> findByTmdbId(Integer tmdbId);

    boolean existsByTmdbId(Integer tmdbId);

    /**
     * Vector similarity search using pgvector cosine distance operator (<=>). 
     * Returns the N closest movies to the given query vector.
     */
    @Query(value = """
            SELECT * FROM movies
            WHERE movie_vector IS NOT NULL
            ORDER BY movie_vector <=> CAST(:queryVector AS vector)
            LIMIT :limit
            """, nativeQuery = true)
    List<Movie> findTopNByVectorSimilarity(
            @Param("queryVector") String queryVector,
            @Param("limit") int limit
    );

    /**
     * Check whether the Movie are 
     * @return The movie without storing vectors (COMPLEXITY)
     */
    @Query("SELECT m FROM Movie m WHERE m.movieVector IS NULL")
    List<Movie> findMoviesWithoutVector();

    @Modifying // Updates
    @Transactional // Updates
    @Query(value = "UPDATE movies SET movie_vector = CAST(:vector AS vector), poster_url = :posterUrl, trailer_key = :trailerKey WHERE id = :id", nativeQuery = true)
    void updateMovieVectorAndMedia(@Param("id") Integer id,
                                   @Param("vector") String vector,
                                   @Param("posterUrl") String posterUrl,
                                   @Param("trailerKey") String trailerKey);

    @Query(value = "SELECT * FROM movies ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Movie> findRandomMovies(@Param("limit") int limit);
}
