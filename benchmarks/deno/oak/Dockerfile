FROM denoland/deno:1.46.3

WORKDIR /usr/src/app
COPY . .

RUN deno task install

CMD [ "task", "start" ]
