#[macro_use] extern crate rocket;

use rocket::serde::{Serialize, json::Json};

#[derive(Serialize)]
#[serde(crate = "rocket::serde")]
struct HelloWorld {
    message: String,
}

#[get("/hello-world")]
fn api() -> Json<HelloWorld> {
    Json(HelloWorld {
        message: "Hello, World!".to_string(),
    })
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .configure(rocket::Config::figment().merge(("port", 3000)))
        .mount("/api", routes![api])
}
