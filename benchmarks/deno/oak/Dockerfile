FROM denoland/deno:2.0.0

WORKDIR /usr/src/app
COPY . .

RUN deno task install

CMD [ "task", "start" ]
