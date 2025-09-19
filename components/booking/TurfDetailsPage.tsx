import React from "react";
import { BookingCalendar } from "../booking/BookingCalendar";
import { BookingSummary } from "../booking/BookingSummary";
import { TurfDetails } from "../booking/TurfDetails";

// Props: turf object, onBook callback

interface TurfDetailsPageProps {
  turf: {
    id: number;
    name: string;
    location: string;
    sports: string[];
    rating: number;
    reviews: number;
    price: number;
    image: string;
    amenities: string[];
    description: string;
    openTime: string;
    closeTime: string;
    gallery: string[];
  };
  onBook?: (bookingData: any) => void;
}

const TurfDetailsPage: React.FC<TurfDetailsPageProps> = ({ turf, onBook }) => {
  // Booking state

  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = React.useState<string[]>([]);
  const [bookingSummary, setBookingSummary] = React.useState<any>(null);

  const handleBook = () => {
    if (onBook && selectedDate && selectedSlots.length > 0) {
      const bookingData = {
        turfId: turf.id,
        date: selectedDate,
        slots: selectedSlots,
      };
      onBook(bookingData);
      setBookingSummary(bookingData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <TurfDetails turf={turf} />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <BookingCalendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedSlots={selectedSlots}
            onSlotsChange={setSelectedSlots}
            turf={turf}
          />
        </div>
        <div>
          <BookingSummary
            turf={turf}
            selectedDate={selectedDate}
            selectedSlots={selectedSlots}
          />
          <button
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={handleBook}
            disabled={selectedSlots.length === 0}
          >
            Book Turf
          </button>
        </div>
      </div>
      {bookingSummary && (
        <div className="mt-6 p-4 bg-green-100 rounded">
          <h3 className="font-bold text-green-700">Booking Confirmed!</h3>
          <p>Date: {bookingSummary.date.toLocaleDateString()}</p>
          <p>Slots: {bookingSummary.slots.join(', ')}</p>
        </div>
      )}
    </div>
  );
};

export default TurfDetailsPage;
