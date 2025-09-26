import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-atlas';
import { ObjectId } from 'mongodb';
import { createAuthMiddleware } from '@/lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const authResult = await createAuthMiddleware()(request);
  if (authResult) return authResult;

  try {
    const user = (request as any).user;
    const db = await getDatabase();
    
    // Find owner profile
    const ownerProfile = await db.collection('users').findOne({ 
      supabase_id: user.id,
      role: 'owner'
    });

    if (!ownerProfile) {
      return NextResponse.json({ error: 'Owner profile not found' }, { status: 404 });
    }

    // Get turf (only if owned by this user)
    const turf = await db.collection('turfs').findOne({
      _id: new ObjectId(params.id),
      ownerId: ownerProfile._id
    });

    if (!turf) {
      return NextResponse.json({ error: 'Turf not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ turf });
  } catch (error) {
    console.error('Error fetching turf:', error);
    return NextResponse.json({ error: 'Failed to fetch turf' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const authResult = await createAuthMiddleware()(request);
  if (authResult) return authResult;

  try {
    const user = (request as any).user;
    const body = await request.json();
    const { 
      name, 
      address, 
      pricePerHour, 
      images, 
      availableSports, 
      amenities, 
      operatingHours,
      description 
    } = body;
    
    const db = await getDatabase();
    
    // Find owner profile
    const ownerProfile = await db.collection('users').findOne({ 
      supabase_id: user.id,
      role: 'owner'
    });

    if (!ownerProfile) {
      return NextResponse.json({ error: 'Owner profile not found' }, { status: 404 });
    }

    // Update turf (only if owned by this user)
    const result = await db.collection('turfs').updateOne(
      { 
        _id: new ObjectId(params.id),
        ownerId: ownerProfile._id
      },
      { 
        $set: { 
          name,
          address,
          pricePerHour: Number(pricePerHour),
          images: images || [],
          availableSports: availableSports || [],
          amenities: amenities || [],
          operatingHours,
          description: description || '',
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Turf not found or access denied' }, { status: 404 });
    }

    const updatedTurf = await db.collection('turfs').findOne({ 
      _id: new ObjectId(params.id) 
    });

    return NextResponse.json({ 
      success: true, 
      turf: updatedTurf 
    });
  } catch (error) {
    console.error('Error updating turf:', error);
    return NextResponse.json({ error: 'Failed to update turf' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const authResult = await createAuthMiddleware()(request);
  if (authResult) return authResult;

  try {
    const user = (request as any).user;
    const db = await getDatabase();
    
    // Find owner profile
    const ownerProfile = await db.collection('users').findOne({ 
      supabase_id: user.id,
      role: 'owner'
    });

    if (!ownerProfile) {
      return NextResponse.json({ error: 'Owner profile not found' }, { status: 404 });
    }

    // Check for existing bookings
    const existingBookings = await db.collection('bookings').countDocuments({
      turfId: new ObjectId(params.id),
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBookings > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete turf with active bookings',
        activeBookings: existingBookings
      }, { status: 409 });
    }

    // Delete turf (only if owned by this user)
    const result = await db.collection('turfs').deleteOne({
      _id: new ObjectId(params.id),
      ownerId: ownerProfile._id
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Turf not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Turf deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting turf:', error);
    return NextResponse.json({ error: 'Failed to delete turf' }, { status: 500 });
  }
}