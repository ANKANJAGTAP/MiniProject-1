import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from './supabase';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export async function verifySupabaseToken(request: NextRequest): Promise<{ user: any; error?: string }> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.substring(7);
  
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { user: null, error: 'Invalid token' };
    }

    return { user };
  } catch (error) {
    return { user: null, error: 'Token verification failed' };
  }
}

export function isAdmin(userEmail: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
  return adminEmails.includes(userEmail);
}

export function createAuthMiddleware(requireAdmin = false) {
  return async (request: NextRequest) => {
    const { user, error } = await verifySupabaseToken(request);
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (requireAdmin && !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Attach user to request (for use in API handlers)
    (request as AuthenticatedRequest).user = user;
    return null; // Continue to handler
  };
}