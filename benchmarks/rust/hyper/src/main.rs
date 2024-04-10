use std::convert::Infallible;
use std::net::SocketAddr;

use http_body_util::Full;
use hyper::body::Bytes;
use hyper::header::HeaderValue;
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::{Request, Response};
use hyper_util::rt::TokioIo;
use serde::{Deserialize, Serialize};
use serde_json;
use tokio::net::TcpListener;

#[derive(Serialize, Deserialize)]
struct HelloWorld {
    message: String,
}

async fn hello_world(
    req: Request<hyper::body::Incoming>,
) -> Result<Response<Full<Bytes>>, Infallible> {
    match req.uri().path() {
        "/api/hello-world" => {
            let data = HelloWorld {
                message: "Hello, World!".to_string(),
            };
            let json_response = serde_json::to_string(&data).unwrap();

            let mut response = Response::new(Full::new(Bytes::from(json_response)));
            response.headers_mut().insert(
                hyper::header::CONTENT_TYPE,
                HeaderValue::from_static("application/json"),
            );
            Ok(response)
        }
        _ => {
            let response = Response::builder()
                .status(404)
                .body(Full::new(Bytes::from("Not Found")))
                .unwrap();
            Ok(response)
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    let listener = TcpListener::bind(addr).await?;
    println!("Server listening at http://{addr}");

    loop {
        let (stream, _) = listener.accept().await?;
        let io = TokioIo::new(stream);

        tokio::task::spawn(async move {
            if let Err(err) = http1::Builder::new()
                .serve_connection(io, service_fn(hello_world))
                .await
            {
                eprintln!("Error serving connection: {:?}", err);
            }
        });
    }
}
