package com.filmoji.backend.movie;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/movies")
public class MovieController {

    private final MovieRepository movies;

    public MovieController(MovieRepository movies) {
        this.movies = movies;
    }

    // Quick test endpoint: adds one movie if it's not already there
    @PostMapping("/debug/seed")
    public Movie seedOne() {
        return movies.findByTmdbId(550).orElseGet(() ->
                movies.save(new Movie(
                        550,
                        "Fight Club",
                        "An insomniac office worker and a soap maker form an underground fight club.",
                        LocalDate.of(1999, 10, 15)
                ))
        );
    }

    // Lists all movies in the database
    @GetMapping
    public List<Movie> list() {
        return movies.findAll();
    }
}
