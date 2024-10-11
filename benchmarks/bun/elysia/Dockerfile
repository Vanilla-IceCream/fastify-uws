FROM oven/bun:1.1.30

WORKDIR /usr/src/app
COPY . .

RUN bun install

ENTRYPOINT [ "bun", "run", "start" ]
