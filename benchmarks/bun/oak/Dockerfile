FROM oven/bun:1.1.29

WORKDIR /usr/src/app
COPY . .

RUN echo '[install.scopes]\n"@jsr" = "https://npm.jsr.io"' > $HOME/.bunfig.toml
RUN bun install

ENTRYPOINT [ "bun", "run", "start" ]
