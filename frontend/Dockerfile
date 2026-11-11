# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /frontend
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG BACKEND_INTERNAL_URL=http://backend:8080
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /frontend
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /frontend/.next/standalone ./
COPY --from=build --chown=node:node /frontend/.next/static ./.next/static
COPY --from=build --chown=node:node /frontend/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
