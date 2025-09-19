import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-atlas';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { createAuthMiddleware } from '@/lib/auth-middleware';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin authentication
  const authResult = await createAuthMiddleware(true)(request);
  if (authResult) return authResult;

  try {
    const db = await getDatabase();
    const turfId = new ObjectId(params.id);
    
    // Generate new QR token
    const qrToken = uuidv4();
    
    // Update turf with new token
    const result = await db.collection('turfs').updateOne(
      { _id: turfId },
      { 
        $set: { 
          qrToken,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Turf not found' }, { status: 404 });
    }

    const frontendHost = process.env.FRONTEND_HOST || 'http://localhost:3000';
    const qrUrl = `${frontendHost}/book/${params.id}?qrToken=${qrToken}`;

    return NextResponse.json({ 
      success: true, 
      qrToken,
      qrUrl,
      qrEndpoint: `/api/turfs/${params.id}/qr`
    });
  } catch (error) {
    console.error('Error generating QR:', error);
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 });
  }
}