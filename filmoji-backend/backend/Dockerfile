# Use a base image with Java runtime
FROM eclipse-temurin:17-jre

# Create a non-privileged user for security best practices
ARG UID=10001
RUN adduser \
  --disabled-password \
  --gecos "" \
  --home "/nonexistent" \
  --shell "/sbin/nologin" \
  --no-create-home \
  --uid "${UID}" \
  appuser
USER appuser

# Copy your Spring Boot jar (built separately) into the image
COPY target/backend-0.0.1-SNAPSHOT.jar /app/backend-0.0.1-SNAPSHOT.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/backend-0.0.1-SNAPSHOT.jar"]