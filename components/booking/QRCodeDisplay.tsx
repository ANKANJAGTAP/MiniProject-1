'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, RefreshCw, ExternalLink } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

interface QRCodeDisplayProps {
  turfId: string;
  turfName: string;
  isAdmin?: boolean;
}

export function QRCodeDisplay({ turfId, turfName, isAdmin = false }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { session, user } = useAuth();

  // Check if user is admin
  const userIsAdmin = isAdmin || user?.app_metadata?.role === 'admin' || 
    (process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').includes(user?.email || '') ?? false);

  useEffect(() => {
    loadQRCode();
  }, [turfId]);

  const loadQRCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/turfs/${turfId}/qr`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load QR code');
      }
      
      const data = await response.json();
      setQrDataUrl(data.dataUrl);
      setQrUrl(data.qrUrl);
    } catch (error) {
      console.error('Error loading QR code:', error);
      toast.error('Failed to load QR code');
    } finally {
      setIsLoading(false);
    }
  };

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
      console.error('Error downloading QR code:', error);
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

      const result = await response.json();
      toast.success('QR code regenerated successfully');
      
      // Reload the QR code
      await loadQRCode();
    } catch (error) {
      console.error('Error regenerating QR code:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to regenerate QR');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleOpenQRUrl = () => {
    if (qrUrl) {
      window.open(qrUrl, '_blank');
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
          {isLoading ? (
            <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : qrDataUrl ? (
            <div className="relative inline-block">
              <img
                src={qrDataUrl}
                alt={`QR Code for ${turfName}`}
                className="mx-auto border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                width={256}
                height={256}
                onClick={handleOpenQRUrl}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={handleOpenQRUrl}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Failed to load QR code</p>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Scan this QR code to quickly book this turf from your mobile device
        </p>

        {qrUrl && (
          <div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-600 break-all">
            {qrUrl}
          </div>
        )}

        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadQR}
            disabled={isLoading || !qrDataUrl}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PNG
          </Button>
          
          {userIsAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateQR}
              disabled={isRegenerating || isLoading}
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