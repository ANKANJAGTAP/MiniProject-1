import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, UserDocument } from '@/lib/mongodb-atlas';
import { createAuthMiddleware } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  // Check authentication
  const authResult = await createAuthMiddleware()(request);
  if (authResult) return authResult;

  try {
    const body = await request.json();
    const { supabase_id, name, email, role, phone } = body;
    
    if (!supabase_id || !name || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['player', 'owner'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ supabase_id });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const user: UserDocument = {
      supabase_id,
      name,
      email,
      role: role as 'player' | 'owner',
      phone,
      createdAt: new Date()
    };

    const result = await db.collection('users').insertOne(user);

    return NextResponse.json({ 
      success: true, 
      userId: result.insertedId,
      user: { ...user, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}