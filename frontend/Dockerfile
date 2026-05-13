# Production Dockerfile for ChronoHealth AI Frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
ENV NEXT_PUBLIC_API_URL=http://localhost:8000
RUN npm run build

# Production Runner
FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
