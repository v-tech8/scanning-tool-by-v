# Step 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
# We copy only package.json first to leverage Docker layer caching
COPY package.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN npm run build

# Step 2: Serve the application using Nginx
FROM nginx:alpine

# Copy custom Nginx configuration to support React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
