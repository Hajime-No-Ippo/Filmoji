# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml and build files from the `backend/` subdirectory (compose context is filmoji-backend)
COPY backend/pom.xml .
COPY backend/mvnw .
COPY backend/mvnw.cmd .
COPY backend/.mvn .mvn

# Ensure the wrapper is executable
RUN chmod +x mvnw

# Resolve dependencies
RUN ./mvnw dependency:resolve

# Copy source code
COPY backend/src src

# Build
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install curl so container can respond to healthchecks that call the local actuator endpoint
RUN apk add --no-cache curl

COPY --from=builder /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

CMD ["java", "-jar", "app.jar"]
