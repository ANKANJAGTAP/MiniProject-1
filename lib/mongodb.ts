import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
console.log(process.env.MONGODB_URI)
if (!uri) {
  throw new Error("Please add MONGODB_URI to your .env.local file");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // Allows attaching to the global object in development mode
  // @ts-ignore
  var _mongoClientPromise: Promise<MongoClient>;
}

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable so the client is not recreated on every file change
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new MongoClient instance
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
