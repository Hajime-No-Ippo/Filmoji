package com.filmoji.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.credentials.path:}")
    private String credentialsPath;

    @Value("${firebase.project.id:filmoji-7c2f1}")
    private String projectId;

    @Bean
    @Lazy
    public Optional<FirebaseApp> firebaseApp() {
        try {
            if (!FirebaseApp.getApps().isEmpty()) {
                return Optional.of(FirebaseApp.getInstance());
            }

            // Only attempt to load credentials from an explicit file path.
            if (credentialsPath != null && !credentialsPath.isEmpty() && !credentialsPath.equals("/firebase-service-account.json")) {
                try (InputStream serviceAccount = new FileInputStream(credentialsPath)) {
                    GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(credentials)
                            .setProjectId(projectId)
                            .build();
                    return Optional.of(FirebaseApp.initializeApp(options));
                } catch (IOException e) {
                    log.warn("Could not load Firebase credentials from file: {}", credentialsPath, e);
                }
            } else {
                log.info("No firebase.credentials.path provided; skipping Firebase initialization");
            }

            return Optional.empty();
        } catch (Exception e) {
            log.warn("Could not initialize Firebase - Firebase features will be disabled: {}", e.getMessage());
            return Optional.empty();
        }
    }

    @Bean
    @Lazy
    public Optional<FirebaseAuth> firebaseAuth(Optional<FirebaseApp> firebaseApp) {
        try {
            if (firebaseApp.isPresent()) {
                return Optional.of(FirebaseAuth.getInstance());
            }
        } catch (Exception e) {
            log.warn("Firebase Auth not available: {}", e.getMessage());
        }
        return Optional.empty();
    }
}
