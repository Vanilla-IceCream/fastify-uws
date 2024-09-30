FROM rust:1.81.0

WORKDIR /usr/src/app
COPY . .

RUN cargo install --path .

CMD ["poem"]
