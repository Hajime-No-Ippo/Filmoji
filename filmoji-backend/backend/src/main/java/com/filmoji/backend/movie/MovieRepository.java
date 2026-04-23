package com.filmoji.backend.movie;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Integer> {

    Optional<Movie> findByTmdbId(Integer tmdbId);

        @Query("SELECT m FROM Movie m LEFT JOIN FETCH m.genres WHERE m.tmdbId = :tmdbId")
        Optional<Movie> findByTmdbIdWithGenres(@Param("tmdbId") Integer tmdbId);

    @Query("SELECT m FROM Movie m LEFT JOIN FETCH m.genres WHERE m.id = :id")
    Optional<Movie> findByIdWithGenres(@Param("id") Integer id);

    boolean existsByTmdbId(Integer tmdbId);

    /**
     * Vector similarity search using pgvector cosine distance operator (<=>).
     * Returns the N closest movies to the given query vector.
     */
    @Query(value = """
            SELECT * FROM movies
            WHERE movie_vector IS NOT NULL
            AND rating >= 5.0
            AND language = 'en'
            ORDER BY movie_vector <=> CAST(:queryVector AS vector)
            LIMIT :limit
            """, nativeQuery = true)
    List<Movie> findTopNByVectorSimilarity(
            @Param("queryVector") String queryVector,
            @Param("limit") int limit
    );

    @Query(value = """
            SELECT m.* FROM movies m
            JOIN movie_genres mg ON mg.movie_id = m.id
            JOIN genres g ON g.id = mg.genre_id
            WHERE m.movie_vector IS NOT NULL
            AND m.rating >= 5.0
            AND g.name IN (:genres)
            ORDER BY m.movie_vector <=> CAST(:queryVector AS vector)
            LIMIT :limit
            """, nativeQuery = true)
    List<Movie> findTopNByVectorSimilarityAndGenres(
            @Param("queryVector") String queryVector,
            @Param("genres") List<String> genres,
            @Param("limit") int limit
    );

    /**
     * Check whether the Movie are 
     * @return
     */
    @Query("SELECT m FROM Movie m WHERE m.movieVector IS NULL")
    List<Movie> findMoviesWithoutVector();

    @Modifying
    @Transactional
    @Query(value = "UPDATE movies SET movie_vector = CAST(:vector AS vector), poster_url = :posterUrl, trailer_key = :trailerKey WHERE id = :id", nativeQuery = true)
    void updateMovieVectorAndMedia(@Param("id") Integer id,
                                   @Param("vector") String vector,
                                   @Param("posterUrl") String posterUrl,
                                   @Param("trailerKey") String trailerKey);

    @Query(value = "SELECT * FROM movies ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Movie> findRandomMovies(@Param("limit") int limit);

    @Query("SELECT DISTINCT m FROM Movie m LEFT JOIN FETCH m.genres WHERE m.id IN :ids")
    List<Movie> findByIdsWithGenres(@Param("ids") List<Integer> ids);

        // Fetch movies with their genres to avoid lazy-initialization issues when
        // serializing entities outside a transactional context.
        @Query("SELECT DISTINCT m FROM Movie m LEFT JOIN FETCH m.genres")
        List<Movie> findAllWithGenres();
}
