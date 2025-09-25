import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-atlas';
import { ObjectId } from 'mongodb';
import { createAuthMiddleware } from '@/lib/auth-middleware';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; slotId: string } }
) {
  // Check authentication
  const authResult = await createAuthMiddleware()(request);
  if (authResult) return authResult;

  try {
    const user = (request as any).user;
    const body = await request.json();
    const { startISO, endISO, price, available } = body;
    
    const db = await getDatabase();
    
    // Find owner profile
    const ownerProfile = await db.collection('users').findOne({ 
      supabase_id: user.id,
      role: 'owner'
    });

    if (!ownerProfile) {
      return NextResponse.json({ error: 'Owner profile not found' }, { status: 404 });
    }

    // Check if owner owns the turf
    const turf = await db.collection('turfs').findOne({
      _id: new ObjectId(params.id),
      ownerId: ownerProfile._id
    });

    if (!turf) {
      return NextResponse.json({ error: 'Turf not found or access denied' }, { status: 404 });
    }

    // Check for existing confirmed bookings if making slot unavailable
    if (available === false) {
      const existingBookings = await db.collection('bookings').countDocuments({
        turfId: new ObjectId(params.id),
        slotId: params.slotId,
        status: 'confirmed'
      });

      if (existingBookings > 0) {
        return NextResponse.json({ 
          error: 'Cannot disable slot with existing confirmed bookings',
          conflictingBookings: existingBookings
        }, { status: 409 });
      }
    }

    // Update the specific time slot
    const updateFields: any = {};
    if (startISO !== undefined) updateFields['timeSlots.$.startISO'] = startISO;
    if (endISO !== undefined) updateFields['timeSlots.$.endISO'] = endISO;
    if (price !== undefined) updateFields['timeSlots.$.price'] = price;
    if (available !== undefined) updateFields['timeSlots.$.available'] = available;
    updateFields['updatedAt'] = new Date();

    const result = await db.collection('turfs').updateOne(
      { 
        _id: new ObjectId(params.id),
        'timeSlots.slotId': params.slotId
      },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Time slot not found' }, { status: 404 });
    }

    const updatedTurf = await db.collection('turfs').findOne({ 
      _id: new ObjectId(params.id) 
    });

    const updatedSlot = updatedTurf?.timeSlots.find(slot => slot.slotId === params.slotId);

    return NextResponse.json({ 
      success: true, 
      slot: updatedSlot 
    });
  } catch (error) {
    console.error('Error updating time slot:', error);
    return NextResponse.json({ error: 'Failed to update time slot' }, { status: 500 });
  }
}