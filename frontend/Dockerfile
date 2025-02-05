FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install 

COPY . .

COPY .dockerignore /app/.dockerignore

CMD ["npm", "run", "dev", "--", "--host"]
