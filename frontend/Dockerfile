# Frontend Dockerfile (development server)
FROM node:18-alpine

# Install dependencies for better file watching inside containers
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

WORKDIR /app

# Install deps first (better caching)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy the rest of the source
COPY . .

# Expose the CRA dev server port
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]
