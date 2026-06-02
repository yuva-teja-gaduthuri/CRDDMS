# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with npm ci for reproducible builds
RUN npm ci --only=production

# Runtime stage
FROM node:22-alpine

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy node_modules and package files from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Copy application code
COPY --chown=nodejs:nodejs . .

# Remove unnecessary files
RUN rm -rf .env .git .gitignore

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000), (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to properly handle signals
ENTRYPOINT ["/usr/sbin/dumb-init", "--"]

CMD ["node", "server.js"]
