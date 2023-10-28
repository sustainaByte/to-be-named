FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --prefer-offline

COPY . .

RUN npm run format && npm run lint && npm audit

EXPOSE 5000

CMD ["npm", "run", "start"]