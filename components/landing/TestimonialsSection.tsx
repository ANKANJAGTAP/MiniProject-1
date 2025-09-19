import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Rahul Patil',
      role: 'Cricket Enthusiast',
      content: 'TurfBook has completely changed how we book cricket grounds. No more calling multiple places - everything is available at one click!',
      rating: 5,
      location: 'Sangli'
    },
    {
      name: 'Priya Deshmukh',
      role: 'Football Player',
      content: 'As a working professional, I love the convenience of booking turfs online. The payment system is secure and the notifications keep me updated.',
      rating: 5,
      location: 'Miraj'
    },
    {
      name: 'Sunil Kadam',
      role: 'Turf Owner',
      content: 'Managing bookings was a nightmare before TurfBook. Now everything is automated and I can focus on maintaining the facility quality.',
      rating: 5,
      location: 'Sangli'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Community Says
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join hundreds of satisfied players and turf owners who have transformed 
            their sports experience with TurfBook.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-gradient-to-br from-green-50 to-blue-50 border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-green-600">{testimonial.location}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}