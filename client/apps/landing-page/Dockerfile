# Multi-stage build for Astro landing page

# Build stage
FROM node:22-alpine AS build

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/config/package.json ./client/config/
COPY client/packages/tsconfig/package.json ./client/packages/tsconfig/
COPY client/packages/utilities/package.json ./client/packages/utilities/
COPY client/apps/landing-page/package.json ./client/apps/landing-page/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY client/config ./client/config/
COPY client/packages ./client/packages/
COPY client/apps/landing-page ./client/apps/landing-page/

# Build utilities package first
RUN pnpm --filter @hatchgrid/utilities build

# Build the landing page with environment-specific configuration
ARG BUILD_ENV=production
ENV NODE_ENV=${BUILD_ENV}

# Set any additional environment variables for the build
ARG BASE_URL
ENV PUBLIC_BASE_URL=${BASE_URL}

# Build the application
WORKDIR /app/client/apps/landing-page
RUN pnpm build

# Production stage - using nginx for static file serving
FROM nginx:alpine AS production

# Copy nginx configuration
COPY client/apps/landing-page/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage with proper ownership
COPY --from=build --chown=101:101 /app/client/apps/landing-page/dist /usr/share/nginx/html

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create required directories with proper permissions
RUN mkdir -p /var/cache/nginx /var/run \
    && chown -R 101:101 /var/cache/nginx /var/run

# Expose port
EXPOSE 80

# Switch to non-root user (nginx)
USER 101:101

# Health check using curl to verify the server is responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
