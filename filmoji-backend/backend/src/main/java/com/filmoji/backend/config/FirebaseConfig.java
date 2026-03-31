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

    @Value("${firebase.credentials.path}")
    private String credentialsPath;

    @Value("${firebase.project.id}")
    private String projectId;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }

        GoogleCredentials credentials;
        try {
            InputStream serviceAccount = new FileInputStream(credentialsPath);
            credentials = GoogleCredentials.fromStream(serviceAccount);
            log.info("Firebase credentials loaded from file: {}", credentialsPath);
        } catch (IOException e) {
            log.warn("Could not load Firebase credentials from file: {}. Trying application default credentials.", credentialsPath);
            credentials = GoogleCredentials.getApplicationDefault();
            log.info("Firebase using application default credentials.");
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .setProjectId(projectId)
                .build();

        return FirebaseApp.initializeApp(options);
    }

    @Bean
    public FirebaseAuth firebaseAuth(FirebaseApp firebaseApp) {
        return FirebaseAuth.getInstance(firebaseApp);
    }
}
