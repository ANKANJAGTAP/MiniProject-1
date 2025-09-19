'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CreditCard, Tag } from 'lucide-react';
import { useState } from 'react';

interface BookingSummaryProps {
  turf: {
    name: string;
    price: number;
    location: string;
  };
  selectedDate: Date;
  selectedSlots: string[];
}

export function BookingSummary({ turf, selectedDate, selectedSlots }: BookingSummaryProps) {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const basePrice = turf.price * selectedSlots.length;
  const discount = promoApplied ? basePrice * 0.1 : 0; // 10% discount
  const platformFee = selectedSlots.length > 0 ? 50 : 0;
  const taxes = (basePrice - discount + platformFee) * 0.18; // 18% GST
  const totalAmount = basePrice - discount + platformFee + taxes;

  const handlePromoCode = () => {
    if (promoCode.toLowerCase() === 'first10' && !promoApplied) {
      setPromoApplied(true);
    }
  };

  const handleBooking = () => {
    if (selectedSlots.length === 0) {
      alert('Please select at least one time slot');
      return;
    }
    
    // In real app, this would integrate with payment gateway
    alert(`Booking confirmed for ${selectedSlots.length} slots at ${turf.name}`);
  };

  return (
    <div className="sticky top-24">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-green-500" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{turf.name}</h3>
            <p className="text-gray-600 text-sm">{turf.location}</p>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span>{selectedDate.toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            
            {selectedSlots.length > 0 && (
              <div>
                <div className="flex items-center text-sm mb-2">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Selected Slots ({selectedSlots.length})</span>
                </div>
                <div className="space-y-1">
                  {selectedSlots.map((slot, index) => (
                    <Badge key={index} variant="secondary" className="mr-1 mb-1">
                      {slot}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedSlots.length > 0 && (
            <>
              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Slot Fee ({selectedSlots.length} × ₹{turf.price})</span>
                  <span>₹{basePrice}</span>
                </div>
                
                {promoApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount (FIRST10)</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span>Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Taxes & Fees (18%)</span>
                  <span>₹{taxes.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span className="text-green-600">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="promo" className="flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Promo Code
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="promo"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handlePromoCode}
                    disabled={promoApplied || !promoCode}
                  >
                    {promoApplied ? 'Applied' : 'Apply'}
                  </Button>
                </div>
                {promoApplied && (
                  <p className="text-sm text-green-600">✓ 10% discount applied!</p>
                )}
              </div>

              <Button 
                className="w-full bg-green-500 hover:bg-green-600" 
                size="lg"
                onClick={handleBooking}
              >
                Proceed to Payment - ₹{totalAmount.toFixed(2)}
              </Button>
            </>
          )}

          {selectedSlots.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select date and time slots to see booking summary</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}