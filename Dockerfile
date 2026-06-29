# ---------- STAGE 1: BUILD ----------
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.30.1 --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml firebase.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy project
COPY . .

# Build project
RUN pnpm build

# ---------- STAGE 2: PRODUCTION ----------
FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.30.1 --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml firebase.json ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/bin ./bin

COPY start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 5000 5005

CMD ["sh", "./start.sh"]