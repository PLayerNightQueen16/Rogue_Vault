import React, { useState } from 'react';
import { ArrowRight, Sparkles, AlertCircle, ShoppingBag, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const categoryFallbacks = {
  electronics: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
  fashion: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80',
  accessories: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
  home: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&auto=format&fit=crop&q=80',
  books: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
  footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
};

function formatPriceRupees(price) {
  if (typeof price === 'number') {
    return `₹${price.toLocaleString('en-IN')}`;
  }
  if (!price) return '₹0';
  const str = String(price).trim();
  if (str.startsWith('₹')) return str;
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? str : `₹${num.toLocaleString('en-IN')}`;
}

function TrendingSection({ products = [], loading = false, error = '', onAddToCart, activeCategory = 'all', wishlistIds = new Set() }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalImgSrc, setModalImgSrc] = useState('');

  const handleOpenQuickView = (prod) => {
    setSelectedProduct(prod);
    setModalImgSrc(prod.image);
  };

  const getFallback = (cat) => {
    const k = cat ? cat.toLowerCase() : 'default';
    return categoryFallbacks[k] || categoryFallbacks.default;
  };

  return (
    <section id="trending" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="flex items-end justify-between mb-8 sm:mb-10 pb-4 border-b border-red-950/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-red-400">
              {activeCategory !== 'all' ? `${activeCategory} Collection` : 'Live Vault Inventory'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-['Cinzel',serif] font-bold text-white tracking-wide">
            {activeCategory !== 'all' ? `${activeCategory.toUpperCase()} PRODUCTS` : 'Trending Now'}
          </h2>
        </div>

        <Link
          to={activeCategory !== 'all' ? `/products?category=${encodeURIComponent(activeCategory)}` : '/products'}
          className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-red-400 hover:text-red-300 transition-colors pb-1"
        >
          <span>Explore All Products</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Fetching exclusive vault products...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center py-12 px-4">
          <div className="bg-red-950/30 border border-red-500/40 rounded-2xl p-6 text-center max-w-md">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-300 font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-3xl p-8">
          <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No products found in this category</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Try switching to another category pill above or reset filters to browse the entire vault catalog.
          </p>
        </div>
      )}

      {/* Grid of Product Cards */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => {
            const pId = (product._id || product.id)?.toString();
            return (
              <ProductCard
                key={pId}
                product={product}
                isWishlisted={wishlistIds.has(pId)}
                onAddToCart={onAddToCart}
                onQuickView={handleOpenQuickView}
              />
            );
          })}
        </div>
      )}

      {/* Quick View Modal */}
      {selectedProduct && (
        <div
          onClick={() => setSelectedProduct(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0e1017] border border-red-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.3)] relative overflow-hidden"
          >
            {/* Modal Ambient Light */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="aspect-square rounded-2xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
                <img
                  src={modalImgSrc || getFallback(selectedProduct.category)}
                  alt={selectedProduct.name}
                  onError={() => setModalImgSrc(getFallback(selectedProduct.category))}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600/30 border border-red-500/50 text-red-300 uppercase">
                    {selectedProduct.category}
                  </span>
                  <span className="text-xs font-bold text-red-500">
                    {selectedProduct.discount || '-30% OFF'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white font-['Cinzel',serif]">
                  {selectedProduct.name}
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {selectedProduct.description || 'Premium craftsmanship engineered with high precision materials and vault certification.'}
                </p>

                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-black text-white font-['Space_Grotesk',sans-serif]">
                    {formatPriceRupees(selectedProduct.price)}
                  </span>
                  {selectedProduct.price && (
                    <span className="text-sm text-zinc-500 line-through">
                      ₹{Math.round(selectedProduct.price * 1.35).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {selectedProduct.stock !== undefined && (
                  <p className="text-[11px] text-zinc-400">
                    In Stock: <span className="font-semibold text-emerald-400">{selectedProduct.stock} units</span>
                  </p>
                )}

                <div className="pt-3 flex flex-wrap gap-2.5">
                  <Link
                    to={`/products/${selectedProduct._id || selectedProduct.id}`}
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>View Details</span>
                  </Link>
                  <button
                    onClick={() => {
                      onAddToCart && onAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

export default TrendingSection;
