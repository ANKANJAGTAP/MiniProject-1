import { MongoClient, Db, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please add MONGODB_URI to your .env file');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('turfbook');
}

// Database schemas
export interface TurfDocument {
  _id?: ObjectId;
  ownerId: ObjectId;
  name: string;
  address: string;
  pricePerHour: number;
  images: string[];
  availableSports: string[];
  amenities: string[];
  operatingHours: {
    open: string;
    close: string;
  };
  timeSlots: {
    slotId: string;
    startISO: string;
    endISO: string;
    price: number;
    available: boolean;
  }[];
  qrToken: string;
  qrUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingDocument {
  _id?: ObjectId;
  turfId: ObjectId;
  playerId: ObjectId;
  ownerId: ObjectId;
  slotId: string;
  slot: {
    date: string;
    start: string;
    end: string;
  };
  startTime: Date;
  endTime: Date;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentId?: string;
  createdAt: Date;
  qrUsed: boolean;
  qrImageUrl?: string;
}

export interface UserDocument {
  _id?: ObjectId;
  supabase_id: string;
  name: string;
  email: string;
  role: 'player' | 'owner';
  phone?: string;
  profilePhotoUrl?: string;
  createdAt: Date;
  lastActive?: Date;
}

export default clientPromise;