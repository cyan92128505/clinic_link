FROM node:23-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
# This is actually not needed when using volumes in docker-compose
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start development server with host set to allow external connections
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]