import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-atlas';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const db = await getDatabase();
    const turf = await db.collection('turfs').findOne({ 
      _id: new ObjectId(params.id),
      qrToken: token
    });
    
    if (!turf) {
      return NextResponse.json({ error: 'Invalid QR token' }, { status: 401 });
    }

    return NextResponse.json({ 
      valid: true, 
      turf: {
        _id: turf._id,
        name: turf.name,
        location: turf.location,
        pricePerHour: turf.pricePerHour
      }
    });
  } catch (error) {
    console.error('Error verifying QR token:', error);
    return NextResponse.json({ error: 'Failed to verify QR token' }, { status: 500 });
  }
}