import { createRxDatabase, type RxDatabase, type RxCollection } from "rxdb";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";
import { USER_SCHEMA, type UserDocument } from "./schema";

// Define database collections type
interface DatabaseCollections {
  users: RxCollection<UserDocument>;
}

// Define database type
export type Database = RxDatabase<DatabaseCollections>;

let dbPromise: Promise<Database> | null = null;

export const getDatabase = async (): Promise<Database> => {
  if (dbPromise) return dbPromise;

  dbPromise = createRxDatabase<DatabaseCollections>({
    name: "peerdropdb",
    storage: getRxStorageMemory(),
  }).then(async (db) => {
    // Create collections
    await db.addCollections({
      users: {
        schema: USER_SCHEMA,
      },
    });

    return db;
  });

  return dbPromise;
};

// Helper function to clear database instance (useful for testing/development)
export const clearDatabase = () => {
  dbPromise = null;
};
