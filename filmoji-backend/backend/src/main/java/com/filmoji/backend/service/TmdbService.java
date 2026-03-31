package com.filmoji.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.filmoji.backend.movie.Movie;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class TmdbService {

    private static final Logger log = LoggerFactory.getLogger(TmdbService.class);

    @Value("${tmdb.api.key}")
    private String apiKey;

    @Value("${tmdb.base.url:https://api.themoviedb.org/3}")
    private String baseUrl;

    @Value("${tmdb.image.base.url:https://image.tmdb.org/t/p/w500}")
    private String imageBaseUrl;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public TmdbService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public Movie enrichMovieFromTmdb(Movie movie) {
        if (movie.getTmdbId() == null) return movie;

        try {
            JsonNode details = fetchMovieDetails(movie.getTmdbId());
            if (details == null) return movie;

            movie.setTitle(details.path("title").asText(movie.getTitle()));
            movie.setSynopsis(details.path("overview").asText(movie.getSynopsis()));
            movie.setRating((float) details.path("vote_average").asDouble(0));

            String releaseDate = details.path("release_date").asText("");
            if (releaseDate.length() >= 4) {
                try {
                    movie.setReleaseYear(Integer.parseInt(releaseDate.substring(0, 4)));
                } catch (NumberFormatException e) { /* ignore */ }
            }

            movie.setLanguage(details.path("original_language").asText("en"));

            String posterPath = details.path("poster_path").asText("");
            if (!posterPath.isEmpty() && !posterPath.equals("null")) {
                movie.setPosterUrl(imageBaseUrl + posterPath);
            }

            JsonNode genresNode = details.path("genres");
            if (genresNode.isArray()) {
                List<String> genres = new ArrayList<>();
                genresNode.forEach(g -> genres.add(g.path("name").asText()));
                movie.setGenres(String.join(",", genres));
            }

            String trailerKey = fetchTrailerKey(movie.getTmdbId());
            if (trailerKey != null) {
                movie.setTrailerKey(trailerKey);
            }

        } catch (Exception e) {
            log.error("Failed to enrich movie {} from TMDB: {}", movie.getTmdbId(), e.getMessage());
        }

        return movie;
    }

    public JsonNode fetchMovieDetails(int tmdbId) throws IOException, InterruptedException {
        String url = String.format("%s/movie/%d?api_key=%s", baseUrl, tmdbId, apiKey);
        HttpResponse<String> resp = get(url);
        if (resp.statusCode() != 200) {
            log.warn("TMDB movie/{} returned {}", tmdbId, resp.statusCode());
            return null;
        }
        return objectMapper.readTree(resp.body());
    }

    public String fetchTrailerKey(int tmdbId) throws IOException, InterruptedException {
        String url = String.format("%s/movie/%d/videos?api_key=%s", baseUrl, tmdbId, apiKey);
        HttpResponse<String> resp = get(url);
        if (resp.statusCode() != 200) return null;

        JsonNode root = objectMapper.readTree(resp.body());
        JsonNode results = root.path("results");
        if (!results.isArray()) return null;

        for (JsonNode video : results) {
            if ("YouTube".equalsIgnoreCase(video.path("site").asText(""))
                    && "Trailer".equalsIgnoreCase(video.path("type").asText(""))
                    && video.path("official").asBoolean(false)) {
                return video.path("key").asText();
            }
        }
        for (JsonNode video : results) {
            if ("YouTube".equalsIgnoreCase(video.path("site").asText(""))
                    && "Trailer".equalsIgnoreCase(video.path("type").asText(""))) {
                return video.path("key").asText();
            }
        }
        for (JsonNode video : results) {
            if ("YouTube".equalsIgnoreCase(video.path("site").asText(""))) {
                return video.path("key").asText();
            }
        }
        return null;
    }

    public int searchMovie(String title) throws IOException, InterruptedException {
        String encoded = URLEncoder.encode(title, StandardCharsets.UTF_8);
        String url = String.format("%s/search/movie?api_key=%s&query=%s", baseUrl, apiKey, encoded);
        HttpResponse<String> resp = get(url);
        if (resp.statusCode() != 200) return -1;

        JsonNode root = objectMapper.readTree(resp.body());
        JsonNode results = root.path("results");
        if (results.isArray() && results.size() > 0) {
            return results.get(0).path("id").asInt(-1);
        }
        return -1;
    }

    private HttpResponse<String> get(String url) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Accept", "application/json")
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
