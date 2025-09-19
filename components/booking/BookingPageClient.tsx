"use client";

import { useState } from "react";
import { BookingHeader } from "@/components/booking/BookingHeader";
import { TurfDetails } from "@/components/booking/TurfDetails";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { Footer } from "@/components/landing/Footer";

export default function BookingPageClient({ turf }: { turf: any }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-gray-50">
      <BookingHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          </div>
          <div className="lg:col-span-1">
            <BookingSummary
              turf={turf}
              selectedDate={selectedDate}
              selectedSlots={selectedSlots}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
