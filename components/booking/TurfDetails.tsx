'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Clock, Users } from 'lucide-react';

interface TurfDetailsProps {
  turf: {
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
}

export function TurfDetails({ turf }: TurfDetailsProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div>
            <div className="mb-4">
              <img
                src={turf.image}
                alt={turf.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {turf.gallery.slice(0, 3).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${turf.name} ${index + 1}`}
                  className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{turf.name}</h1>
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{turf.location}</span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                  <span className="font-medium">{turf.rating}</span>
                  <span className="text-gray-500 ml-1">({turf.reviews} reviews)</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">₹{turf.price}</div>
                  <div className="text-sm text-gray-500">per hour</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Available Sports</h3>
              <div className="flex flex-wrap gap-2">
                {turf.sports.map((sport, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {sport}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Amenities</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                {turf.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-green-500" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-green-500" />
                Operating Hours
              </h3>
              <p className="text-gray-600">
                Open daily from {turf.openTime} to {turf.closeTime}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">About</h3>
              <p className="text-gray-600 leading-relaxed">{turf.description}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}