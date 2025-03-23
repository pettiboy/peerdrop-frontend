use wasm_bindgen::prelude::*;
use ed25519_dalek::SigningKey;
use rand_core::OsRng;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct EddsaKeys {
    pub public_key: String,
    pub secret_key: String,
}

#[wasm_bindgen]
pub fn eddsa_keygen() -> JsValue {
    let mut csprng = OsRng;
    let signing_key: SigningKey = SigningKey::generate(&mut csprng);

    let ed_public_hex = hex::encode(signing_key.verifying_key().to_bytes());
    let ed_private_hex = hex::encode(signing_key.to_bytes());

    let ed_keys = EddsaKeys {
        public_key: ed_public_hex,
        secret_key: ed_private_hex,
    };

    serde_wasm_bindgen::to_value(&ed_keys).unwrap()
}
