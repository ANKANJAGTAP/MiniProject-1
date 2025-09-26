'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
  _id: string;
  turfId: string;
  playerId: string;
  slotId: string;
  slot: {
    date: string;
    start: string;
    end: string;
  };
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  qrUsed: boolean;
  turf: {
    name: string;
    address: string;
  };
  player: {
    name: string;
    email: string;
    phone?: string;
  };
}

export default function OwnerDashboard() {
  const { user, session } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    loadProfile();
    loadBookings();
    
    // Set up polling for real-time updates
    const interval = setInterval(loadBookings, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/owner/profile', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      } else if (response.status === 404) {
        // Create owner profile if it doesn't exist
        await createOwnerProfile();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const createOwnerProfile = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          supabase_id: user?.id,
          name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Owner',
          email: user?.email,
          role: 'owner',
        }),
      });
      
      if (response.ok) {
        await loadProfile();
      }
    } catch (error) {
      console.error('Error creating owner profile:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const response = await fetch('/api/owner/bookings', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        toast.success(`Booking ${status} successfully`);
        await loadBookings();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update booking');
      }
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: AlertCircle, color: 'text-yellow-600' },
      confirmed: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      completed: { variant: 'outline' as const, icon: CheckCircle, color: 'text-blue-600' },
    };
    
    const config = variants[status as keyof typeof variants];
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className={`h-3 w-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {profile?.name || user?.email}
          </p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="turfs">My Turfs</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Recent Bookings</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadBookings}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            {bookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-600">
                    Bookings will appear here when players book your turfs.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <Card key={booking._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.turf.name}
                          </h3>
                          <div className="flex items-center text-gray-600 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">{booking.turf.address}</span>
                          </div>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Player Details
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>{booking.player.name}</div>
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {booking.player.email}
                            </div>
                            {booking.player.phone && (
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {booking.player.phone}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Booking Details
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Date: {new Date(booking.slot.date).toLocaleDateString()}</div>
                            <div>Time: {booking.slot.start} - {booking.slot.end}</div>
                            <div>Amount: ₹{booking.amount}</div>
                            <div>Booked: {new Date(booking.createdAt).toLocaleString()}</div>
                            {booking.qrUsed && (
                              <Badge variant="outline" className="text-xs">
                                QR Booking
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {booking.status === 'confirmed' && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking._id, 'completed')}
                          >
                            Mark Completed
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                <Link href="/dashboard/owner/turfs" className="hover:text-green-600">
                  Manage My Turfs
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="turfs">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">My Turfs</h2>
              <Link href="/dashboard/owner/turfs">
                <Button className="bg-green-500 hover:bg-green-600">
                  Manage All Turfs
                </Button>
              </Link>
            </div>
            <Card>
              <CardContent className="text-center py-12">
                <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Your Turfs</h3>
                <p className="text-gray-600 mb-6">
                  Add, edit, and manage your sports facilities from the dedicated turfs section.
                </p>
                <Link href="/dashboard/owner/turfs">
                  <Button className="bg-green-500 hover:bg-green-600">
                    Go to Turfs Management
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Owner Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {profile ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <p className="text-gray-900">{profile.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">{profile.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <Badge variant="secondary">{profile.role}</Badge>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Member Since
                      </label>
                      <p className="text-gray-900">
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Loading profile...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}