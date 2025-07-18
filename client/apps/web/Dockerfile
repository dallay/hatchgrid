# Multi-stage build for Vue.js web application

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
COPY client/apps/web/package.json ./client/apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY client/config ./client/config/
COPY client/packages ./client/packages/
COPY client/apps/web ./client/apps/web/

# Build utilities package first
RUN pnpm --filter @hatchgrid/utilities build

# Build the web app with environment-specific configuration
ARG BUILD_ENV=production
ENV NODE_ENV=${BUILD_ENV}

# Set any additional environment variables for the build
ARG API_URL
ENV VITE_API_URL=${API_URL}

# Build the application
WORKDIR /app/client/apps/web
RUN pnpm build

# Production stage
FROM nginx:alpine AS production

# Copy nginx configuration
COPY client/apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/client/apps/web/dist /usr/share/nginx/html

# Create required directories with proper permissions
# Note: /usr/share/nginx already has proper permissions in the official nginx:alpine image
RUN mkdir -p /var/cache/nginx /var/run \
    && chown -R 101:101 /var/cache/nginx /var/run

# Expose port
EXPOSE 80

# Switch to non-root user (nginx)
USER 101

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
