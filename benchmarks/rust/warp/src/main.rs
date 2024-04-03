use std::net::SocketAddr;
use warp::Filter;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct HelloWorld {
    message: String,
}

#[tokio::main]
async fn main() {
    let addr: SocketAddr = ([0, 0, 0, 0], 3000).into();

    let api = warp::path("api");

    let hello_world = warp::path("hello-world")
        .map(|| {
            warp::reply::json({ &HelloWorld {
                message: "Hello, World!".to_string(),
            } })
        });

    let router = warp::any().and(
        api.and(hello_world)
    );

    println!("Server listening at http://{}", addr);
    warp::serve(router).run(addr).await;
}
