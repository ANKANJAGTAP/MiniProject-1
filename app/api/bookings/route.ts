import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, BookingDocument, ProfileDocument } from '@/lib/mongodb-atlas';
import { ObjectId } from 'mongodb';
import { createAuthMiddleware } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  // Check authentication
  const authResult = await createAuthMiddleware()(request);
  if (authResult) return authResult;

  try {
    const body = await request.json();
    const { turfId, slot, amount, qrUsed = false } = body;
    
    // Get user from middleware
    const user = (request as any).user;
    
    const db = await getDatabase();
    
    // Check if turf exists
    const turf = await db.collection('turfs').findOne({ _id: new ObjectId(turfId) });
    if (!turf) {
      return NextResponse.json({ error: 'Turf not found' }, { status: 404 });
    }

    // Check for slot conflicts
    const existingBooking = await db.collection('bookings').findOne({
      turfId: new ObjectId(turfId),
      'slot.date': slot.date,
      'slot.start': slot.start,
      'slot.end': slot.end,
      status: { $ne: 'cancelled' }
    });

    if (existingBooking) {
      return NextResponse.json({ error: 'Slot already booked' }, { status: 409 });
    }

    // Create or update user profile
    await db.collection('profiles').updateOne(
      { supabaseUserId: user.id },
      {
        $setOnInsert: {
          supabaseUserId: user.id,
          name: user.user_metadata?.name || user.email,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    // Create booking
    const booking: BookingDocument = {
      turfId: new ObjectId(turfId),
      userId: user.id,
      slot,
      amount,
      status: 'confirmed',
      createdAt: new Date(),
      qrUsed
    };

    const result = await db.collection('bookings').insertOne(booking);

    return NextResponse.json({ 
      success: true, 
      bookingId: result.insertedId,
      booking: { ...booking, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Check authentication
  const authResult = await createAuthMiddleware()(request);
  if (authResult) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const user = (request as any).user;
    
    // Users can only see their own bookings unless admin
    if (userId && userId !== user.id && !user.app_metadata?.role === 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const db = await getDatabase();
    const bookings = await db.collection('bookings')
      .find({ userId: userId || user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}