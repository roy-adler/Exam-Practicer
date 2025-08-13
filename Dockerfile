# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (if any)
RUN npm ci --only=production --silent || true

# Copy source code
COPY . .

# Build/optimize if needed (for future enhancements)
RUN echo "Build stage completed"

# Production stage
FROM nginx:alpine

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

# Create non-root user (handle existing users gracefully)
RUN addgroup -g 1001 -S appuser 2>/dev/null || true && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G appuser -g appuser appuser 2>/dev/null || true

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/index.html /usr/share/nginx/html/
COPY --from=builder /app/styles.css /usr/share/nginx/html/
COPY --from=builder /app/app.js /usr/share/nginx/html/
COPY --from=builder /app/questions.json /usr/share/nginx/html/

# Set proper permissions
RUN chown -R appuser:appuser /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    chown -R appuser:appuser /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appuser /var/run/nginx.pid

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
