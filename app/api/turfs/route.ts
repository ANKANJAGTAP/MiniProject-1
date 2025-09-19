import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-atlas';

export async function GET() {
  try {
    const db = await getDatabase();
    const turfs = await db.collection('turfs').find({}).toArray();
    
    return NextResponse.json({ turfs });
  } catch (error) {
    console.error('Error fetching turfs:', error);
    return NextResponse.json({ error: 'Failed to fetch turfs' }, { status: 500 });
  }
}