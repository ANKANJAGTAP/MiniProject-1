import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const result = await db.collection('testCollection').insertOne(data);

    return NextResponse.json({
      success: true,
      message: 'Sample data inserted',
      insertedId: result.insertedId,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Insert failed',
      error: error.message,
    }, { status: 500 });
  }
}
