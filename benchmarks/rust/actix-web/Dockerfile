FROM rust:1.77.1

WORKDIR /usr/src/app
COPY . .

RUN cargo install --path .

CMD ["actix-web"]
