# Build stage
FROM gradle:8.5.0-jdk21 AS builder
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew bootJar --no-daemon -x test

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/app.jar app.jar
EXPOSE 8011

# Create upload directory
RUN mkdir -p /app/upload
VOLUME /app/upload
ENTRYPOINT ["java", "-jar", "app.jar"]
