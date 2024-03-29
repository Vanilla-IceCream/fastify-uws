use poem::{handler, listener::TcpListener, get, web::Json, Route, Server};
use serde::{Serialize, Deserialize};

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
    println!("Server listening at http://127.0.0.1:3000");
    Server::new(TcpListener::bind("127.0.0.1:3000")).run(app).await
}
