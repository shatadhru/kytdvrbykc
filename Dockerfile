# ==============================================================================
# Production Multi-Stage Dockerfile for NextLoad LMS (Next.js + Payload CMS 3.0)
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Base Stage: Node 22 (supports native node:sqlite required by question bank)
# ------------------------------------------------------------------------------
FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

# ------------------------------------------------------------------------------
# 2. Dependencies Stage
# ------------------------------------------------------------------------------
FROM base AS deps

# Copy dependency declarations and local patches
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches

# Install frozen production dependencies
RUN pnpm install --frozen-lockfile

# ------------------------------------------------------------------------------
# 3. Builder Stage
# ------------------------------------------------------------------------------
FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy environment variables for Next.js build-time evaluation
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PAYLOAD_SECRET=build-placeholder-secret-min-32-chars-long
ENV BETTER_AUTH_SECRET=build-placeholder-secret-min-32-chars-long
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV BETTER_AUTH_URL=http://localhost:3000
ENV DATABASE_URL=mongodb://host.docker.internal:27017/nextload
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=build-placeholder-cloud
ENV NEXT_PUBLIC_CLOUDINARY_API_KEY=build-placeholder-key

# Build Next.js in standalone mode with Payload CMS
RUN pnpm build

# ------------------------------------------------------------------------------
# 4. Production Runner Stage (Minimal, Secure & Non-Root)
# ------------------------------------------------------------------------------
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Install curl for container health check
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Create dedicated non-root system user and group
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 -g nodejs nextjs

# Create required runtime directories for persistence
RUN mkdir -p /app/data /app/media && \
    chown -R nextjs:nodejs /app/data /app/media

# Copy standalone build output and static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/data ./data

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Native healthcheck using the lightweight health API
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]

