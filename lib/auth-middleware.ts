import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from './supabase';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role?: string;
    app_metadata?: any;
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

    // Fetch full user data including app_metadata
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user.id);
    
    if (userError) {
      console.warn('Could not fetch user metadata:', userError);
    }

    const enrichedUser = {
      ...user,
      app_metadata: userData?.user?.app_metadata || {},
      user_metadata: userData?.user?.user_metadata || user.user_metadata || {}
    };

    return { user: enrichedUser };
  } catch (error) {
    console.error('Token verification error:', error);
    return { user: null, error: 'Token verification failed' };
  }
}

export function isAdmin(user: any): boolean {
  // Check app_metadata role first
  if (user.app_metadata?.role === 'admin') {
    return true;
  }
  
  // Fallback to ADMIN_EMAILS
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
  return adminEmails.includes(user.email);
}

export function createAuthMiddleware(requireAdmin = false) {
  return async (request: NextRequest) => {
    const { user, error } = await verifySupabaseToken(request);
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (requireAdmin && !isAdmin(user)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Attach user to request for use in API handlers
    (request as AuthenticatedRequest).user = user;
    return null; // Continue to handler
  };
}