# Stage 1: Build stage
FROM node:20-alpine AS build

USER root

# Skip downloading Chrome for Puppeteer (saves build time)
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Install latest Flowise globally
RUN npm install -g flowise

# Stage 2: Runtime stage
FROM node:20-alpine

# Install runtime dependencies
RUN apk add --no-cache chromium git python3 py3-pip make g++ build-base cairo-dev pango-dev curl

# Set the environment variable for Puppeteer to find Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Increase Node.js heap size for production
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Copy Flowise from the build stage
COPY --from=build /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=build /usr/local/bin /usr/local/bin

# Cloud Run expects the app to listen on PORT environment variable
ENV PORT=8080

# Flowise configuration for production
ENV FLOWISE_USERNAME=""
ENV FLOWISE_PASSWORD=""
ENV DISABLE_FLOWISE_TELEMETRY=true
ENV FLOWISE_SECRETKEY_OVERWRITE=your-secret-key-change-this

EXPOSE 8080

# Start Flowise
ENTRYPOINT ["flowise", "start"]
