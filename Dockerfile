FROM node:16

WORKDIR /usr/src/app/backend 

COPY backend/package*.json ./

RUN npm install

COPY backend/ .

EXPOSE 8080

CMD ["npm", "run", "start"]
