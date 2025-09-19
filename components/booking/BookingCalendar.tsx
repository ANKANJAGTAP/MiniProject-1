'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useState } from 'react';

interface BookingCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  selectedSlots: string[];
  onSlotsChange: (slots: string[]) => void;
  turf: any;
}

export function BookingCalendar({ 
  selectedDate, 
  onDateChange, 
  selectedSlots, 
  onSlotsChange,
  turf
}: BookingCalendarProps) {
  // Generate time slots from 6 AM to 11 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 23; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push(timeSlot);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  
  // Mock availability - in real app this would come from API
  const getSlotStatus = (slot: string) => {
    const unavailableSlots = ['09:00 - 10:00', '15:00 - 16:00', '19:00 - 20:00'];
    if (unavailableSlots.includes(slot)) {
      return 'unavailable';
    }
    return selectedSlots.includes(slot) ? 'selected' : 'available';
  };

  const handleSlotClick = (slot: string) => {
    if (getSlotStatus(slot) === 'unavailable') return;
    
    if (selectedSlots.includes(slot)) {
      onSlotsChange(selectedSlots.filter(s => s !== slot));
    } else {
      onSlotsChange([...selectedSlots, slot]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-green-500" />
          Select Date & Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-4">Choose Date</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateChange(date)}
              disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
              className="rounded-md border"
            />
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Available Time Slots</h3>
            <p className="text-sm text-gray-600 mb-4">
              Selected date: {selectedDate.toLocaleDateString()}
            </p>
            
            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {timeSlots.map((slot, index) => {
                const status = getSlotStatus(slot);
                return (
                  <Button
                    key={index}
                    variant={status === 'selected' ? 'default' : 'outline'}
                    size="sm"
                    className={`text-left justify-start ${
                      status === 'unavailable' 
                        ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                        : status === 'selected'
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'hover:bg-green-50 hover:border-green-300'
                    }`}
                    onClick={() => handleSlotClick(slot)}
                    disabled={status === 'unavailable'}
                  >
                    <div>
                      <div className="font-medium">{slot}</div>
                      {status === 'unavailable' && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          Booked
                        </Badge>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Legend</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 border border-gray-300 rounded mr-2"></div>
                  <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span className="text-gray-600">Selected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
                  <span className="text-gray-600">Unavailable</span>
                </div>
              </div>
            </div>

            {selectedSlots.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  Selected Slots ({selectedSlots.length})
                </h4>
                <div className="text-sm text-green-800">
                  {selectedSlots.join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}