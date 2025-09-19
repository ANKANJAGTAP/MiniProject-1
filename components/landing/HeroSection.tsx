'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, MapPin, Clock, Star } from 'lucide-react';
import { useState } from 'react';

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 opacity-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Book Your
              <span className="text-green-500 block">Dream Turf</span>
              <span className="text-2xl lg:text-3xl text-gray-600 font-normal">in Seconds</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              The first centralized platform for booking sports turfs in Sangli and Miraj. 
              Real-time availability, instant confirmation, and secure payments.
            </p>

            <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by location, sport, or turf name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 text-lg bg-gray-50"
                  />
                </div>
                <Button size="lg" className="bg-green-500 hover:bg-green-600 px-8">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/browse" className="flex-1">
                <Button size="lg" className="w-full bg-green-500 hover:bg-green-600 text-lg py-6">
                  Browse All Turfs
                </Button>
              </Link>
              <Link href="/owner/register" className="flex-1">
                <Button size="lg" variant="outline" className="w-full text-lg py-6 border-green-300 hover:bg-green-50">
                  List Your Turf
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-green-500" />
                <span>25+ Turfs Listed</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-green-500" />
                <span>Instant Booking</span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-green-500" />
                <span>4.8/5 Rating</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <div className="text-3xl font-bold text-green-500 mb-2">500+</div>
                <div className="text-gray-600">Happy Players</div>
              </Card>
              <Card className="p-6 bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <div className="text-3xl font-bold text-blue-500 mb-2">25+</div>
                <div className="text-gray-600">Registered Turfs</div>
              </Card>
              <Card className="p-6 bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <div className="text-3xl font-bold text-purple-500 mb-2">1000+</div>
                <div className="text-gray-600">Bookings Made</div>
              </Card>
              <Card className="p-6 bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <div className="text-3xl font-bold text-orange-500 mb-2">4.8/5</div>
                <div className="text-gray-600">Average Rating</div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}