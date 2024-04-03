use graphul::{http::Methods, Graphul, extract::{Json}};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct HelloWorld {
    message: String,
}

#[tokio::main]
async fn main() {
    let mut app = Graphul::new();
    let mut router = app.group("api");
    
    router.get("/hello-world", || async move {
        Json(HelloWorld {
            message: "Hello, World!".to_string(),
        })
    });

    println!("Server listening at http://0.0.0.0:3000");
    app.run("0.0.0.0:3000").await;
}
