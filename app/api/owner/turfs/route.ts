import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, TurfDocument } from '@/lib/mongodb-atlas';
import { ObjectId } from 'mongodb';
import { createAuthMiddleware } from '@/lib/auth-middleware';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
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

    // Get owner's turfs
    const turfs = await db.collection('turfs').find({
      ownerId: ownerProfile._id
    }).toArray();

    return NextResponse.json({ 
      turfs,
      count: turfs.length 
    });
  } catch (error) {
    console.error('Error fetching owner turfs:', error);
    return NextResponse.json({ error: 'Failed to fetch turfs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    
    // Validate required fields
    if (!name || !address || !pricePerHour || !operatingHours) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, address, pricePerHour, operatingHours' 
      }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Find or create owner profile
    let ownerProfile = await db.collection('users').findOne({ 
      supabase_id: user.id 
    });

    if (!ownerProfile) {
      const ownerResult = await db.collection('users').insertOne({
        supabase_id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Owner',
        email: user.email,
        role: 'owner',
        createdAt: new Date()
      });
      ownerProfile = await db.collection('users').findOne({ _id: ownerResult.insertedId });
    } else if (ownerProfile.role !== 'owner') {
      // Update user role to owner
      await db.collection('users').updateOne(
        { _id: ownerProfile._id },
        { $set: { role: 'owner' } }
      );
    }

    // Generate default time slots
    const timeSlots = [];
    const startHour = parseInt(operatingHours.open.split(':')[0]);
    const endHour = parseInt(operatingHours.close.split(':')[0]);
    
    for (let hour = startHour; hour < endHour; hour++) {
      timeSlots.push({
        slotId: uuidv4(),
        startISO: `${hour.toString().padStart(2, '0')}:00`,
        endISO: `${(hour + 1).toString().padStart(2, '0')}:00`,
        price: pricePerHour,
        available: true
      });
    }

    // Create turf document
    const turf: TurfDocument = {
      ownerId: ownerProfile._id!,
      name,
      address,
      pricePerHour: Number(pricePerHour),
      images: images || [],
      availableSports: availableSports || [],
      amenities: amenities || [],
      operatingHours,
      timeSlots,
      qrToken: uuidv4(),
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('turfs').insertOne(turf);

    return NextResponse.json({ 
      success: true, 
      turfId: result.insertedId,
      turf: { ...turf, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating turf:', error);
    return NextResponse.json({ 
      error: 'Failed to create turf',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}