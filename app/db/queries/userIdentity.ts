import { getDatabase } from "~/db/database";
import type { SelfIdentityDocument } from "~/db/schema";
import { v4 as uuidv4 } from "uuid";
/**
 * Creates a new user identity
 */
export async function createUserIdentity(
  name: string,
  userCode: string,
  ecdhPublicKey: string,
  ecdhSecretKey: string,
  eddsaPublicKey: string,
  eddsaSecretKey: string,
  createdAt: string
): Promise<SelfIdentityDocument> {
  const db = await getDatabase();
  const now = new Date(createdAt).toISOString();

  const usingId = uuidv4();

  const user = await db.self_identity.insert({
    id: usingId,
    name,
    userCode,
    ecdhPublicKey,
    ecdhSecretKey,
    eddsaPublicKey,
    eddsaSecretKey,
    createdAt: now,
  });

  // save id to local storage
  localStorage.setItem("selfId", usingId);

  return user;
}

/**
 * Gets the current user identity
 */
export async function getCurrentUser(): Promise<SelfIdentityDocument | null> {
  const db = await getDatabase();
  const usingId = localStorage.getItem("selfId");

  if (!usingId) {
    return null;
  }

  return await db.self_identity.findOne(usingId).exec();
}

/**
 * Updates the user's name
 */
export async function updateUserName(
  name: string
): Promise<SelfIdentityDocument> {
  const db = await getDatabase();
  const usingId = localStorage.getItem("selfId");

  if (!usingId) {
    throw new Error("User not found");
  }

  const user = await db.self_identity.findOne(usingId).exec();

  if (!user) {
    throw new Error("User not found");
  }

  await user.patch({
    name,
  });

  return user;
}
