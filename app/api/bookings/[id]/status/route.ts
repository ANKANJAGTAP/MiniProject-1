import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-atlas';
import { ObjectId } from 'mongodb';
import { createAuthMiddleware } from '@/lib/auth-middleware';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const authResult = await createAuthMiddleware()(request);
  if (authResult) return authResult;

  try {
    const user = (request as any).user;
    const body = await request.json();
    const { status } = body;
    
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Find owner profile
    const ownerProfile = await db.collection('users').findOne({ 
      supabase_id: user.id,
      role: 'owner'
    });

    if (!ownerProfile) {
      return NextResponse.json({ error: 'Owner profile not found' }, { status: 404 });
    }

    // Update booking status (only if owner owns the turf)
    const result = await db.collection('bookings').updateOne(
      { 
        _id: new ObjectId(params.id),
        ownerId: ownerProfile._id
      },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Booking not found or access denied' }, { status: 404 });
    }

    // If cancelling, make slot available again
    if (status === 'cancelled') {
      const booking = await db.collection('bookings').findOne({ 
        _id: new ObjectId(params.id) 
      });
      
      if (booking) {
        await db.collection('turfs').updateOne(
          { 
            _id: booking.turfId,
            'timeSlots.slotId': booking.slotId
          },
          { 
            $set: { 
              'timeSlots.$.available': true 
            }
          }
        );
      }
    }

    const updatedBooking = await db.collection('bookings').findOne({ 
      _id: new ObjectId(params.id) 
    });

    return NextResponse.json({ 
      success: true, 
      booking: updatedBooking 
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
  }
}