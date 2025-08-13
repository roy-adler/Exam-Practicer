# Build stage - Generate the exam questions index file
FROM alpine:latest AS build
WORKDIR /app

# Install necessary tools
RUN apk add --no-cache bash

# Copy source code
COPY . .

# Create a script to generate index.json
RUN echo '#!/bin/bash' > /app/generate_index.sh && \
    echo 'cd /app/exam-questions' >> /app/generate_index.sh && \
    echo 'echo "[" > index.json' >> /app/generate_index.sh && \
    echo 'first=true' >> /app/generate_index.sh && \
    echo 'for file in *.json; do' >> /app/generate_index.sh && \
    echo '  if [ "$file" != "index.json" ]; then' >> /app/generate_index.sh && \
    echo '    if [ "$first" = "true" ]; then' >> /app/generate_index.sh && \
    echo '      echo "  \"$file\"" >> index.json' >> /app/generate_index.sh && \
    echo '      first=false' >> /app/generate_index.sh && \
    echo '    else' >> /app/generate_index.sh && \
    echo '      echo "  ,\"$file\"" >> index.json' >> /app/generate_index.sh && \
    echo '    fi' >> /app/generate_index.sh && \
    echo '  fi' >> /app/generate_index.sh && \
    echo 'done' >> /app/generate_index.sh && \
    echo 'echo "]" >> index.json' >> /app/generate_index.sh && \
    chmod +x /app/generate_index.sh

# Generate index using the script
RUN /app/generate_index.sh

# Production stage - Serve static files with nginx
FROM nginx:alpine

# Copy main application files to nginx web root
COPY --from=build /app/index.html /usr/share/nginx/html/
COPY --from=build /app/app.js /usr/share/nginx/html/
COPY --from=build /app/styles.css /usr/share/nginx/html/

# Copy exam questions directory (including generated index.json)
COPY --from=build /app/exam-questions/ /usr/share/nginx/html/exam-questions/

# Use default nginx configuration

# Expose port 80 for web traffic
EXPOSE 80

# Start nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]