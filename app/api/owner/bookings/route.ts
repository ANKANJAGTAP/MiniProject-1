import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-atlas';
import { ObjectId } from 'mongodb';
import { createAuthMiddleware } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  // Check authentication
  const authResult = await createAuthMiddleware()(request);
  if (authResult) return authResult;

  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const since = searchParams.get('since');
    
    const db = await getDatabase();
    
    // Find owner profile
    const ownerProfile = await db.collection('users').findOne({ 
      supabase_id: user.id,
      role: 'owner'
    });

    if (!ownerProfile) {
      return NextResponse.json({ error: 'Owner profile not found' }, { status: 404 });
    }

    // Build query
    const query: any = { ownerId: ownerProfile._id };
    
    if (status) {
      query.status = status;
    }
    
    if (since) {
      query.createdAt = { $gte: new Date(since) };
    }

    // Aggregate bookings with turf and player information
    const bookings = await db.collection('bookings').aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'turfs',
          localField: 'turfId',
          foreignField: '_id',
          as: 'turf'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'playerId',
          foreignField: '_id',
          as: 'player'
        }
      },
      { $unwind: '$turf' },
      { $unwind: '$player' },
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
          createdAt: 1,
          qrUsed: 1,
          qrImageUrl: 1,
          'turf.name': 1,
          'turf.address': 1,
          'player.name': 1,
          'player.email': 1,
          'player.phone': 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    return NextResponse.json({ 
      bookings,
      count: bookings.length 
    });
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}