// app/book/[id]/page.tsx
export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }, { id: "6" }];
}

import BookingPageClient from "@/components/booking/BookingPageClient";

export default function BookingPage({ params }: { params: { id: string } }) {
  // server-side mock turf data
  const turf = {
    id: parseInt(params.id),
    name: "Green Field Sports Complex",
    location: "Sangli Central",
    sports: ["Football", "Cricket"],
    rating: 4.8,
    reviews: 124,
    price: 800,
    image: "https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg",
    amenities: ["Floodlights", "Parking", "Washroom", "Equipment"],
    description: "Premium sports complex with professional-grade facilities.",
    openTime: "6:00 AM",
    closeTime: "11:00 PM",
    gallery: [
      "https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg",
      "https://images.pexels.com/photos/2207/field-sport-game-stadium.jpg",
      "https://images.pexels.com/photos/163308/cricket-ground-sport-game-163308.jpeg",
    ],
  };

  return <BookingPageClient turf={turf} />;
}
