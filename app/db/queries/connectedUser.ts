import { getDatabase } from "~/db/database";
import type { ConnectedUserDocument } from "~/db/schema";

/**
 * Adds a connected user after successful key exchange
 */
export async function addConnectedUser(
  userCode: string,
  ecdhPublicKey: string,
  eddsaPublicKey: string,
  symmetricKey: string,
  name?: string
): Promise<ConnectedUserDocument> {
  const db = await getDatabase();

  const now = new Date().toISOString();
  const connectedUser = await db.connectedUsers.insert({
    userCode,
    ecdhPublicKey,
    eddsaPublicKey,
    symmetricKey,
    name,
    createdAt: now,
  });

  return connectedUser;
}

/**
 * Gets a connected user by their user code
 */
export async function getConnectedUser(
  userCode: string
): Promise<ConnectedUserDocument | null> {
  const db = await getDatabase();
  return await db.connectedUsers.findOne(userCode).exec();
}

/**
 * Gets all connected users
 */
export async function getConnectedUsers(): Promise<ConnectedUserDocument[]> {
  const db = await getDatabase();
  return await db.connectedUsers.find().exec();
}

/**
 * Removes a connected user
 */
export async function removeConnectedUser(userCode: string): Promise<void> {
  const db = await getDatabase();
  const user = await db.connectedUsers.findOne(userCode).exec();

  if (user) {
    await user.remove();
  }
}
