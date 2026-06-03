FROM oven/bun:latest AS base
WORKDIR /app

FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS release
COPY --from=install /app/node_modules ./node_modules
COPY . .

EXPOSE 5000

CMD ["bun", "run", "start"]