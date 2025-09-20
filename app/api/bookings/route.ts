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
    
    // Validate required fields
    if (!turfId || !slot || !amount) {
      return NextResponse.json({ error: 'Missing required fields: turfId, slot, amount' }, { status: 400 });
    }

    if (!slot.date || !slot.start || !slot.end) {
      return NextResponse.json({ error: 'Invalid slot format. Required: date, start, end' }, { status: 400 });
    }
    
    // Get user from middleware
    const user = (request as any).user;
    
    const db = await getDatabase();
    
    // Check if turf exists
    const turf = await db.collection('turfs').findOne({ _id: new ObjectId(turfId) });
    if (!turf) {
      return NextResponse.json({ error: 'Turf not found' }, { status: 404 });
    }

    // Check for slot conflicts (prevent double booking)
    const existingBooking = await db.collection('bookings').findOne({
      turfId: new ObjectId(turfId),
      'slot.date': slot.date,
      'slot.start': slot.start,
      'slot.end': slot.end,
      status: { $ne: 'cancelled' }
    });

    if (existingBooking) {
      return NextResponse.json({ 
        error: 'Slot already booked',
        conflictingBooking: existingBooking._id 
      }, { status: 409 });
    }

    // Create or update user profile
    const profileUpdate = await db.collection('profiles').updateOne(
      { supabaseUserId: user.id },
      {
        $setOnInsert: {
          supabaseUserId: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          email: user.email,
          createdAt: new Date()
        },
        $set: {
          lastActive: new Date()
        }
      },
      { upsert: true }
    );

    // Create booking
    const booking: BookingDocument = {
      turfId: new ObjectId(turfId),
      userId: user.id,
      slot: {
        date: slot.date,
        start: slot.start,
        end: slot.end
      },
      amount: Number(amount),
      status: 'confirmed',
      createdAt: new Date(),
      qrUsed: Boolean(qrUsed)
    };

    const result = await db.collection('bookings').insertOne(booking);

    // Return booking with populated turf info
    const createdBooking = {
      ...booking,
      _id: result.insertedId,
      turf: {
        name: turf.name,
        location: turf.location,
        pricePerHour: turf.pricePerHour
      }
    };

    return NextResponse.json({ 
      success: true, 
      bookingId: result.insertedId,
      booking: createdBooking,
      message: 'Booking created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ 
      error: 'Failed to create booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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
    const targetUserId = userId || user.id;
    if (targetUserId !== user.id && !user.app_metadata?.role === 'admin') {
      return NextResponse.json({ error: 'Unauthorized to view other user bookings' }, { status: 403 });
    }

    const db = await getDatabase();
    
    // Aggregate bookings with turf information
    const bookings = await db.collection('bookings').aggregate([
      { $match: { userId: targetUserId } },
      {
        $lookup: {
          from: 'turfs',
          localField: 'turfId',
          foreignField: '_id',
          as: 'turf'
        }
      },
      { $unwind: '$turf' },
      {
        $project: {
          _id: 1,
          turfId: 1,
          userId: 1,
          slot: 1,
          amount: 1,
          status: 1,
          paymentId: 1,
          createdAt: 1,
          qrUsed: 1,
          'turf.name': 1,
          'turf.location': 1,
          'turf.pricePerHour': 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    return NextResponse.json({ 
      bookings,
      count: bookings.length 
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch bookings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}