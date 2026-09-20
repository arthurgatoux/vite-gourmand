import { MongoClient } from "mongodb";

// Singleton MongoDB Atlas (reconnexion automatique / cache sur globalThis en dev pour le HMR Next.js)
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
