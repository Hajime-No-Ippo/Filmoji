package com.filmoji.backend.movie;

import com.filmoji.backend.converter.VectorConverter;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tmdb_id", unique = true, nullable = false)
    private Integer tmdbId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String synopsis;

    // Stored as comma-separated string, e.g. "Action,Thriller"
    @Column(name = "genres", columnDefinition = "TEXT")
    private String genres;

    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @Column(name = "trailer_key", length = 100)
    private String trailerKey;

    @Column(name = "release_year")
    private Integer releaseYear;

    @Column
    private Float rating;

    @Column(length = 10)
    private String language = "en";

    @Convert(converter = VectorConverter.class)
    @Column(name = "movie_vector", columnDefinition = "vector(384)")
    private float[] movieVector;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // ── Getters & Setters ──

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getTmdbId() { return tmdbId; }
    public void setTmdbId(Integer tmdbId) { this.tmdbId = tmdbId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSynopsis() { return synopsis; }
    public void setSynopsis(String synopsis) { this.synopsis = synopsis; }

    public String getGenres() { return genres; }
    public void setGenres(String genres) { this.genres = genres; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public String getTrailerKey() { return trailerKey; }
    public void setTrailerKey(String trailerKey) { this.trailerKey = trailerKey; }

    public Integer getReleaseYear() { return releaseYear; }
    public void setReleaseYear(Integer releaseYear) { this.releaseYear = releaseYear; }

    public Float getRating() { return rating; }
    public void setRating(Float rating) { this.rating = rating; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public float[] getMovieVector() { return movieVector; }
    public void setMovieVector(float[] movieVector) { this.movieVector = movieVector; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
