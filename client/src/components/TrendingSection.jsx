import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, AlertCircle, ShoppingBag, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { formatCategoryName, CATEGORY_FALLBACKS } from '../constants/categories';
import { useCart } from '../context/CartContext';

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
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalImgSrc, setModalImgSrc] = useState('');

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedProduct) {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct]);

  const handleOpenQuickView = (prod) => {
    setSelectedProduct(prod);
    setModalImgSrc(prod.image);
  };

  const getFallback = (cat) => {
    const k = cat ? cat.toLowerCase() : 'default';
    return CATEGORY_FALLBACKS[k] || CATEGORY_FALLBACKS.default;
  };

  const categoryTitle = formatCategoryName(activeCategory);

  return (
    <section id="trending" className="py-8 sm:py-16 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-10 pb-4 border-b border-red-950/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-red-400">
              {activeCategory !== 'all' ? `${categoryTitle} Collection` : 'Live Vault Inventory'}
            </span>
          </div>
          <h2 className="text-xl xs:text-2xl sm:text-4xl font-['Cinzel',serif] font-bold text-white tracking-wide">
            {activeCategory !== 'all' ? `${categoryTitle.toUpperCase()} PRODUCTS` : 'Trending Now'}
          </h2>
        </div>

        <Link
          to={activeCategory !== 'all' ? `/products?category=${encodeURIComponent(activeCategory)}` : '/products'}
          className="group inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-red-400 hover:text-red-300 transition-colors pb-1 self-start sm:self-auto"
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
        <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8">
          <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No products found in this category</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Try switching to another category pill above or reset filters to browse the entire vault catalog.
          </p>
        </div>
      )}

      {/* Grid of Product Cards */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0e1017] border border-red-500/40 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.3)] relative overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Ambient Light */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button Top Right */}
            <button
              onClick={() => setSelectedProduct(null)}
              aria-label="Close modal"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-red-950 border border-zinc-700/80 hover:border-red-500/60 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-center">
              <div className="aspect-square rounded-2xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
                <img
                  src={modalImgSrc || getFallback(selectedProduct.category)}
                  alt={selectedProduct.name}
                  onError={() => setModalImgSrc(getFallback(selectedProduct.category))}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600/30 border border-red-500/50 text-red-300 uppercase">
                    {selectedProduct.category}
                  </span>
                  <span className="text-xs font-bold text-red-500">
                    {selectedProduct.discount || '-30% OFF'}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white font-['Cinzel',serif]">
                  {selectedProduct.name}
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 sm:line-clamp-none">
                  {selectedProduct.description || 'Premium craftsmanship engineered with high precision materials and vault certification.'}
                </p>

                <div className="flex items-baseline gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl font-black text-white font-['Space_Grotesk',sans-serif]">
                    {formatPriceRupees(selectedProduct.price)}
                  </span>
                  {selectedProduct.price && (
                    <span className="text-xs sm:text-sm text-zinc-500 line-through">
                      ₹{Math.round(selectedProduct.price * 1.35).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {selectedProduct.stock !== undefined && (
                  <p className="text-[11px] text-zinc-400">
                    In Stock: <span className="font-semibold text-emerald-400">{selectedProduct.stock} units</span>
                  </p>
                )}

                <div className="pt-2 sm:pt-3 flex flex-wrap gap-2 sm:gap-2.5">
                  <Link
                    to={`/products/${selectedProduct._id || selectedProduct.id}`}
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>View Details</span>
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        await addToCart(selectedProduct);
                        if (onAddToCart) onAddToCart(selectedProduct);
                        setSelectedProduct(null);
                      } catch (err) {
                        if (err?.isAuth || err?.response?.status === 401 || err?.status === 401) {
                          setSelectedProduct(null);
                        }
                      }
                    }}
                    className="py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="py-2.5 sm:py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
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
