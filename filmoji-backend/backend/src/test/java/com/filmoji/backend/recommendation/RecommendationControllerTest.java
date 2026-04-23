package com.filmoji.backend.recommendation;

import com.filmoji.backend.movie.Genre;
import com.filmoji.backend.movie.Movie;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class RecommendationControllerTest {

    @Mock
    private RecommendationService recommendationService;

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        RecommendationController controller = new RecommendationController(recommendationService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void postRecommendations_returnsOk() throws Exception {
        Movie movie = new Movie();
        movie.setId(1);
        movie.setTmdbId(100);
        movie.setTitle("Test Movie");
        movie.setPosterUrl("http://example.com/poster.jpg");
        movie.setReleaseYear(2024);
        movie.setRating(7.5f);
        movie.setLanguage("en");

        Genre genre = new Genre();
        genre.setId(1);
        genre.setName("Action");
        movie.setGenres(Set.of(genre));

        RecommendationService.RecommendationResult result =
                new RecommendationService.RecommendationResult(movie, "We picked this because...");

        Mockito.when(recommendationService.recommend(Mockito.any(), Mockito.eq("😊"), Mockito.eq(3)))
                .thenReturn(List.of(result));

        mockMvc.perform(post("/recommendations")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"emojis\":\"😊\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", Matchers.hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Test Movie"))
                .andExpect(jsonPath("$[0].posterUrl").value("http://example.com/poster.jpg"));
    }

    @Test
    void postRecommendations_emptyEmojis_returnsBadRequest() throws Exception {
        mockMvc.perform(post("/recommendations")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"emojis\":\"\"}"))
                .andExpect(status().isBadRequest());
    }
}
