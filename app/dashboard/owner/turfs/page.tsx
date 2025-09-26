'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, CreditCard as Edit, Trash2, MapPin, Clock, Star, Users, RefreshCw, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Turf {
  _id: string;
  name: string;
  address: string;
  pricePerHour: number;
  images: string[];
  availableSports: string[];
  amenities: string[];
  operatingHours: {
    open: string;
    close: string;
  };
  timeSlots: any[];
  qrToken: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OwnerTurfsPage() {
  const { user, session } = useAuth();
  const router = useRouter();
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    loadTurfs();
  }, [user]);

  const loadTurfs = async () => {
    try {
      const response = await fetch('/api/owner/turfs', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTurfs(data.turfs);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to load turfs');
      }
    } catch (error) {
      console.error('Error loading turfs:', error);
      toast.error('Failed to load turfs');
    } finally {
      setLoading(false);
    }
  };

  const deleteTurf = async (turfId: string) => {
    if (!confirm('Are you sure you want to delete this turf? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/owner/turfs/${turfId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });
      
      if (response.ok) {
        toast.success('Turf deleted successfully');
        await loadTurfs();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete turf');
      }
    } catch (error) {
      toast.error('Failed to delete turf');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Turfs</h1>
            <p className="text-gray-600 mt-2">
              Manage your sports facilities and bookings
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={loadTurfs}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Link href="/dashboard/owner/turfs/add">
              <Button className="bg-green-500 hover:bg-green-600 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Turf
              </Button>
            </Link>
          </div>
        </div>

        {turfs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No turfs yet</h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first sports facility to the platform.
              </p>
              <Link href="/dashboard/owner/turfs/add">
                <Button className="bg-green-500 hover:bg-green-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Turf
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turfs.map((turf) => (
              <Card key={turf._id} className="hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  {turf.images.length > 0 ? (
                    <img
                      src={turf.images[0]}
                      alt={turf.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Users className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 text-white">
                      ₹{turf.pricePerHour}/hr
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {turf.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{turf.address}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {turf.operatingHours.open} - {turf.operatingHours.close}
                      </span>
                    </div>

                    {turf.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {turf.description}
                      </p>
                    )}

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {turf.availableSports.map((sport, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {sport}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {turf.amenities.slice(0, 3).join(' • ')}
                        {turf.amenities.length > 3 && ` +${turf.amenities.length - 3} more`}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mb-4">
                      {turf.timeSlots.length} time slots available
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/dashboard/owner/turfs/edit/${turf._id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/book/${turf._id}`}>
                      <Button variant="outline" size="sm">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTurf(turf._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}