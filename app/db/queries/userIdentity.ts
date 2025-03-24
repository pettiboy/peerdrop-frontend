import { getDatabase } from "~/db/database";
import type { SelfIdentityDocument } from "~/db/schema";

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

  const user = await db.selfIdentity.insert({
    id: "self",
    name,
    userCode,
    ecdhPublicKey,
    ecdhSecretKey,
    eddsaPublicKey,
    eddsaSecretKey,
    createdAt: now,
  });

  return user;
}

/**
 * Gets the current user identity
 */
export async function getCurrentUser(): Promise<SelfIdentityDocument | null> {
  const db = await getDatabase();
  return await db.selfIdentity.findOne("self").exec();
}

/**
 * Updates the user's name
 */
export async function updateUserName(
  name: string
): Promise<SelfIdentityDocument> {
  const db = await getDatabase();
  const user = await db.selfIdentity.findOne("self").exec();

  if (!user) {
    throw new Error("User not found");
  }

  await user.patch({
    name,
  });

  return user;
}
