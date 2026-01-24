// app/about/page.jsx
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FloatingCart from '@/components/FloatingCart';
import { Facebook, Twitter, Instagram } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'linear-gradient(rgba(30, 64, 175, 0.7), rgba(37, 99, 235, 0.7)), url("/about-hero.jpg")',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-6xl font-bold text-white mb-4">About Us</h1>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="bg-[#ecfeff] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <div className="w-16 h-1 bg-[#2563eb] mb-6"></div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Who We Are
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Elora Vista is a global lifestyle and trading brand that focuses on sourcing, importing, and reselling high-quality products from trusted international markets such as China, Vietnam, and Turkey.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                The business bridges the gap between global suppliers and local customers, offering carefully selected items that combine quality, affordability, and style.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Elora Vista operates both as an e-commerce platform and a learning hub — a place where customers can shop imported goods and aspiring entrepreneurs can learn about importation and product sourcing.
              </p>
            </div>

            {/* Image */}
            <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/who-we-are.jpg" 
                alt="Team collaboration" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#2563eb] font-semibold mb-2">A Few Words About</p>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Our Team</h2>
            <div className="w-24 h-1 bg-[#2563eb] mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Behind every great product is a dedicated team. We are a group of passionate creatives, product curators, and customer-care specialists working together to bring you quality items you can trust.
            </p>
          </div>

          {/* Team Member */}
          <div className="flex justify-center">
            <div className="bg-[#ecfeff] rounded-lg p-8 max-w-sm text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden">
                <img 
                  src="/team-member.jpg" 
                  alt="Elizabeth Taiwo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Elizabeth Taiwo</h3>
              <p className="text-gray-600">Founder - CEO</p>
            </div>
          </div>
        </div>
      </section>

      {/* Follow Us Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Left Image */}
            <div className="h-96 rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/follow-left.jpg" 
                alt="Follow us" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Center Content */}
            <div className="text-center">
              <div className="w-16 h-1 bg-[#2563eb] mx-auto mb-6"></div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">Follow Us</h2>
              <div className="flex justify-center gap-6">
                <a 
                  href="#" 
                  className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-[#2563eb] transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-[#2563eb] transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-[#2563eb] transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-[#2563eb] transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Right Image */}
            <div className="h-96 rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/follow-right.jpg" 
                alt="Follow us" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingCart />
    </>
  );
}