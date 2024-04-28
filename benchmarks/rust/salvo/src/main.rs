use salvo::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct HelloWorld {
    message: String,
}

#[handler]
async fn hello_world() -> Json<HelloWorld> {
    Json(HelloWorld {
        message: "Hello, World!".to_string(),
    })
}

#[tokio::main]
async fn main() {
    let router = Router::with_path("hello-world").get(hello_world);
    let app = Router::new().push(Router::with_path("api").push(router));
    let acceptor = TcpListener::new("0.0.0.0:3000").bind().await;
    println!(
        "Server listening at http://{}",
        acceptor.local_addr().unwrap()
    );
    Server::new(acceptor).serve(app).await;
}
