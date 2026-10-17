FROM node:20-alpine AS base

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat openssl

# Copy root and shared package definitions
COPY package*.json ./
COPY backend/shared/package*.json ./backend/shared/
COPY backend/services/auth-service/package*.json ./backend/services/auth-service/
COPY backend/services/user-service/package*.json ./backend/services/user-service/
COPY backend/services/academic-service/package*.json ./backend/services/academic-service/
COPY backend/services/notification-service/package*.json ./backend/services/notification-service/
COPY backend/gateway/package*.json ./backend/gateway/

# Install dependencies across all workspaces
RUN npm install

# Copy source files
COPY backend/shared ./backend/shared
COPY backend/services ./backend/services
COPY backend/gateway ./backend/gateway
COPY backend/scripts ./backend/scripts

# Generate Prisma Client
RUN npm run db:generate

# Default argument for which service to run
ARG SERVICE_DIR=backend/services/auth-service
ENV TARGET_DIR=${SERVICE_DIR}

EXPOSE 5000 5001 5002 5003 5004

CMD ["sh", "-c", "node ${TARGET_DIR}/src/app.js"]
