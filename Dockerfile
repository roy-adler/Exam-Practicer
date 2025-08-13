# Build stage - Generate the exam questions index file and focus areas
FROM alpine:latest AS build
WORKDIR /app

# Install necessary tools
RUN apk add --no-cache bash

# Copy source code and script
COPY . .
COPY generate_files.sh /app/generate_files.sh

# Make the script executable and run it from the root directory using bash explicitly
RUN chmod +x /app/generate_files.sh && \
    bash /app/generate_files.sh

# Production stage - Serve static files with nginx
FROM nginx:alpine

# Copy main application files to nginx web root
COPY --from=build /app/index.html /usr/share/nginx/html/
COPY --from=build /app/app.js /usr/share/nginx/html/
COPY --from=build /app/styles.css /usr/share/nginx/html/

# Copy exam questions directory (including generated index.json and focus-areas.json)
COPY --from=build /app/exam-questions/ /usr/share/nginx/html/exam-questions/

# Use default nginx configuration

# Expose port 80 for web traffic
EXPOSE 80

# Start nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]