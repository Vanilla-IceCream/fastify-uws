FROM denoland/deno:1.42.1

WORKDIR /usr/src/app
COPY . .

RUN deno cache deno.ts

CMD ["run", "-A", "deno.ts"]
