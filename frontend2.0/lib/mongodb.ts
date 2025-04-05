import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'finwise';

// Check if the MongoDB URI is defined
if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export async function connectToDatabase() {
  // If we have a cached connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  try {
    // Create a new MongoDB client
    const client = new MongoClient(MONGODB_URI);
    
    // Connect to the client
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    // Get the database
    const db = client.db(MONGODB_DB);
    
    // Cache the client and db connections
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}
