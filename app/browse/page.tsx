'use client';

import { useState } from 'react';
import { BrowseHeader } from '@/components/browse/BrowseHeader';
import { FilterSidebar } from '@/components/browse/FilterSidebar';
import { TurfGrid } from '@/components/browse/TurfGrid';
import { Footer } from '@/components/landing/Footer';

export default function BrowsePage() {
  const [filters, setFilters] = useState({
    location: '',
    sport: '',
    priceRange: [0, 2000],
    rating: 0,
    amenities: []
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');

  return (
    <div className="min-h-screen bg-gray-50">
      <BrowseHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <FilterSidebar 
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
          
          <div className="lg:col-span-3">
            <TurfGrid 
              filters={filters}
              searchQuery={searchQuery}
              sortBy={sortBy}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}