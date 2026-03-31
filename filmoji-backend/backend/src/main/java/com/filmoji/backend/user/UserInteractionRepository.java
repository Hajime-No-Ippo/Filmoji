package com.filmoji.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserInteractionRepository extends JpaRepository<UserInteraction, UUID> {

    List<UserInteraction> findByUserId(UUID userId);

    List<UserInteraction> findByUserIdAndInteractionType(UUID userId, String interactionType);

    long countByUserIdAndInteractionType(UUID userId, String interactionType);
}
