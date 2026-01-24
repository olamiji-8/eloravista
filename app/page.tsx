import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import SpecialEditionBanner from '@/components/SpecialEditionBanner';
import CategoriesSection from '@/components/CategoriesSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import Footer from '@/components/Footer';
import FloatingCart from '@/components/FloatingCart';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
         <CategoriesSection />
         <FeaturedProducts />
         <SpecialEditionBanner />
        <FeaturesSection />
        
       
        
      </main>
      <Footer />
      <FloatingCart />
    </div>
  );
}