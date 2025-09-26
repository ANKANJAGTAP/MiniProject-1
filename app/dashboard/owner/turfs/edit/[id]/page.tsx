'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const SPORTS_OPTIONS = [
  'Football', 'Cricket', 'Basketball', 'Badminton', 'Tennis', 
  'Volleyball', 'Hockey', 'Table Tennis', 'Squash'
];

const AMENITIES_OPTIONS = [
  'Floodlights', 'Parking', 'Washroom', 'Cafeteria', 'Equipment', 
  'AC', 'Scoreboard', 'Commentary Box', 'Changing Rooms', 'First Aid'
];

export default function EditTurfPage({ params }: { params: { id: string } }) {
  const { user, session } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    pricePerHour: '',
    description: '',
    operatingHours: {
      open: '06:00',
      close: '23:00'
    },
    availableSports: [] as string[],
    amenities: [] as string[],
    images: [] as string[]
  });

  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    loadTurf();
  }, [user, params.id]);

  const loadTurf = async () => {
    try {
      const response = await fetch(`/api/owner/turfs/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const turf = data.turf;
        setFormData({
          name: turf.name,
          address: turf.address,
          pricePerHour: turf.pricePerHour.toString(),
          description: turf.description || '',
          operatingHours: turf.operatingHours,
          availableSports: turf.availableSports || [],
          amenities: turf.amenities || [],
          images: turf.images || []
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to load turf');
        router.push('/dashboard/owner/turfs');
      }
    } catch (error) {
      console.error('Error loading turf:', error);
      toast.error('Failed to load turf');
      router.push('/dashboard/owner/turfs');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSportChange = (sport: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      availableSports: checked
        ? [...prev.availableSports, sport]
        : prev.availableSports.filter(s => s !== sport)
    }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  const addImage = () => {
    if (newImage.trim() && !formData.images.includes(newImage.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage.trim()]
      }));
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.pricePerHour) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.availableSports.length === 0) {
      toast.error('Please select at least one sport');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/owner/turfs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          ...formData,
          pricePerHour: Number(formData.pricePerHour)
        }),
      });
      
      if (response.ok) {
        toast.success('Turf updated successfully!');
        router.push('/dashboard/owner/turfs');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update turf');
      }
    } catch (error) {
      toast.error('Failed to update turf');
    } finally {
      setLoading(false);
    }
  };

  if (!user || initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard/owner/turfs" className="flex items-center text-gray-600 hover:text-green-600 mb-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to My Turfs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Turf</h1>
          <p className="text-gray-600 mt-2">
            Update your sports facility information
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Turf Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Green Field Sports Complex"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Full address of your turf"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your turf facilities and features"
                  />
                </div>

                <div>
                  <Label htmlFor="pricePerHour">Price per Hour (₹) *</Label>
                  <Input
                    id="pricePerHour"
                    type="number"
                    value={formData.pricePerHour}
                    onChange={(e) => handleInputChange('pricePerHour', e.target.value)}
                    placeholder="500"
                    min="0"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="openTime">Opening Time</Label>
                    <Input
                      id="openTime"
                      type="time"
                      value={formData.operatingHours.open}
                      onChange={(e) => handleInputChange('operatingHours.open', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="closeTime">Closing Time</Label>
                    <Input
                      id="closeTime"
                      type="time"
                      value={formData.operatingHours.close}
                      onChange={(e) => handleInputChange('operatingHours.close', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sports Available */}
            <Card>
              <CardHeader>
                <CardTitle>Available Sports *</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {SPORTS_OPTIONS.map((sport) => (
                    <div key={sport} className="flex items-center space-x-2">
                      <Checkbox
                        id={sport}
                        checked={formData.availableSports.includes(sport)}
                        onCheckedChange={(checked) => handleSportChange(sport, checked as boolean)}
                      />
                      <Label htmlFor={sport} className="text-sm">
                        {sport}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {AMENITIES_OPTIONS.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                      />
                      <Label htmlFor={amenity} className="text-sm">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="Enter image URL"
                  />
                  <Button type="button" onClick={addImage} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.images.length > 0 && (
                  <div className="space-y-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm truncate flex-1">{image}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Link href="/dashboard/owner/turfs" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="flex-1 bg-green-500 hover:bg-green-600"
                disabled={loading}
              >
                {loading ? 'Updating Turf...' : 'Update Turf'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}