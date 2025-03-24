import {
  createRxDatabase,
  type RxDatabase,
  type RxCollection,
  addRxPlugin,
} from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import {
  SELF_IDENTITY_SCHEMA,
  CONNECTED_USERS_SCHEMA,
  MESSAGES_SCHEMA,
  type SelfIdentityDocument,
  type ConnectedUserDocument,
  type MessageDocument,
} from "./schema";

// Add dev-mode plugin in development
if (process.env.NODE_ENV !== "production") {
  addRxPlugin(RxDBDevModePlugin);
}

export interface Collections {
  self_identity: RxCollection<SelfIdentityDocument>;
  connected_users: RxCollection<ConnectedUserDocument>;
  messages: RxCollection<MessageDocument>;
}

export type Database = RxDatabase<Collections>;
let dbPromise: Promise<Database> | null = null;
let dbInstance: Database | null = null;

const DATABASE_NAME = "peerdropdb";

async function createDb(): Promise<Database> {
  // Only clean up if explicitly requested via clearDatabase
  // Do not destroy existing database on normal initialization

  console.debug("Creating or connecting to database");

  const db = await createRxDatabase<Collections>({
    name: DATABASE_NAME,
    storage: wrappedValidateAjvStorage({
      storage: getRxStorageDexie(),
    }),
    multiInstance: false, // Set to false to avoid conflicts between tabs
    eventReduce: false, // Set to false for more predictable behavior
    ignoreDuplicate: true, // Ignore duplicate database instances
  });

  console.debug("Created or connected to database instance");

  try {
    await db.addCollections({
      self_identity: {
        schema: SELF_IDENTITY_SCHEMA,
        autoMigrate: true,
      },
      connected_users: {
        schema: CONNECTED_USERS_SCHEMA,
        autoMigrate: true,
      },
      messages: {
        schema: MESSAGES_SCHEMA,
        autoMigrate: true,
      },
    });

    console.debug("Added collections to database");
    dbInstance = db;
    return db;
  } catch (error) {
    console.error("Error adding collections:", error);
    await db.destroy();
    throw error;
  }
}

export async function getDatabase(): Promise<Database> {
  if (!dbPromise) {
    console.debug("Creating new database promise");
    dbPromise = createDb().catch((error) => {
      console.error("Error creating database:", error);
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

// Helper function to clear database instance (useful for testing/development)
export const clearDatabase = async () => {
  console.debug("Clearing database");
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = null;
  }
  if (dbPromise) {
    try {
      const db = await dbPromise;
      await db.destroy();
    } catch (error) {
      console.debug("Error destroying database:", error);
    }
  }
  dbPromise = null;
};
