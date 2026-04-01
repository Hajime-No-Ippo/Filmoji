package com.filmoji.backend.user;

import com.filmoji.backend.converter.VectorConverter;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity /* Movie represents one row in the movies table */
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "quiz_answers", columnDefinition = "jsonb")
    private String quizAnswers = "{}";

    @Convert(converter = VectorConverter.class)
    @Column(name = "profile_vector", columnDefinition = "vector(384)")
    private float[] profileVector;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // ── Getters & Setters ──

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getQuizAnswers() { return quizAnswers; }
    public void setQuizAnswers(String quizAnswers) { this.quizAnswers = quizAnswers; }

    public float[] getProfileVector() { return profileVector; }
    public void setProfileVector(float[] profileVector) { this.profileVector = profileVector; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
