'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Clock, Users, Wifi, Car, Coffee, Camera } from 'lucide-react';
import Link from 'next/link';

interface TurfGridProps {
  filters: {
    location: string;
    sport: string;
    priceRange: number[];
    rating: number;
    amenities: string[];
  };
  searchQuery: string;
  sortBy: string;
}

export function TurfGrid({ filters, searchQuery, sortBy }: TurfGridProps) {
  // Mock data - in real app, this would come from API
  const allTurfs = [
    {
      id: 1,
      name: 'Green Field Sports Complex',
      location: 'Sangli Central',
      sports: ['Football', 'Cricket'],
      rating: 4.8,
      reviews: 124,
      price: 800,
      image: 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      amenities: ['Floodlights', 'Parking', 'Washroom'],
      availability: 'Available Now',
      description: 'Premium sports complex with professional-grade facilities',
      openTime: '6:00 AM',
      closeTime: '11:00 PM'
    },
    {
      id: 2,
      name: 'Victory Sports Arena',
      location: 'Miraj Station Road',
      sports: ['Football', 'Basketball'],
      rating: 4.6,
      reviews: 89,
      price: 600,
      image: 'https://images.pexels.com/photos/2207/field-sport-game-stadium.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      amenities: ['AC', 'Cafeteria', 'Equipment'],
      availability: '2 slots left today',
      description: 'Modern indoor sports facility with air conditioning',
      openTime: '5:00 AM',
      closeTime: '12:00 AM'
    },
    {
      id: 3,
      name: 'Champions Cricket Ground',
      location: 'Sangli MIDC',
      sports: ['Cricket'],
      rating: 4.9,
      reviews: 156,
      price: 1000,
      image: 'https://images.pexels.com/photos/163308/cricket-ground-sport-game-163308.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      amenities: ['Scoreboard', 'Parking', 'Equipment'],
      availability: 'Book for tomorrow',
      description: 'Professional cricket ground with electronic scoreboard',
      openTime: '6:00 AM',
      closeTime: '10:00 PM'
    },
    {
      id: 4,
      name: 'Elite Football Academy',
      location: 'Miraj City',
      sports: ['Football'],
      rating: 4.7,
      reviews: 98,
      price: 750,
      image: 'https://images.pexels.com/photos/209841/pexels-photo-209841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      amenities: ['Floodlights', 'Equipment', 'Cafeteria'],
      availability: 'Available Now',
      description: 'Training ground used by local football academy',
      openTime: '5:30 AM',
      closeTime: '11:30 PM'
    },
    {
      id: 5,
      name: 'Multi-Sport Complex',
      location: 'Sangli Market',
      sports: ['Basketball', 'Badminton', 'Tennis'],
      rating: 4.5,
      reviews: 67,
      price: 500,
      image: 'https://images.pexels.com/photos/1693600/pexels-photo-1693600.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      amenities: ['AC', 'Washroom', 'Parking'],
      availability: 'Available Today',
      description: 'Indoor multi-sport facility for various games',
      openTime: '7:00 AM',
      closeTime: '10:00 PM'
    },
    {
      id: 6,
      name: 'Royal Sports Club',
      location: 'Sangli Central',
      sports: ['Cricket', 'Football', 'Tennis'],
      rating: 4.4,
      reviews: 143,
      price: 900,
      image: 'https://images.pexels.com/photos/257970/pexels-photo-257970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      amenities: ['Floodlights', 'Cafeteria', 'Equipment', 'Parking'],
      availability: '3 slots available',
      description: 'Premium club with multiple sports facilities',
      openTime: '6:00 AM',
      closeTime: '11:00 PM'
    }
  ];

  // Filter and sort turfs
  let filteredTurfs = allTurfs.filter(turf => {
    // Location filter
    if (filters.location && turf.location !== filters.location) return false;
    
    // Sport filter
    if (filters.sport && !turf.sports.includes(filters.sport)) return false;
    
    // Price filter
    if (turf.price < filters.priceRange[0] || turf.price > filters.priceRange[1]) return false;
    
    // Rating filter
    if (filters.rating > 0 && turf.rating < filters.rating) return false;
    
    // Amenities filter
    if (filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every(amenity => 
        turf.amenities.includes(amenity)
      );
      if (!hasAllAmenities) return false;
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = turf.name.toLowerCase().includes(query);
      const matchesLocation = turf.location.toLowerCase().includes(query);
      const matchesSports = turf.sports.some(sport => 
        sport.toLowerCase().includes(query)
      );
      if (!matchesName && !matchesLocation && !matchesSports) return false;
    }
    
    return true;
  });

  // Sort turfs
  switch (sortBy) {
    case 'rating':
      filteredTurfs.sort((a, b) => b.rating - a.rating);
      break;
    case 'price-low':
      filteredTurfs.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredTurfs.sort((a, b) => b.price - a.price);
      break;
    default:
      // Keep original order for popularity
      break;
  }

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: any } = {
      'AC': Users,
      'Wifi': Wifi,
      'Parking': Car,
      'Cafeteria': Coffee,
      'Equipment': Camera,
      'Floodlights': Camera,
      'Washroom': Users,
      'Scoreboard': Camera
    };
    return iconMap[amenity] || Users;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredTurfs.length} Turfs Found
          </h2>
          <p className="text-gray-600 mt-1">
            {searchQuery ? `Showing results for "${searchQuery}"` : 'All available turfs in Sangli and Miraj'}
          </p>
        </div>
      </div>

      {filteredTurfs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MapPin className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No turfs found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or search criteria to find available turfs.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTurfs.map((turf) => (
            <Card key={turf.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <div className="relative">
                <img 
                  src={turf.image} 
                  alt={turf.name}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-500 text-white">
                    {turf.availability}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                    <span className="text-2xl font-bold text-green-600">₹{turf.price}</span>
                    <span className="text-sm text-gray-600">/hour</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {turf.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{turf.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{turf.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">({turf.reviews})</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{turf.description}</p>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Open {turf.openTime} - {turf.closeTime}</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {turf.sports.map((sport, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          {sport}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {turf.amenities.map((amenity, index) => {
                        const IconComponent = getAmenityIcon(amenity);
                        return (
                          <div key={index} className="flex items-center text-xs text-gray-500">
                            <IconComponent className="h-3 w-3 mr-1" />
                            <span>{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href={`/turf/${turf.id}`} className="flex-1">
                    <Button variant="outline" className="w-full border-green-300 text-green-600 hover:bg-green-50">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/book/${turf.id}`} className="flex-1">
                    <Button className="w-full bg-green-500 hover:bg-green-600">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}