FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

FROM base AS dependencies

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy backend package.json
COPY backend/package.json backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

FROM base AS build

WORKDIR /app

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/backend/node_modules ./backend/node_modules

# Copy source
COPY backend ./backend
COPY package.json ./

# Build
WORKDIR /app/backend
RUN pnpm build

FROM base AS runtime

WORKDIR /app

# Copy built files and dependencies
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/package.json ./

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]
