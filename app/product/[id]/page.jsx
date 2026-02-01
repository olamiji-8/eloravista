// app/product/[id]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Heart, Minus, Plus, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { productsAPI } from '@/lib/api/products';
import { wishlistAPI } from '@/lib/api/wishlist';

export default function ProductDetailPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  useEffect(() => {
    if (productId) {
      fetchProduct();
      checkWishlist();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getProduct(productId);
      setProduct(data.data);
      
      // Fetch related products (same category)
      if (data.data.category) {
        const relatedData = await productsAPI.getProducts({ 
          category: data.data.category, 
          limit: 4 
        });
        setRelatedProducts(relatedData.data.filter(p => p._id !== productId));
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      alert('Product not found');
      router.push('/store');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    if (!isAuthenticated) return;
    
    try {
      const data = await wishlistAPI.getWishlist();
      const productIds = data.data?.products?.map(p => p._id) || [];
      setIsInWishlist(productIds.includes(productId));
    } catch (error) {
      console.error('Failed to check wishlist:', error);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      router.push('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(productId, quantity);
      alert('Added to cart!');
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to wishlist');
      router.push('/login');
      return;
    }

    setTogglingWishlist(true);
    try {
      if (isInWishlist) {
        await wishlistAPI.removeFromWishlist(productId);
        setIsInWishlist(false);
      } else {
        await wishlistAPI.addToWishlist(productId);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      alert('Failed to update wishlist');
    } finally {
      setTogglingWishlist(false);
    }
  };

  const handleImageNavigation = (direction) => {
    if (!product?.images) return;
    
    if (direction === 'next') {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    } else {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen pt-24 pb-12 bg-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="animate-pulse">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="h-96 bg-gray-300 rounded-lg"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-24 bg-gray-300 rounded"></div>
                  <div className="h-12 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen pt-24 pb-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#233e89] cursor-pointer">Home</Link>
            <span>/</span>
            <Link href="/store" className="hover:text-[#233e89] cursor-pointer">Store</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link href={`/store?category=${product.category}`} className="hover:text-[#233e89] cursor-pointer">
                  {product.category}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>

          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
              {/* Image Gallery */}
              <div>
                <div className="relative bg-gray-200 rounded-lg overflow-hidden mb-4" style={{ paddingBottom: '100%' }}>
                  {product.images && product.images.length > 0 ? (
                    <>
                      <img
                        src={product.images[selectedImage].url}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {product.images.length > 1 && (
                        <>
                          <button
                            onClick={() => handleImageNavigation('prev')}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="w-6 h-6 text-gray-900" />
                          </button>
                          <button
                            onClick={() => handleImageNavigation('next')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors cursor-pointer"
                          >
                            <ChevronRight className="w-6 h-6 text-gray-900" />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      No Image Available
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {product.images && product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative bg-gray-200 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedImage === index
                            ? 'border-[#233e89]'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                        style={{ paddingBottom: '100%' }}
                      >
                        <img
                          src={img.url}
                          alt={`${product.name} ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  {product.category && (
                    <p className="text-gray-600 text-sm mb-4">
                      Category: <span className="font-medium">{product.category}</span>
                    </p>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm">(No reviews yet)</span>
                  </div>
                </div>

                <div className="border-t border-b py-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-[#233e89]">
                      £{product.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900">Availability:</span>
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-semibold">
                      In Stock ({product.stock} available)
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">Out of Stock</span>
                  )}
                </div>

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div>
                    <label className="block font-semibold text-gray-900 mb-2">Quantity:</label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border-2 border-gray-900 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                          className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          <Minus className="w-5 h-5 text-gray-900" />
                        </button>
                        <span className="px-6 py-2 font-semibold text-lg border-x-2 border-gray-900 text-gray-900">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= product.stock}
                          className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          <Plus className="w-5 h-5 text-gray-900" />
                        </button>
                      </div>
                      <span className="text-gray-600">Max: {product.stock}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addingToCart}
                    className="flex-1 bg-[#233e89] text-white px-6 py-4 rounded-lg font-bold hover:bg-[#1d4ed8] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={handleToggleWishlist}
                    disabled={togglingWishlist}
                    className={`px-6 py-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 border-2 cursor-pointer ${
                      isInWishlist
                        ? 'bg-red-50 border-red-500 text-red-600 hover:bg-red-100'
                        : 'bg-white border-gray-300 text-gray-900 hover:border-[#233e89] hover:text-[#233e89]'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-600' : ''}`} />
                    {isInWishlist ? 'Saved' : 'Save'}
                  </button>
                </div>

                {/* Additional Info */}
                <div className="border-t pt-6 space-y-3 text-sm text-gray-600">
                  <p><span className="font-semibold text-gray-900">SKU:</span> {product._id.slice(-8).toUpperCase()}</p>
                  {product.category && (
                    <p><span className="font-semibold text-gray-900">Category:</span> {product.category}</p>
                  )}
                  <p><span className="font-semibold text-gray-900">Free shipping:</span> On orders over £100</p>
                  <p><span className="font-semibold text-gray-900">Returns:</span> 30-day return policy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct._id}
                    href={`/product/${relatedProduct._id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer"
                  >
                    <div className="h-64 bg-gray-200 overflow-hidden">
                      {relatedProduct.images && relatedProduct.images.length > 0 ? (
                        <img
                          src={relatedProduct.images[0].url}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-[#233e89] transition-colors line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-[#233e89] font-bold text-xl">
                        £{relatedProduct.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}