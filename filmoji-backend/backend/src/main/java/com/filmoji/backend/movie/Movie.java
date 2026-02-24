package com.filmoji.backend.movie;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tmdb_id", unique = true)
    private Integer tmdbId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String overview;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    protected Movie() {
        // JPA needs a no-args constructor
    }

    public Movie(Integer tmdbId, String title, String overview, LocalDate releaseDate) {
        this.tmdbId = tmdbId;
        this.title = title;
        this.overview = overview;
        this.releaseDate = releaseDate;
    }

    public Long getId() { return id; }
    public Integer getTmdbId() { return tmdbId; }
    public String getTitle() { return title; }
    public String getOverview() { return overview; }
    public LocalDate getReleaseDate() { return releaseDate; }
}
