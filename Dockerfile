FROM node:20 AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

FROM base AS dev
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "start:dev"]