FROM node:22-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npx prisma generate && npm run build
EXPOSE 4000
CMD ["sh","-c","npx prisma db push && npm run prisma:seed && npm start"]
