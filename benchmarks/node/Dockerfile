FROM node:20.12.1

WORKDIR /usr/src/app
COPY . .

RUN npm install

ENTRYPOINT [ "node", "fastify-uws.js" ]
