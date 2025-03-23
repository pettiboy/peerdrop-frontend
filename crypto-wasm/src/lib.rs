pub mod eddsa;

use rand_core::OsRng;
use x25519_dalek::{EphemeralSecret, PublicKey};

pub fn ecdh() {
    let mut csprng = OsRng;
    let alice_secret = EphemeralSecret::random_from_rng(&mut csprng);
    let alice_public = PublicKey::from(&alice_secret);

    let apk = hex::encode(alice_public.to_bytes());

    println!("aclice_pk {:?}", apk);
}

#[cfg(test)]
mod tests {
    use wasm_bindgen_test::wasm_bindgen_test;

    use super::*;

    #[test]
    fn test_ecdh() {
        ecdh();
    }

    #[wasm_bindgen_test]
    #[allow(dead_code)]
    fn test_eddsa() {
        // generate ed keys
        let js_value = eddsa::keygen::eddsa_keygen();
        let ed_keys: eddsa::keygen::EddsaKeys = serde_wasm_bindgen::from_value(js_value).unwrap();
        println!("ed_keys: {:?}", ed_keys);

        // sign message using the keypair
        let msg = "hello world";
        let signature = eddsa::signgen::eddsa_sign_message(msg, &ed_keys.secret_key);
        println!("signature: {}", signature);

        // verify this signature
        let is_sign_valid =
            eddsa::verify::eddsa_verify_signature(msg, &signature, &ed_keys.public_key);
        println!("is valid: {}", is_sign_valid);

        assert!(is_sign_valid, "signature should be valid");
    }
}
