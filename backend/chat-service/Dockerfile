FROM node:lts
RUN apt-get update
RUN apt-get install -y openssl

WORKDIR /usr/src/app

COPY package*.json ./

COPY .env ./.env

COPY prisma ./prisma/

RUN npm install 

RUN npm i -g prisma


COPY . .

RUN npx prisma generate --schema ./prisma/schema.prisma

COPY .dockerignore /app/.dockerignore

CMD [ "npm", "run", "dev" ]
