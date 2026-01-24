// app/accessories/page.jsx
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FloatingCart from '@/components/FloatingCart';

export default function AccessoriesPage() {
  const products = [
    { id: 1, name: "Accessory Item 1", price: "£24.99", image: "/placeholder-product.jpg" },
    { id: 2, name: "Accessory Item 2", price: "£34.99", image: "/placeholder-product.jpg" },
    { id: 3, name: "Accessory Item 3", price: "£19.99", image: "/placeholder-product.jpg" },
    { id: 4, name: "Accessory Item 4", price: "£29.99", image: "/placeholder-product.jpg" },
    { id: 5, name: "Accessory Item 5", price: "£39.99", image: "/placeholder-product.jpg" },
    { id: 6, name: "Accessory Item 6", price: "£22.99", image: "/placeholder-product.jpg" },
    { id: 7, name: "Accessory Item 7", price: "£27.99", image: "/placeholder-product.jpg" },
    { id: 8, name: "Accessory Item 8", price: "£32.99", image: "/placeholder-product.jpg" },
  ];

  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#233e89] to-[#233e89] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-white space-y-4">
            <h1 className="text-6xl font-bold">Accessories</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Complete your look with our curated collection of premium accessories. From bags to jewelry, find the perfect finishing touch.
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-[#ecfeff] py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Filter/Sort Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
            <p className="text-gray-600 text-lg">
              Showing <span className="font-bold">{products.length}</span> products
            </p>
            <div className="flex gap-4">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative h-72 bg-gray-200 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Product Image
                  </div>
                  <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{product.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm">Premium quality accessory</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[#2563eb] font-bold text-xl">{product.price}</p>
                    <button className="bg-[#2563eb] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#1d4ed8] transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-12">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 bg-[#2563eb] text-white rounded-lg font-bold">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">2</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">3</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              Next
            </button>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingCart />
    </>
  );
}