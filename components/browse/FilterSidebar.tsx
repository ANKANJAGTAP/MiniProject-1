'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star } from 'lucide-react';

interface FilterSidebarProps {
  filters: {
    location: string;
    sport: string;
    priceRange: number[];
    rating: number;
    amenities: string[];
  };
  onFiltersChange: (filters: any) => void;
}

export function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const locations = ['Sangli Central', 'Miraj Station Road', 'Sangli MIDC', 'Miraj City', 'Sangli Market'];
  const sports = ['Football', 'Cricket', 'Basketball', 'Badminton', 'Tennis'];
  const amenities = ['Floodlights', 'Parking', 'Washroom', 'Cafeteria', 'Equipment', 'AC', 'Scoreboard'];

  const handleLocationChange = (location: string, checked: boolean) => {
    onFiltersChange({
      ...filters,
      location: checked ? location : ''
    });
  };

  const handleSportChange = (sport: string, checked: boolean) => {
    onFiltersChange({
      ...filters,
      sport: checked ? sport : ''
    });
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const updatedAmenities = checked
      ? [...filters.amenities, amenity]
      : filters.amenities.filter(a => a !== amenity);
    
    onFiltersChange({
      ...filters,
      amenities: updatedAmenities
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      location: '',
      sport: '',
      priceRange: [0, 2000],
      rating: 0,
      amenities: []
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filters</CardTitle>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location Filter */}
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-green-500" />
              Location
            </h4>
            <div className="space-y-3">
              {locations.map((location) => (
                <div key={location} className="flex items-center space-x-2">
                  <Checkbox
                    id={location}
                    checked={filters.location === location}
                    onCheckedChange={(checked) => handleLocationChange(location, checked as boolean)}
                  />
                  <label htmlFor={location} className="text-sm text-gray-700 cursor-pointer">
                    {location}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Sports Filter */}
          <div>
            <h4 className="font-medium mb-3">Sports Available</h4>
            <div className="space-y-3">
              {sports.map((sport) => (
                <div key={sport} className="flex items-center space-x-2">
                  <Checkbox
                    id={sport}
                    checked={filters.sport === sport}
                    onCheckedChange={(checked) => handleSportChange(sport, checked as boolean)}
                  />
                  <label htmlFor={sport} className="text-sm text-gray-700 cursor-pointer">
                    {sport}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="font-medium mb-3">Price Range (per hour)</h4>
            <div className="px-2">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value })}
                max={2000}
                min={0}
                step={100}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>₹{filters.priceRange[0]}</span>
                <span>₹{filters.priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <Star className="h-4 w-4 mr-2 text-yellow-500" />
              Minimum Rating
            </h4>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={filters.rating === rating}
                    onCheckedChange={(checked) => 
                      onFiltersChange({ ...filters, rating: checked ? rating : 0 })
                    }
                  />
                  <label htmlFor={`rating-${rating}`} className="text-sm text-gray-700 cursor-pointer flex items-center">
                    {rating}+ <Star className="h-3 w-3 ml-1 text-yellow-500 fill-current" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h4 className="font-medium mb-3">Amenities</h4>
            <div className="space-y-3">
              {amenities.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={filters.amenities.includes(amenity)}
                    onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                  />
                  <label htmlFor={amenity} className="text-sm text-gray-700 cursor-pointer">
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {(filters.location || filters.sport || filters.amenities.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filters.location && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {filters.location}
                </Badge>
              )}
              {filters.sport && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {filters.sport}
                </Badge>
              )}
              {filters.amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary" className="bg-purple-100 text-purple-800">
                  {amenity}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}