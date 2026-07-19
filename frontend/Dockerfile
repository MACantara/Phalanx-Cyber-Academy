FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 80

CMD ["sh", "-c", "npx vite preview --host --port ${PORT:-4173}"]
