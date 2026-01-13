FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

COPY payload.config.ts tsconfig.json ./

COPY collections ./collections
# ✅ ADD THESE LINES
RUN mkdir -p /app/.next/cache/images \
 && chown -R node:node /app/.next

EXPOSE 80
USER node
CMD ["npm", "start"]
