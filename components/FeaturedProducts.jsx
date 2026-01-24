import React from 'react';

const FeaturedProducts = () => {
  return (
    <section className="bg-cyan-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>
        
        {/* Products grid will go here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Product placeholders - you can map your actual products here */}
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Product Image {item}</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Product Name</h3>
                <p className="text-gray-600 mb-2">Product description goes here</p>
                <p className="text-blue-600 font-bold text-xl">£99.99</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;