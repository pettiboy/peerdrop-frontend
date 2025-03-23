use ed25519_dalek::{Signature, Signer, SigningKey};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn eddsa_sign_message(signing_message: &str, secret_key: &str) -> String {
    let message: &[u8] = signing_message.as_bytes();

    // decode sk from hex
    let secret_key_bytes = hex::decode(secret_key).expect("invalid hex string for secret key");

    // ensure its 32 bytes
    let signing_key_array: &[u8; 32] = &secret_key_bytes
        .try_into()
        .expect("secret key must be 32 bytes");

    // create signing key
    let signing_key = SigningKey::from_bytes(signing_key_array);

    // sign the message
    let signature: Signature = signing_key.sign(message);

    // convert signature to hex
    let signature_hex = hex::encode(signature.to_bytes());

    return signature_hex;
}
