# Build stage - Generate the exam questions index file
FROM node:20 AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci || true

# Copy source code and generate index
COPY . .
RUN node tools/gen-index.mjs

# Optional: Build static assets if needed
# RUN npm run build

# Production stage - Serve static files with nginx
FROM nginx:alpine

# Copy exam questions directory to nginx web root
COPY --from=build /app/exam-questions/ /usr/share/nginx/html/exam-questions/

# Alternative: Copy built dist folder if using a build process
# COPY --from=build /app/dist/ /usr/share/nginx/html/

# Alternative: Copy entire app directory for fully static serving
# COPY --from=build /app/ /usr/share/nginx/html/

# Expose port 80 for web traffic
EXPOSE 80

# Start nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]