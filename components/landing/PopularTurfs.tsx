import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Clock, Users } from 'lucide-react';
import Link from 'next/link';

export function PopularTurfs() {
  const turfs = [
    {
      id: 1,
      name: 'Green Field Sports Complex',
      location: 'Sangli Central',
      sports: ['Football', 'Cricket'],
      rating: 4.8,
      reviews: 124,
      price: '₹800/hour',
      image: 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      features: ['Floodlights', 'Parking', 'Washroom'],
      availability: 'Available Now'
    },
    {
      id: 2,
      name: 'Victory Sports Arena',
      location: 'Miraj Station Road',
      sports: ['Football', 'Basketball'],
      rating: 4.6,
      reviews: 89,
      price: '₹600/hour',
      image: 'https://images.pexels.com/photos/2207/field-sport-game-stadium.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      features: ['Air Conditioned', 'Cafeteria', 'Equipment'],
      availability: '2 slots left today'
    },
    {
      id: 3,
      name: 'Champions Cricket Ground',
      location: 'Sangli MIDC',
      sports: ['Cricket'],
      rating: 4.9,
      reviews: 156,
      price: '₹1000/hour',
      image: 'https://images.pexels.com/photos/163308/cricket-ground-sport-game-163308.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      features: ['Professional Pitch', 'Scoreboard', 'Commentary Box'],
      availability: 'Book for tomorrow'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Popular Turfs in Your Area
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the most loved sports facilities in Sangli and Miraj, 
            rated by our community of players.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {turfs.map((turf) => (
            <Card 
              key={turf.id} 
              className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-0"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={turf.image} 
                  alt={turf.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-500 text-white px-3 py-1">
                    {turf.availability}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-2xl font-bold">{turf.price}</div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="mb-4">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {turf.name}
                  </h4>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{turf.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{turf.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">
                        ({turf.reviews} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {turf.sports.map((sport, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {sport}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      {turf.features.join(' • ')}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/turf/${turf.id}`} className="flex-1">
                    <Button className="w-full bg-green-500 hover:bg-green-600">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/book/${turf.id}`}>
                    <Button variant="outline" className="border-green-300 text-green-600 hover:bg-green-50">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/browse">
            <Button size="lg" variant="outline" className="border-green-300 text-green-600 hover:bg-green-50 px-8">
              View All Turfs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}