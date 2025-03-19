use wasm_bindgen::prelude::*;

use ed25519_dalek::{Signature, Signer, SigningKey};
use rand::rngs::OsRng;

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[derive(Debug)]
pub struct EddsaKeys {
    pub public_key: String,
    pub secret_key: String,
}

pub fn eddsa_keygen() -> EddsaKeys {
    let mut csprng = OsRng;
    let signing_key: SigningKey = SigningKey::generate(&mut csprng);

    let ed_public_hex = hex::encode(signing_key.verifying_key().to_bytes());
    let ed_private_hex = hex::encode(signing_key.to_bytes());

    return EddsaKeys {
        public_key: ed_public_hex,
        secret_key: ed_private_hex,
    };
}

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

pub fn create_eddsa_keypair() {
    let mut csprng = OsRng;
    let signing_key: SigningKey = SigningKey::generate(&mut csprng);

    let ed_private_hex = hex::encode(signing_key.to_bytes());
    let ed_public_hex = hex::encode(signing_key.verifying_key().to_bytes());
    let string_message = "Sign this";

    println!("Ed25519 Private Key (hex): {}", ed_private_hex);
    println!("Ed25519 Public Key  (hex): {}", ed_public_hex);

    let message: &[u8] = string_message.as_bytes();
    let signature: Signature = signing_key.sign(message);

    // convert signature to hex
    let signature_hex = hex::encode(signature.to_bytes());

    println!("signature: {}", signature);
    println!("signatureHex: {}", signature_hex);

    // reconstruct signature from hex string
    let reconstructed_message = string_message.as_bytes();
    let signature_bytes = hex::decode(signature_hex).unwrap();
    let signature_array: &[u8; 64] = signature_bytes
        .as_slice()
        .try_into()
        .expect("Slice with incorrect length");
    let reconstructed_sign = Signature::from_bytes(signature_array);

    let is_valid_sign = signing_key
        .verify(reconstructed_message, &reconstructed_sign)
        .is_ok();
    println!("is signature valid {}", is_valid_sign);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greet() {
        let result = greet("World");
        println!("{:?}", result);
        // assert_eq!(result, "Hello, World!");
    }

    #[test]
    fn test_eddsa() {
        // generate ed keys
        let ed_keys = eddsa_keygen();
        println!("ed_keys: {:?}", ed_keys);

        // sign message using the keypair
        let msg = "hello world";
        let signature = eddsa_sign_message(msg, &ed_keys.secret_key);
        println!("signature: {}", signature);
    }

    #[test]
    fn test_create_eddsa_keypair() {
        create_eddsa_keypair()
    }
}
