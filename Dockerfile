# Stage 1: install production dependencies
FROM node:20-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 \
      make \
      g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: runtime image
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY server.js ./
COPY backend ./backend
COPY db ./db
COPY frontend ./frontend

RUN chown -R node:node /app

EXPOSE 3000
USER node

CMD ["node", "server.js"]
