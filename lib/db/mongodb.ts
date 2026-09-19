import { MongoClient, Db, MongoClientOptions } from "mongodb";
import fs from "fs";
import path from "path";

const DEFAULT_DB_NAME = "campus_saathi";

/**
 * Safely loads .env.local if not already populated (helpful for standalone scripts).
 */
function ensureEnvLoaded() {
  if (!process.env.MONGODB_URI) {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, "utf-8").split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const idx = trimmed.indexOf("=");
        if (idx !== -1) {
          const key = trimmed.slice(0, idx).trim();
          let val = trimmed.slice(idx + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

/**
 * Validates and retrieves the MongoDB URI from environment variables.
 * Throws a sanitized server-side error without exposing secrets if missing.
 */
function getMongoUri(): string {
  ensureEnvLoaded();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "[CampusSaathi DB] Configuration error: MONGODB_URI is not defined in environment variables. Please check .env.local."
    );
  }
  return uri;
}

const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
};

// Global augmentation for connection caching across Next.js dev reloads
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoClient: MongoClient | undefined;
}

/**
 * Lazily initializes and returns the cached MongoClient promise.
 */
export function getMongoClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development" || typeof window === "undefined") {
    if (!global._mongoClientPromise) {
      const uri = getMongoUri();
      const client = new MongoClient(uri, options);
      global._mongoClient = client;
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    const uri = getMongoUri();
    const client = new MongoClient(uri, options);
    return client.connect();
  }
}

/**
 * Returns the connected MongoClient instance.
 */
export async function getMongoClient(): Promise<MongoClient> {
  return getMongoClientPromise();
}

/**
 * Returns the target database instance.
 * Database name defaults to MONGODB_DB env var or "campus_saathi".
 */
export async function getDb(customDbName?: string): Promise<Db> {
  const clientInstance = await getMongoClientPromise();
  const dbName = customDbName || process.env.MONGODB_DB || DEFAULT_DB_NAME;
  return clientInstance.db(dbName);
}

export default getMongoClientPromise;
