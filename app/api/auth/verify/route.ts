import { NextRequest, NextResponse } from 'next/server';
import { verifySupabaseToken } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  const { user, error } = await verifySupabaseToken(request);
  
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  return NextResponse.json({ 
    valid: true, 
    user: {
      id: user.id,
      email: user.email,
      role: user.app_metadata?.role
    }
  });
}