FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy root workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/types/ ./packages/types/
COPY packages/utils/ ./packages/utils/
COPY apps/api/ ./apps/api/

# Generate Prisma client
RUN pnpm --filter @studysync/api exec prisma generate

# Build
RUN pnpm --filter @studysync/api run build

# Production stage
FROM node:20-alpine AS production
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=base /app/apps/api/prisma ./apps/api/prisma
COPY --from=base /app/apps/api/package.json ./apps/api/package.json

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["node", "dist/index.js"]
