FROM ubuntu:noble AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y nodejs python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM ubuntu:noble
WORKDIR /app

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y nodejs python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY src/db /data

RUN groupadd -r node && useradd -r -g node node && chown -R node:node /app /data
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
