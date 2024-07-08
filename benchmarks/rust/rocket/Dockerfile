FROM rust:1.79.0

WORKDIR /usr/src/app
COPY . .

RUN cargo install --path .

CMD ["rocket"]
