import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, UserDocument } from '@/lib/mongodb-atlas';
import { ObjectId } from 'mongodb';
import { createAuthMiddleware } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  // Check authentication
  const authResult = await createAuthMiddleware()(request);
  if (authResult) return authResult;

  try {
    const user = (request as any).user;
    const db = await getDatabase();
    
    // Find user profile
    const profile = await db.collection('users').findOne({ 
      supabase_id: user.id 
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.role !== 'owner') {
      return NextResponse.json({ error: 'Access denied - owner role required' }, { status: 403 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching owner profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  // Check authentication
  const authResult = await createAuthMiddleware()(request);
  if (authResult) return authResult;

  try {
    const user = (request as any).user;
    const body = await request.json();
    const { name, phone, profilePhotoUrl } = body;
    
    const db = await getDatabase();
    
    // Update profile
    const result = await db.collection('users').updateOne(
      { supabase_id: user.id, role: 'owner' },
      { 
        $set: { 
          name,
          phone,
          profilePhotoUrl,
          lastActive: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Owner profile not found' }, { status: 404 });
    }

    const updatedProfile = await db.collection('users').findOne({ 
      supabase_id: user.id 
    });

    return NextResponse.json({ 
      success: true, 
      profile: updatedProfile 
    });
  } catch (error) {
    console.error('Error updating owner profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}