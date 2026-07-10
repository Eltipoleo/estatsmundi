import { MongoClient } from "mongodb"
import dotenv from "dotenv"

dotenv.config()

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI environment variable is required")
}

const dbName = process.env.MONGODB_DB || "mundial-stats"

const globalAny = globalThis as unknown as { _mongoClient?: MongoClient }

async function connectToDatabase() {
  if (!globalAny._mongoClient) {
    globalAny._mongoClient = new MongoClient(uri)
    await globalAny._mongoClient.connect()
  }

  return globalAny._mongoClient.db(dbName)
}

export async function getDatabase() {
  return connectToDatabase()
}

export async function getCollection(name: string) {
  const db = await getDatabase()
  return db.collection(name)
}
