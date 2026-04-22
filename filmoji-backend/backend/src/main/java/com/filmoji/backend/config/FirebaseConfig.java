package com.filmoji.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
    public FirebaseAuth firebaseAuth() {
        try {
            if (!FirebaseApp.getApps().isEmpty()) {
                return FirebaseAuth.getInstance();
            }

            if (credentialsPath != null && !credentialsPath.isEmpty()
                    && !credentialsPath.equals("/firebase-service-account.json")) {
                try (InputStream serviceAccount = new FileInputStream(credentialsPath)) {
                    GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(credentials)
                            .setProjectId(projectId)
                            .build();
                    FirebaseApp.initializeApp(options);
                    log.info("Firebase initialized with credentials from {}", credentialsPath);
                    return FirebaseAuth.getInstance();
                } catch (IOException e) {
                    log.warn("Could not load Firebase credentials from {}: {}", credentialsPath, e.getMessage());
                }
            } else {
                log.warn("No firebase.credentials.path configured — Firebase auth disabled");
            }
        } catch (Exception e) {
            log.warn("Firebase initialization failed: {}", e.getMessage());
        }
        return null;
    }
}
