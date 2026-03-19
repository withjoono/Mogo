# ============================================
# ExamHub Backend - Cloud Run Dockerfile
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and Prisma configuration
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install dependencies
RUN npm ci

# Generate Prisma client (dummy DATABASE_URL for build time)
RUN echo 'DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"' > .env && npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Set ownership
RUN chown -R nestjs:nodejs /app

USER nestjs

# Expose port (Cloud Run uses PORT env variable)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start the application
CMD ["node", "dist/src/main"]
