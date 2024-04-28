use poem::{get, handler, listener::TcpListener, web::Json, Route, Server};
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
async fn main() -> Result<(), std::io::Error> {
    let router = Route::new().at("/hello-world", get(hello_world));
    let app = Route::new().nest("/api", router);
    println!("Server listening at http://0.0.0.0:3000");
    Server::new(TcpListener::bind("0.0.0.0:3000"))
        .run(app)
        .await
}
