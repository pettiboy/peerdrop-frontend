import { API_URL } from "~/constants/config";
import { eddsa_sign_message } from "~/wasm/pkg";

interface KeyExchangeRequest {
  data: {
    type: "key_exchange";
    user_code: string;
    ecdh_public_key: string;
  };
  signature: string;
}

/**
 * Sends a key exchange message to initiate a connection
 */
export async function sendKeyExchange(
  targetUserCode: string,
  senderUserCode: string,
  senderEcdhPublicKey: string,
  senderEddsaSecretKey: string
): Promise<void> {
  const data = {
    type: "key_exchange" as const,
    user_code: senderUserCode,
    ecdh_public_key: senderEcdhPublicKey,
  };

  // Sign the data using EdDSA
  const signature = eddsa_sign_message(
    JSON.stringify(data),
    senderEddsaSecretKey
  );

  const response = await fetch(`${API_URL}/users/${targetUserCode}/exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data,
      signature,
    } satisfies KeyExchangeRequest),
  });

  if (!response.ok) {
    throw new Error("Failed to send key exchange message");
  }
}
