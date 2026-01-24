import React from 'react';

const SpecialEditionBanner = () => {
  return (
    <section className="relative bg-gradient-to-r from-[#4883ad] to-[#4883ad] py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-white">
            <p className="text-lg mb-2 font-medium">Limited Time Offer</p>
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Special Edition
            </h2>
            <p className="text-lg mb-8 leading-relaxed">
              Every product is selected to meet high standards of quality, durability, and value.
            </p>
            <button className="bg-white text-[#0F2252] px-8 py-3 font-bold hover:bg-[#0F2252] hover:text-white transition-colors mt-4">
              SHOP NOW
            </button>
          </div>
          
          {/* Image Placeholder */}
          <div className="relative h-96">
            {/* Replace this div with your special edition image */}
            <div className="w-full h-full bg-blue-600 rounded-lg flex items-center justify-center">
              <img 
                src="/special-edition-image.png" 
                alt="Special Edition" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialEditionBanner;