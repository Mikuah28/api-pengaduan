# Dockerfile
FROM oven/bun:1-slim AS base
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Copy prisma schema
COPY prisma ./prisma/

# Install dependencies & generate Prisma Client
RUN bun install --frozen-lockfile
RUN bunx prisma generate

# Copy source code
COPY . .

EXPOSE 5000

# Run migrations on startup (opsional)
CMD ["sh", "-c", "bunx prisma migrate deploy && bun src/index.js"]