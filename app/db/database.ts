import { createRxDatabase, type RxDatabase, type RxCollection } from "rxdb";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";
import {
  SELF_IDENTITY_SCHEMA,
  CONNECTED_USERS_SCHEMA,
  MESSAGES_SCHEMA,
  type SelfIdentityDocument,
  type ConnectedUserDocument,
  type MessageDocument,
} from "./schema";

export interface Collections {
  selfIdentity: RxCollection<SelfIdentityDocument>;
  connectedUsers: RxCollection<ConnectedUserDocument>;
  messages: RxCollection<MessageDocument>;
}

export type Database = RxDatabase<Collections>;
let dbPromise: Promise<Database> | null = null;

async function createDb(): Promise<Database> {
  const db = await createRxDatabase<Collections>({
    name: "peerdropdb",
    storage: getRxStorageMemory(),
  });

  await db.addCollections({
    selfIdentity: {
      schema: SELF_IDENTITY_SCHEMA,
    },
    connectedUsers: {
      schema: CONNECTED_USERS_SCHEMA,
    },
    messages: {
      schema: MESSAGES_SCHEMA,
    },
  });

  return db;
}

export async function getDatabase(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = createDb();
  }
  return dbPromise;
}

// Helper function to clear database instance (useful for testing/development)
export const clearDatabase = () => {
  dbPromise = null;
};
