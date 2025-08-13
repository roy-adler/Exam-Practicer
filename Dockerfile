# Build stage - Generate the exam questions index file and focus areas
FROM alpine:latest AS build
WORKDIR /app

# Install necessary tools
RUN apk add --no-cache bash

# Copy source code
COPY . .

# Create a simple script to generate index.json and focus-areas.json
RUN echo '#!/bin/bash' > /app/generate_files.sh && \
    echo 'cd /app/exam-questions' >> /app/generate_files.sh && \
    echo '' >> /app/generate_files.sh && \
    echo '# Generate index.json' >> /app/generate_files.sh && \
    echo 'echo "[" > index.json' >> /app/generate_files.sh && \
    echo 'first=true' >> /app/generate_files.sh && \
    echo 'for file in *.json; do' >> /app/generate_files.sh && \
    echo '  if [ "$file" != "index.json" ] && [ "$file" != "focus-areas.json" ]; then' >> /app/generate_files.sh && \
    echo '    if [ "$first" = "true" ]; then' >> /app/generate_files.sh && \
    echo '      echo "  \"$file\"" >> index.json' >> /app/generate_files.sh && \
    echo '      first=false' >> /app/generate_files.sh && \
    echo '    else' >> /app/generate_files.sh && \
    echo '      echo "  ,\"$file\"" >> index.json' >> /app/generate_files.sh && \
    echo '    fi' >> /app/generate_files.sh && \
    echo '  fi' >> /app/generate_files.sh && \
    echo 'done' >> /app/generate_files.sh && \
    echo 'echo "]" >> index.json' >> /app/generate_files.sh && \
    echo '' >> /app/generate_files.sh && \
    echo '# Generate focus-areas.json with hardcoded focus areas for now' >> /app/generate_files.sh && \
    echo 'echo "[" > focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"1a\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"1b\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"1c\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"1d\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"1e\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"2a\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"2b\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"2c\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"2d\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"2e\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"3a\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"3b\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"3c\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"3d\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"3e\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"4a\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"4b\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"4c\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"4d\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"4e\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"5a\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"5b\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"5c\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"5d\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"5e\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"6a\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"6b\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"6c\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"6d\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"6e\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"6f\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"6g\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"7a\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"7b\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"7c\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"7d\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"7e\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"7f\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"7g\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"8a\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"8b\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"8c\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"8d\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"8e\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"8f\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"8g\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"9a\"," >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "  \"9b\"" >> focus-areas.json' >> /app/generate_files.sh && \
    echo 'echo "]" >> focus-areas.json' >> /app/generate_files.sh && \
    echo '' >> /app/generate_files.sh && \
    echo 'echo "Generated index.json and focus-areas.json"' >> /app/generate_files.sh && \
    chmod +x /app/generate_files.sh

# Generate files using the script
RUN /app/generate_files.sh

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