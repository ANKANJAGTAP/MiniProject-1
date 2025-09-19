"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BookingHeader } from "@/components/booking/BookingHeader";
import { TurfDetails } from "@/components/booking/TurfDetails";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { QRCodeDisplay } from "@/components/booking/QRCodeDisplay";
import { Footer } from "@/components/landing/Footer";
import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function BookingPageClient({ turf }: { turf: any }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [qrTokenValid, setQrTokenValid] = useState<boolean | null>(null);
  const [isQrBooking, setIsQrBooking] = useState(false);
  
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const qrToken = searchParams.get('qrToken');

  useEffect(() => {
    if (qrToken) {
      verifyQrToken();
    }
  }, [qrToken]);

  const verifyQrToken = async () => {
    if (!qrToken) return;
    
    try {
      const response = await fetch(`/api/turfs/${turf.id}/verify-qr?token=${qrToken}`);
      const data = await response.json();
      
      if (response.ok && data.valid) {
        setQrTokenValid(true);
        setIsQrBooking(true);
        toast.success('QR code verified! Booking form is prefilled.');
      } else {
        setQrTokenValid(false);
        toast.error('Invalid or expired QR code');
      }
    } catch (error) {
      setQrTokenValid(false);
      toast.error('Failed to verify QR code');
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <BookingHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {qrToken && (
          <div className="mb-6">
            {qrTokenValid === true && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  QR code verified successfully! You can now proceed with booking.
                </AlertDescription>
              </Alert>
            )}
            {qrTokenValid === false && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Invalid or expired QR code. You can still book normally.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TurfDetails turf={turf} />
            <BookingCalendar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              selectedSlots={selectedSlots}
              onSlotsChange={setSelectedSlots}
              turf={turf}
            />
            <QRCodeDisplay 
              turfId={turf.id.toString()} 
              turfName={turf.name}
              isAdmin={user?.app_metadata?.role === 'admin'}
            />
          </div>
          <div className="lg:col-span-1">
            <BookingSummary
              turf={turf}
              selectedDate={selectedDate}
              selectedSlots={selectedSlots}
              qrUsed={isQrBooking && qrTokenValid === true}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
