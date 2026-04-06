# Backend
FROM node:20-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --production
COPY backend/ .
RUN mkdir -p uploads logs
EXPOSE 5000
CMD ["node", "src/server.js"]
