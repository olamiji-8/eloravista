import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-[#233e89] to-[#233e89] pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-white">
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              EloraVista
            </h1>
            <p className="text-xl mb-8 leading-relaxed">
              We are a global lifestyle and trading brand, sourcing and delivering high-quality products from trusted international markets.
            </p>
            <div className="flex gap-4">
              <button className="bg-white text-blue-900 px-8 py-3 font-bold hover:bg-gray-100 transition-colors">
                SHOP NOW
              </button>
              <button className="border-2 border-white text-white px-8 py-3 font-bold hover:bg-white hover:text-blue-900 transition-colors">
                LEARN
              </button>
            </div>
          </div>
          
          {/* Image Placeholder */}
          <div className="relative h-96">
            {/* Replace this div with your hero image */}
            <div className="w-full h-full bg-blue-700 rounded-lg flex items-center justify-center">
              <img 
                src="/banner.jpg" 
                alt="Hero" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;