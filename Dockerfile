FROM oven/bun:1 AS builder
WORKDIR /app
COPY package*.json ./
COPY svelte.config.js ./
COPY scripts ./scripts
RUN bun install --frozen-lockfile
COPY . .
RUN bun run scripts/migrate.ts
RUN bun run build

# Use another Node.js Alpine image for the final stage
FROM oven/bun:1 AS production
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production
CMD [ "bun", "build/" ]
