import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-atlas';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { turfId, slotId } = body;
    
    if (!turfId || !slotId) {
      return NextResponse.json({ error: 'Missing turfId or slotId' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Check if slot is still available
    const turf = await db.collection('turfs').findOne({
      _id: new ObjectId(turfId),
      'timeSlots.slotId': slotId,
      'timeSlots.available': true
    });

    if (!turf) {
      return NextResponse.json({ 
        available: false,
        error: 'Slot no longer available'
      }, { status: 409 });
    }

    const slot = turf.timeSlots.find(s => s.slotId === slotId);

    return NextResponse.json({ 
      available: true,
      slot: slot
    });
  } catch (error) {
    console.error('Error checking slot availability:', error);
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 });
  }
}