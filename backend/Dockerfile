FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN chmod +x ./docker-entrypoint.sh && npm run build

EXPOSE 3000

CMD ["npm", "run", "start:docker"]
