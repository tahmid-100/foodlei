# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# সব dependencies install করো (dev সহ — build এর জন্য দরকার)
RUN npm ci

COPY . .

# Build করো
RUN npm run build

# Production এ devDependencies সরাও
RUN npm prune --production

EXPOSE 3000

CMD ["node", "dist/main.js"]