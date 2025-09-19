import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-atlas';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const turf = await db.collection('turfs').findOne({ _id: new ObjectId(params.id) });
    
    if (!turf) {
      return NextResponse.json({ error: 'Turf not found' }, { status: 404 });
    }

    return NextResponse.json({ turf });
  } catch (error) {
    console.error('Error fetching turf:', error);
    return NextResponse.json({ error: 'Failed to fetch turf' }, { status: 500 });
  }
}