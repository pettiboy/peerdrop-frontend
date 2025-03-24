import { getDatabase } from "~/db/database";
import type { SelfIdentityDocument } from "~/db/schema";
import { v4 as uuidv4 } from "uuid";

// Constant ID for the self-identity document
const SELF_IDENTITY_ID = "self";

/**
 * Creates a new user identity if one doesn't exist or updates the existing one
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

  try {
    // First check if we already have a self identity
    const existingUser = await db.self_identity.findOne().exec();

    if (existingUser) {
      console.debug("Self identity exists, updating", existingUser.id);

      // Use upsert to update the document
      await db.self_identity.upsert({
        id: existingUser.id,
        name,
        userCode,
        ecdhPublicKey,
        ecdhSecretKey,
        eddsaPublicKey,
        eddsaSecretKey,
        createdAt: now,
      });

      // Get the updated document
      return (await db.self_identity
        .findOne({
          selector: { id: existingUser.id },
        })
        .exec()) as SelfIdentityDocument;
    }

    console.debug("Creating new self identity");
    // If no existing user, create with the constant ID
    await db.self_identity.upsert({
      id: SELF_IDENTITY_ID,
      name,
      userCode,
      ecdhPublicKey,
      ecdhSecretKey,
      eddsaPublicKey,
      eddsaSecretKey,
      createdAt: now,
    });

    // Get the new document
    return (await db.self_identity
      .findOne({
        selector: { id: SELF_IDENTITY_ID },
      })
      .exec()) as SelfIdentityDocument;
  } catch (error) {
    console.error("Error in createUserIdentity:", error);
    throw error;
  }
}

/**
 * Gets the current user identity
 */
export async function getCurrentUser(): Promise<SelfIdentityDocument | null> {
  try {
    const db = await getDatabase();

    // Always query by the constant ID first
    let user = await db.self_identity
      .findOne({
        selector: {
          id: SELF_IDENTITY_ID,
        },
      })
      .exec();

    if (!user) {
      // Fallback: try to find any self identity
      user = await db.self_identity.findOne().exec();
    }

    return user;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

/**
 * Updates the user's name
 */
export async function updateUserName(
  name: string
): Promise<SelfIdentityDocument> {
  try {
    const db = await getDatabase();
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("User not found");
    }

    // Use upsert to update the document
    await db.self_identity.upsert({
      ...user,
      name,
    });

    // Get the updated document
    return (await db.self_identity
      .findOne({
        selector: { id: user.id },
      })
      .exec()) as SelfIdentityDocument;
  } catch (error) {
    console.error("Error in updateUserName:", error);
    throw error;
  }
}
