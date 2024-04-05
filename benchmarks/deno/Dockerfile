FROM denoland/deno:1.42.1

WORKDIR /usr/src/app
COPY . .

RUN deno cache ./*.ts

CMD [ "run", "-A", "h3.ts" ]
