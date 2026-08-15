# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# copy client and server
COPY client ./client
COPY server ./server

# install and build client
WORKDIR /app/client
RUN npm install
RUN npm run build

# install server deps
WORKDIR /app/server
RUN npm install --production

# Production image
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/server ./server
COPY --from=build /app/client/dist ./client/dist
WORKDIR /app/server
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node","index.js"]
