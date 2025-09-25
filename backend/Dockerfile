# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy the rest of the source
COPY . .

# Build TypeScript
RUN npx tsc

EXPOSE 5000

CMD ["node", "dist/server.js"]
