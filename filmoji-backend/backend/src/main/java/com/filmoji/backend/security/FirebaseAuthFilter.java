package com.filmoji.backend.security;

import com.filmoji.backend.user.User;
import com.filmoji.backend.user.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Intercepts every request and verifies the Firebase ID token
 * in the Authorization: Bearer <token> header.
 */
@Component
public class FirebaseAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(FirebaseAuthFilter.class);

    private final FirebaseAuth firebaseAuth;
    private final UserRepository userRepository;

    public FirebaseAuthFilter(FirebaseAuth firebaseAuth, UserRepository userRepository) {
        this.firebaseAuth   = firebaseAuth;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            FirebaseToken decoded = firebaseAuth.verifyIdToken(token);
            String firebaseUid = decoded.getUid();

            User user = userRepository.findByFirebaseUid(firebaseUid).orElseGet(() -> {
                User newUser = new User();
                newUser.setFirebaseUid(firebaseUid);
                newUser.setEmail(decoded.getEmail());
                newUser.setDisplayName(decoded.getName());
                newUser.setOnboardingComplete(false);
                return userRepository.save(newUser);
            });

            FilmojiUserPrincipal principal = new FilmojiUserPrincipal(user);
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    principal, null,
                    List.of(new SimpleGrantedAuthority("ROLE_USER"))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception e) {
            log.warn("Firebase token verification failed: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
