use std::{net::SocketAddr, str::FromStr};
use tokio::net::TcpListener;
use viz::{serve, Request, Result, Router, types::{Json}};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct HelloWorld {
    message: String,
}

async fn hello_world(_: Request) -> Result<Json<HelloWorld>> {
    Ok(Json(HelloWorld {
        message: "Hello, World!".to_string(),
    }))
}

#[tokio::main]
async fn main() -> Result<()> {
    let addr = SocketAddr::from_str("127.0.0.1:3000").unwrap();
    let listener = TcpListener::bind(addr).await?;
    println!("Server listening at http://{addr}");

    let router = Router::new().get("/hello-world", hello_world);

    let app = Router::new().nest("api", router);

    if let Err(err) = serve(listener, app).await {
        println!("{err}");
    }

    Ok(())
}
