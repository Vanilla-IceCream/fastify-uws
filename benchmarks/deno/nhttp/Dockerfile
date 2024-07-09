FROM denoland/deno:1.44.4

WORKDIR /usr/src/app
COPY . .

RUN deno task install

CMD [ "task", "start" ]
