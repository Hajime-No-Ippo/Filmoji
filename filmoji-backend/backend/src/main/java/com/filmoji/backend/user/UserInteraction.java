package com.filmoji.backend.user;

import com.filmoji.backend.movie.Movie;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_interactions")
public class UserInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id")
    private Movie movie;

    // 'like', 'dislike', 'watch', 'swipe_right', 'swipe_left'
    @Column(name = "interaction_type", nullable = false, length = 20)
    private String interactionType;

    @Column(name = "emoji_context", length = 50)
    private String emojiContext;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // ── Getters & Setters ──

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }

    public String getInteractionType() { return interactionType; }
    public void setInteractionType(String interactionType) { this.interactionType = interactionType; }

    public String getEmojiContext() { return emojiContext; }
    public void setEmojiContext(String emojiContext) { this.emojiContext = emojiContext; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
