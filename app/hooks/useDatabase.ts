import { useEffect, useState } from "react";
import { getDatabase, type Database } from "~/db/database";

export function useDatabase() {
  const [db, setDb] = useState<Database | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initDb = async () => {
      try {
        const database = await getDatabase();
        if (isMounted) {
          setDb(database);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to initialize database")
          );
          setDb(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initDb();

    return () => {
      isMounted = false;
    };
  }, []);

  return { db, error, isLoading };
}
