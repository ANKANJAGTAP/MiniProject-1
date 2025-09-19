'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowLeft, User } from 'lucide-react';

export function BookingHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <Link href="/browse" className="flex items-center text-gray-600 hover:text-green-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Browse
            </Link>
            
            <div className="h-6 border-l border-gray-300"></div>
            
            <Link href="/" className="flex items-center">
              <div className="bg-green-500 rounded-lg p-2 mr-3">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-600">TurfBook</h1>
                <p className="text-xs text-gray-500">Book Your Slot</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}