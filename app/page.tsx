import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PopularTurfs } from '@/components/landing/PopularTurfs';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <PopularTurfs />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}