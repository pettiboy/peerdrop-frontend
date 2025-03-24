import {
  createRxDatabase,
  type RxDatabase,
  type RxCollection,
  addRxPlugin,
  removeRxDatabase,
} from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import {
  SELF_IDENTITY_SCHEMA,
  CONNECTED_USERS_SCHEMA,
  MESSAGES_SCHEMA,
  type SelfIdentityDocument,
  type ConnectedUserDocument,
  type MessageDocument,
} from "./schema";

export interface Collections {
  "self-identity": RxCollection<SelfIdentityDocument>;
  "connected-users": RxCollection<ConnectedUserDocument>;
  messages: RxCollection<MessageDocument>;
}

export type Database = RxDatabase<Collections>;
let dbPromise: Promise<Database> | null = null;
let dbInstance: Database | null = null;

async function createDb(): Promise<Database> {
  // If there's an existing database instance, clean it up first
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = null;
  }

  // Remove any existing database with the same name
  await removeRxDatabase("peerdropdb", getRxStorageDexie());

  // Add dev-mode plugin in development
  if (process.env.NODE_ENV !== "production") {
    const devModeModule = await import("rxdb/plugins/dev-mode");
    addRxPlugin(devModeModule.RxDBDevModePlugin);
  }

  const db = await createRxDatabase<Collections>({
    name: "peerdropdb",
    storage: wrappedValidateAjvStorage({
      storage: getRxStorageDexie(),
    }),
    multiInstance: true,
    eventReduce: true,
  });

  await db.addCollections({
    "self-identity": {
      schema: SELF_IDENTITY_SCHEMA,
    },
    "connected-users": {
      schema: CONNECTED_USERS_SCHEMA,
    },
    messages: {
      schema: MESSAGES_SCHEMA,
    },
  });

  dbInstance = db;
  return db;
}

export async function getDatabase(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = createDb();
  }
  return dbPromise;
}

// Helper function to clear database instance (useful for testing/development)
export const clearDatabase = async () => {
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = null;
  }
  if (dbPromise) {
    try {
      const db = await dbPromise;
      await db.destroy();
    } catch (error) {
      // Ignore errors if database is already destroyed
    }
  }
  dbPromise = null;
  await removeRxDatabase("peerdropdb", getRxStorageDexie());
};
