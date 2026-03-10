# Build stage
FROM gradle:8.5.0-jdk21 AS builder
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew bootJar --no-daemon -x test

# Run stage
FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache wget iproute2
WORKDIR /app
COPY --from=builder /app/build/libs/app.jar app.jar

# 빌드 시점의 upload 폴더를 시드로 포함 (compose 빌드하면 이미지에 함께 올라감).
# CI에서는 deploy 워크플로가 backend/upload(.gitkeep) 존재를 보장함.
RUN mkdir -p /app/upload-seed
COPY upload/ /app/upload-seed/
RUN mkdir -p /app/upload
VOLUME /app/upload
EXPOSE 8011
ENV SERVER_PORT=8011

# 기동 시 시드 이미지를 upload에 복사 (이미 있으면 덮어쓰지 않음)
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'for f in /app/upload-seed/*; do [ -e "$f" ] && cp -n "$f" /app/upload/ 2>/dev/null; done' >> /docker-entrypoint.sh && \
    echo 'exec java -Dserver.port=8011 -jar app.jar' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
