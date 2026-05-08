FROM node:24-bookworm-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/* \
  && npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-bookworm-slim
WORKDIR /app

COPY package*.json ./
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/* \
  && npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN mkdir -p /data
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
