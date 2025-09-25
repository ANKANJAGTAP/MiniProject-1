import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, BookingDocument, UserDocument } from '@/lib/mongodb-atlas';
import { ObjectId } from 'mongodb';
import { createAuthMiddleware } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  // Check authentication
  const authResult = await createAuthMiddleware()(request);
  if (authResult) return authResult;

  try {
    const body = await request.json();
    const { turfId, slotId, slot, amount, qrUsed = false } = body;
    
    // Validate required fields
    if (!turfId || !slotId || !slot || !amount) {
      return NextResponse.json({ error: 'Missing required fields: turfId, slotId, slot, amount' }, { status: 400 });
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

    // ATOMIC RESERVATION: Reserve the slot first
    const reservationResult = await db.collection('turfs').updateOne(
      { 
        _id: new ObjectId(turfId), 
        'timeSlots.slotId': slotId, 
        'timeSlots.available': true 
      },
      { 
        $set: { 
          'timeSlots.$.available': false,
          'updatedAt': new Date()
        }
      }
    );

    if (reservationResult.matchedCount !== 1 || reservationResult.modifiedCount !== 1) {
      return NextResponse.json({ 
        error: 'Slot already reserved or not available',
        code: 'SLOT_UNAVAILABLE'
      }, { status: 409 });
    }

    try {
      // Create or update user profile
      const userUpdate = await db.collection('users').updateOne(
        { supabase_id: user.id },
        {
          $setOnInsert: {
            supabase_id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email,
            role: 'player',
            createdAt: new Date()
          },
          $set: {
            lastActive: new Date()
          }
        },
        { upsert: true }
      );

      // Get player and owner profiles
      const playerProfile = await db.collection('users').findOne({ supabase_id: user.id });
      const ownerProfile = await db.collection('users').findOne({ _id: turf.ownerId });

      if (!playerProfile || !ownerProfile) {
        throw new Error('Profile not found');
      }

      // Create booking with atomic reservation
      const startTime = new Date(`${slot.date}T${slot.start}:00`);
      const endTime = new Date(`${slot.date}T${slot.end}:00`);
      
      const booking: BookingDocument = {
        turfId: new ObjectId(turfId),
        playerId: playerProfile._id!,
        ownerId: ownerProfile._id!,
        slotId,
        slot: {
          date: slot.date,
          start: slot.start,
          end: slot.end
        },
        startTime,
        endTime,
        amount: Number(amount),
        status: 'pending',
        createdAt: new Date(),
        qrUsed: Boolean(qrUsed),
        qrImageUrl: process.env.QR_DUMMY_URL || '/images/qr_dummy.png'
      };

      const result = await db.collection('bookings').insertOne(booking);

      // Return booking with populated info
      const createdBooking = {
        ...booking,
        _id: result.insertedId,
        turf: {
          name: turf.name,
          address: turf.address,
          pricePerHour: turf.pricePerHour
        },
        player: {
          name: playerProfile.name,
          email: playerProfile.email
        }
      };

      return NextResponse.json({ 
        success: true, 
        bookingId: result.insertedId,
        booking: createdBooking,
        message: 'Booking created successfully'
      }, { status: 201 });
      
    } catch (error) {
      // Rollback: Make slot available again if booking creation fails
      await db.collection('turfs').updateOne(
        { 
          _id: new ObjectId(turfId), 
          'timeSlots.slotId': slotId 
        },
        { 
          $set: { 
            'timeSlots.$.available': true 
          }
        }
      );
      throw error;
    }
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
    
    const db = await getDatabase();
    
    // Get user profile
    const userProfile = await db.collection('users').findOne({ supabase_id: user.id });
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    // Users can only see their own bookings unless admin
    const targetUserId = userId || user.id;
    if (targetUserId !== user.id && !user.app_metadata?.role === 'admin') {
      return NextResponse.json({ error: 'Unauthorized to view other user bookings' }, { status: 403 });
    }

    // Aggregate bookings with turf information
    const bookings = await db.collection('bookings').aggregate([
      { $match: { playerId: userProfile._id } },
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
          playerId: 1,
          slotId: 1,
          slot: 1,
          startTime: 1,
          endTime: 1,
          amount: 1,
          status: 1,
          paymentId: 1,
          createdAt: 1,
          qrUsed: 1,
          qrImageUrl: 1,
          'turf.name': 1,
          'turf.address': 1,
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