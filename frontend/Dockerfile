# Stage 1: Build the React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build args for Vite env vars (injected at build time)
ARG VITE_API_URL
ARG VITE_GRAPHQL_URL
ARG VITE_INTERVIEW_SERVICE_URL

# Build the app (Vite bakes VITE_* env vars into the bundle)
RUN npm run build

# Stage 2: Serve static files
FROM node:20-alpine

RUN npm install -g serve

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Railway assigns PORT dynamically
ENV PORT=3000

EXPOSE ${PORT}

CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
