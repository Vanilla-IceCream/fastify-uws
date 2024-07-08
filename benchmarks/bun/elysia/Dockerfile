FROM oven/bun:1.1.18

WORKDIR /usr/src/app
COPY . .

RUN bun install

ENTRYPOINT [ "bun", "run", "start" ]
