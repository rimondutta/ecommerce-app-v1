# -----------------------------------------------------------------------------
# Stage 1: Base runtime image with Alpine Linux and compatibility libraries
# -----------------------------------------------------------------------------
FROM node:22-alpine AS base

# Install libc6-compat to support native process bindings on Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# -----------------------------------------------------------------------------
# Stage 2: Install dependencies using reproducible npm ci
# -----------------------------------------------------------------------------
FROM base AS deps

WORKDIR /app

# Copy package manifests and npm configuration
COPY package.json package-lock.json* .npmrc* ./

# Install exact dependency tree (respecting .npmrc legacy-peer-deps)
RUN npm ci

# -----------------------------------------------------------------------------
# Stage 3: Build the Next.js application in standalone mode
# -----------------------------------------------------------------------------
FROM base AS builder

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Set build-time environment flags
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Execute production build (produces .next/standalone and .next/static)
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 4: Minimal production runner
# -----------------------------------------------------------------------------
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Configure networking: listen on all interfaces and support dynamic PORT (e.g., Railway)
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Security: Create non-root system group and user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets from public folder
COPY --from=builder /app/public ./public

# Prepare .next directory and ensure write permissions for ISR cache revalidation
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

# Copy standalone server build and static output with non-root ownership
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Drop privileges to non-root user
USER nextjs

# Expose default HTTP port
EXPOSE 3000

# Start standalone Next.js server (dynamically binds to $PORT and $HOSTNAME)
CMD ["node", "server.js"]
