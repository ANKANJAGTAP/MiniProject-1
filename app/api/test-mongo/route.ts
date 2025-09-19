import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // List collections as a sanity check
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      success: true,
      message: 'MongoDB is connected!',
      collections: collections.map(c => c.name),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'MongoDB connection failed',
      error: error.message,
    }, { status: 500 });
  }
}
