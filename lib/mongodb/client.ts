import { MongoClient } from "mongodb";

/**
 * Client MongoDB Atlas, singleton reutilise entre les invocations serveur
 * (Server Actions / Route Handlers). Cluster vite-gourmand, base
 * vite_gourmand_stats, cf. docs/NoSQL-MongoDB-ViteGourmand.md.
 *
 * En developpement, le client est mis en cache sur `globalThis` pour
 * survivre au hot-reload de Next.js sans multiplier les connexions.
 */
const uri = process.env.MONGODB_URI!;

const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

function createClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(uri);
  return client.connect();
}

export function getMongoClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    if (!globalForMongo._mongoClientPromise) {
      globalForMongo._mongoClientPromise = createClientPromise();
    }
    return globalForMongo._mongoClientPromise;
  }

  return createClientPromise();
}
