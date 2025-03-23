import { getDatabase } from "../db/database";
import type { UserDocument } from "../db/schema";
import { eddsa_keygen, ecdh_keygen } from "../wasm/pkg";

/**
 * Creates a new user identity with generated keys using WASM
 */
export async function createUserIdentity(name: string): Promise<UserDocument> {
  const db = await getDatabase();

  // Generate key pairs using WASM bindings
  const eddsaKeys = eddsa_keygen();
  const ecdhKeys = ecdh_keygen();

  const now = new Date().toISOString();
  const user = await db.users.insert({
    id: "aslfkj",
    name,
    deviceId: "aslfkj",
    ecdhPublicKey: ecdhKeys.public_key,
    ecdhPrivateKey: ecdhKeys.secret_key,
    eddsaPublicKey: eddsaKeys.public_key,
    eddsaPrivateKey: eddsaKeys.secret_key,
    createdAt: now,
    updatedAt: now,
  });

  return user;
}

/**
 * Gets the current user identity
 */
export async function getCurrentUser(): Promise<UserDocument | null> {
  const db = await getDatabase();
  const users = await db.users.find().exec();
  return users[0] || null;
}

/**
 * Updates the user's name
 */
export async function updateUserName(
  userId: string,
  name: string
): Promise<UserDocument> {
  const db = await getDatabase();
  const user = await db.users.findOne(userId).exec();

  if (!user) {
    throw new Error("User not found");
  }

  await user.patch({
    name,
    updatedAt: new Date().toISOString(),
  });

  return user;
}

/**
 * Deletes a user identity
 */
export async function deleteUser(userId: string): Promise<void> {
  const db = await getDatabase();
  const user = await db.users.findOne(userId).exec();

  if (user) {
    await user.remove();
  }
}
