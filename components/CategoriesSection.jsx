import React from 'react';
import { Shirt, Utensils, Baby, ShoppingBasket } from 'lucide-react';

const CategoriesSection = () => {
  const categories = [
    {
      icon: <Shirt className="w-16 h-16" strokeWidth={1.5} />,
      title: "Fashion",
      description: "Exclusive Fashion deals for a Limited Time"
    },
    {
      icon: <Utensils className="w-16 h-16" strokeWidth={1.5} />,
      title: "Home and Kitchen",
      description: "Enjoy Exclusive Savings on Carefully Curated Products"
    },
    {
      icon: <Baby className="w-16 h-16" strokeWidth={1.5} />,
      title: "Baby",
      description: "From Trusted Global Markets to Your Doorstep"
    },
    {
      icon: <ShoppingBasket className="w-16 h-16" strokeWidth={1.5} />,
      title: "Other",
      description: "Premium-quality products, carefully sourced from reliable partners."
    }
  ];

  return (
    <section className="bg-gradient-to-r from-[#4883ad] to-[#4883ad] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div key={index} className="text-center text-white">
              <div className="flex justify-center mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-white flex items-center justify-center">
                  {category.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">
                {category.title}
              </h3>
              <p className="text-white leading-relaxed">
                {category.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;