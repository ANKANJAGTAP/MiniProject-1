'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

interface QRCodeDisplayProps {
  turfId: string;
  turfName: string;
  isAdmin?: boolean;
}

export function QRCodeDisplay({ turfId, turfName, isAdmin = false }: QRCodeDisplayProps) {
  const [qrImageUrl, setQrImageUrl] = useState<string>(`/api/turfs/${turfId}/qr`);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { session } = useAuth();

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(`/api/turfs/${turfId}/qr`);
      if (!response.ok) throw new Error('Failed to fetch QR code');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${turfName.replace(/\s+/g, '_')}_QR.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('QR code downloaded successfully');
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  };

  const handleRegenerateQR = async () => {
    if (!session?.access_token) {
      toast.error('Authentication required');
      return;
    }

    setIsRegenerating(true);
    try {
      const response = await fetch(`/api/turfs/${turfId}/generate-qr`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to regenerate QR');
      }

      // Force refresh the QR image by adding timestamp
      setQrImageUrl(`/api/turfs/${turfId}/qr?t=${Date.now()}`);
      toast.success('QR code regenerated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to regenerate QR');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <QrCode className="h-5 w-5 mr-2 text-green-500" />
          QR Code for Quick Booking
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="mb-4">
          <img
            src={qrImageUrl}
            alt={`QR Code for ${turfName}`}
            className="mx-auto border rounded-lg shadow-sm"
            width={200}
            height={200}
            onError={() => {
              toast.error('Failed to load QR code');
            }}
          />
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Scan this QR code to quickly book this turf from your mobile device
        </p>

        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadQR}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PNG
          </Button>
          
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateQR}
              disabled={isRegenerating}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </Button>
          )}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> This QR code will prefill the booking form but still requires 
            user login and confirmation before creating a booking.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}