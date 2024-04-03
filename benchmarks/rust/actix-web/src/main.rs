use actix_web::{get, web, App, HttpServer, Responder, Result};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct HelloWorld {
    message: String,
}

#[get("/hello-world")]
async fn hello_world() -> Result<impl Responder> {
    Ok(web::Json(HelloWorld {
        message: "Hello, World!".to_string(),
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Server listening at http://0.0.0.0:3000");

    HttpServer::new(|| {
        App::new().service(
            web::scope("/api").service(hello_world),
        )
    })
    .bind(("0.0.0.0", 3000))?
    .run()
    .await
}
