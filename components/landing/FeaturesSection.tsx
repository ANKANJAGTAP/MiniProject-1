import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  CreditCard, 
  Bell, 
  Star, 
  Shield, 
  Smartphone,
  MapPin,
  Clock
} from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Calendar,
      title: 'Real-time Booking',
      description: 'Check availability and book instantly with live slot updates and automated confirmations.',
      color: 'text-green-500'
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Multiple payment options including UPI, cards, and wallets with secure processing.',
      color: 'text-blue-500'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Get SMS and email reminders for bookings, cancellations, and special offers.',
      color: 'text-purple-500'
    },
    {
      icon: Star,
      title: 'Reviews & Ratings',
      description: 'Read authentic reviews and ratings from other players to choose the best turfs.',
      color: 'text-yellow-500'
    },
    {
      icon: Shield,
      title: 'Booking Protection',
      description: 'Guaranteed refunds for cancellations and protection against booking conflicts.',
      color: 'text-red-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Fully responsive design that works perfectly on all devices and screen sizes.',
      color: 'text-indigo-500'
    },
    {
      icon: MapPin,
      title: 'Location-based Search',
      description: 'Find turfs near you in Sangli and Miraj with accurate location and directions.',
      color: 'text-green-600'
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Book for any duration with flexible time slots and seasonal pricing options.',
      color: 'text-orange-500'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose TurfBook?
          </h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've built the most comprehensive turf booking platform with features 
            that make sports facility booking effortless for both players and turf owners.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index} 
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-gray-50"
              >
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-4 p-3 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 w-16 h-16 flex items-center justify-center`}>
                    <IconComponent className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}