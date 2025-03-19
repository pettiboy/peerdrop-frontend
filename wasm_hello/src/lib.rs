use ed25519_dalek::{Signature, Signer, SigningKey, VerifyingKey};
use rand_core::OsRng;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

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

#[wasm_bindgen]
pub fn eddsa_verify_signature(message: &str, signature: &str, public_key: &str) -> bool {
    // -- message
    let message: &[u8] = message.as_bytes();

    // -- signature
    let signature_bytes = hex::decode(signature).unwrap();
    let signature_array: &[u8; 64] = signature_bytes
        .as_slice()
        .try_into()
        .expect("Slice with incorrect length");
    let reconstructed_sign = Signature::from_bytes(signature_array);

    // -- public key
    // decode pk from hex
    let public_key_bytes = hex::decode(public_key).expect("invalid hex string for secret key");

    // ensure its 32 bytes
    let verifying_key_array: &[u8; 32] = &public_key_bytes
        .try_into()
        .expect("public key must be 32 bytes");

    let verifying_key = VerifyingKey::from_bytes(verifying_key_array).expect("invalid public key");

    let is_valid_sign = verifying_key
        .verify_strict(message, &reconstructed_sign)
        .is_ok();

    return is_valid_sign;
}

#[cfg(test)]
mod tests {
    use wasm_bindgen_test::wasm_bindgen_test;

    use super::*;

    #[test]
    fn test_greet() {
        let result = greet("World");
        println!("{:?}", result);
        assert_eq!(result, "Hello, World!");
    }

    #[wasm_bindgen_test]
    #[allow(dead_code)]
    fn test_eddsa() {
        // generate ed keys
        let js_value = eddsa_keygen();
        let ed_keys: EddsaKeys = serde_wasm_bindgen::from_value(js_value).unwrap();
        println!("ed_keys: {:?}", ed_keys);

        // sign message using the keypair
        let msg = "hello world";
        let signature = eddsa_sign_message(msg, &ed_keys.secret_key);
        println!("signature: {}", signature);

        // verify this signature
        let is_sign_valid = eddsa_verify_signature(msg, &signature, &ed_keys.public_key);
        println!("is valid: {}", is_sign_valid);

        assert!(is_sign_valid, "signature should be valid");
    }
}
