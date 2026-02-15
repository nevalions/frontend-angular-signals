# Build stage - use full image for Angular build requirements
FROM node:22 AS builder

# Build configuration: 'production', 'development', or 'k8s'
ARG BUILD_CONFIG=k8s

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with legacy peer deps for Angular compatibility
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application with specified configuration
RUN npm run build -- -c ${BUILD_CONFIG}

# Production stage
FROM nginx:alpine

# Install curl for healthcheck
RUN apk --no-cache add curl

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist/frontend-angular-signals/browser /usr/share/nginx/html

# Expose port
EXPOSE 8383

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8383/front-nginx-health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
