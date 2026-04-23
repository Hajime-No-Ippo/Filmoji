package com.filmoji.backend.movie;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface GenreRepository extends JpaRepository<Genre, Integer> {

	// Returns genre id, name and the count of movies assigned to that genre.
	@Query(value = "SELECT g.id AS id, g.name AS name, COUNT(mg.movie_id) AS count "
			+ "FROM genres g LEFT JOIN movie_genres mg ON g.id = mg.genre_id "
			+ "GROUP BY g.id, g.name ORDER BY count DESC", nativeQuery = true)
	List<GenreCount> findGenreCounts();

}