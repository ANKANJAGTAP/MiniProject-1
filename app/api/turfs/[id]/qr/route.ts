import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-atlas';
import { ObjectId } from 'mongodb';
import QRCode from 'qrcode';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const turf = await db.collection('turfs').findOne({ _id: new ObjectId(params.id) });
    
    if (!turf || !turf.qrToken) {
      return NextResponse.json({ error: 'Turf not found or QR not generated' }, { status: 404 });
    }

    const frontendHost = process.env.FRONTEND_HOST || 'http://localhost:3000';
    const qrUrl = `${frontendHost}/book/${params.id}?qrToken=${turf.qrToken}`;
    
    const acceptHeader = request.headers.get('accept') || '';
    
    if (acceptHeader.includes('application/json')) {
      // Return data URL for JSON requests
      const dataUrl = await QRCode.toDataURL(qrUrl, {
        type: 'image/png',
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return NextResponse.json({ 
        dataUrl,
        qrUrl,
        turfName: turf.name 
      });
    } else {
      // Return PNG image for direct requests
      const qrBuffer = await QRCode.toBuffer(qrUrl, {
        type: 'png',
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return new NextResponse(qrBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${turf.name.replace(/\s+/g, '_')}_QR.png"`,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch (error) {
    console.error('Error generating QR image:', error);
    return NextResponse.json({ error: 'Failed to generate QR image' }, { status: 500 });
  }
}