package com.filmoji.backend.security;

import com.filmoji.backend.user.User;

import java.util.UUID;

/**
 * Wraps the Filmoji User model for use in the Spring Security context.
 */
public class FilmojiUserPrincipal {

    private final User user;

    public FilmojiUserPrincipal(User user) {
        this.user = user;
    }

    public UUID getUserId() { return user.getId(); }
    public String getFirebaseUid() { return user.getFirebaseUid(); }
    public String getEmail() { return user.getEmail(); }
    public String getDisplayName() { return user.getDisplayName(); }
    public boolean isOnboardingComplete() { return user.isOnboardingComplete(); }
    public User getUser() { return user; }
}
