import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import SpecialEditionBanner from '@/components/SpecialEditionBanner';
import FeaturedProducts from '@/components/FeaturedProducts';
import Footer from '@/components/Footer';
import FloatingCart from '@/components/FloatingCart';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        
         <FeaturedProducts />
         <SpecialEditionBanner />
        
       
        
      </main>
      <Footer />
      <FloatingCart />
    </div>
  );
}