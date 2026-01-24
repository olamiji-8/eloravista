import React from 'react';
import { Globe, Tag, Lock } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Globe className="w-12 h-12" strokeWidth={1.5} />,
      title: "Worldwide Shipping",
      description: "We offer reliable worldwide shipping, delivering trusted global products safely to customers wherever they are."
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
      title: "Best Quality",
      description: "We deliver premium-quality products, carefully inspected and sourced from reliable global partners."
    },
    {
      icon: <Tag className="w-12 h-12" strokeWidth={1.5} />,
      title: "Best Offers",
      description: "Enjoy the best offers on trusted global products without compromising on quality."
    },
    {
      icon: <Lock className="w-12 h-12" strokeWidth={1.5} />,
      title: "Secure Payments",
      description: "We ensure secure payments through trusted, encrypted payment systems that protect your transactions"
    }
  ];

  return (
    <section className="bg-cyan-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4 text-gray-800">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;