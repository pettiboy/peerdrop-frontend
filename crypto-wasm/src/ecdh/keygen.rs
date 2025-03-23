use rand_core::OsRng;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use x25519_dalek::{PublicKey, StaticSecret};

#[derive(Debug, Serialize, Deserialize)]
pub struct EddsaKeys {
    pub public_key: String,
    pub secret_key: String,
}

#[wasm_bindgen]
pub fn ecdh_keygen() -> JsValue {
    let mut csprng = OsRng;

    let secret = StaticSecret::random_from_rng(&mut csprng);
    let public = PublicKey::from(&secret);

    let secret_hex = hex::encode(secret.to_bytes());
    let public_hex = hex::encode(public.to_bytes());

    let keys = EddsaKeys {
        secret_key: secret_hex,
        public_key: public_hex,
    };

    serde_wasm_bindgen::to_value(&keys).unwrap()
}
