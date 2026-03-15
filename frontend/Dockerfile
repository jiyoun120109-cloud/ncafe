# Build stage
FROM node:20-alpine AS builder  
WORKDIR /app
COPY package*.json ./
# Longer timeouts and retries for slow/unstable networks (e.g. Docker build)
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-timeout 120000 && \
    npm install --legacy-peer-deps
COPY . .
ARG NEXT_PUBLIC_API_URL
ARG API_BASE_URL=http://backend:8011
ARG BACKEND_URL=http://backend:8011
ARG NEXT_PUBLIC_KAKAO_MAP_APP_KEY
ARG NEXT_PUBLIC_TOSS_CLIENT_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV API_BASE_URL=$API_BASE_URL
ENV BACKEND_URL=$BACKEND_URL
ENV NEXT_PUBLIC_KAKAO_MAP_APP_KEY=$NEXT_PUBLIC_KAKAO_MAP_APP_KEY
ENV NEXT_PUBLIC_TOSS_CLIENT_KEY=$NEXT_PUBLIC_TOSS_CLIENT_KEY
RUN npm run build

# Run stage
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./

EXPOSE 3011
ENV PORT=3011
# next start -p 3011 (package.json)으로 포트 고정. ENV PORT만으로는 Next 16에서 3035로 listen하는 경우 있음.
# 이미지 rewrite/프록시가 Docker 내부에서 backend:8011 로 가도록 기본값 설정 (docker-compose에서 덮어쓸 수 있음)
ENV API_BASE_URL=http://backend:8011
ENV BACKEND_URL=http://backend:8011
CMD ["npm", "run", "start"]
