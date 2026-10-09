import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Trash2, 
  Eye, 
  ShoppingBag, 
  Loader2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  PackageX,
  Lock
} from 'lucide-react';
import { fetchWishlist, removeFromWishlist } from '../services/api';
import Footer from '../components/Footer';

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

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthError, setIsAuthError] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const navigate = useNavigate();

  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setIsAuthError(false);

      const data = await fetchWishlist();
      if (data && Array.isArray(data.wishlist)) {
        setWishlist(data.wishlist.filter(Boolean));
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      if (err?.response?.status === 401) {
        setIsAuthError(true);
        setError('Please sign in to view your wishlist.');
      } else {
        setError("Something went wrong. We couldn't load your wishlist.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleRemove = async (productId, productName) => {
    if (!productId || removingId) return;

    try {
      setRemovingId(productId);
      await removeFromWishlist(productId);

      // Update UI state without full page refresh
      setWishlist((prev) => prev.filter((item) => (item._id || item.id) !== productId));

      // Dispatch event to sync navbar counter
      window.dispatchEvent(
        new CustomEvent('wishlist-updated', { detail: { productId, isWishlisted: false } })
      );

      setToastMessage(`Removed "${productName || 'Product'}" from your wishlist`);
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setToastMessage('Failed to remove item. Please try again.');
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white pt-28 pb-16 flex flex-col justify-between">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12141e]/95 border border-red-500/80 text-white px-5 py-3 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.4)] backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <Sparkles className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <p className="text-red-400 text-xs tracking-[0.25em] uppercase font-bold">
              SAVED VAULT ITEMS
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl font-['Cinzel',serif] font-black tracking-tight text-white uppercase flex items-center gap-3">
                <span>My Wishlist</span>
                <Heart className="w-7 h-7 sm:w-9 sm:h-9 text-red-500 fill-red-500/30" />
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                Keep track of items you want to purchase and monitor live vault stock availability.
              </p>
            </div>

            {!loading && !error && wishlist.length > 0 && (
              <div className="text-xs font-semibold text-zinc-300 bg-white/5 border border-white/10 px-4 py-2 rounded-full self-start sm:self-auto">
                Total Saved: <strong className="text-red-400">{wishlist.length}</strong> {wishlist.length === 1 ? 'item' : 'items'}
              </div>
            )}
          </div>
        </div>

        {/* 6. LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            <p className="text-sm sm:text-base text-zinc-300 font-medium tracking-wide">
              Loading your wishlist...
            </p>
          </div>
        )}

        {/* 8. ERROR STATE */}
        {error && !loading && (
          <div className="bg-red-950/40 border border-red-500/50 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-12 shadow-[0_0_40px_rgba(239,68,68,0.2)] backdrop-blur-xl">
            {isAuthError ? (
              <>
                <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Authentication Required</h3>
                <p className="text-xs sm:text-sm text-zinc-300 mb-6">
                  Please log in to your account to view and manage your saved wishlist items.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link
                    to="/login"
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:brightness-110 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-all"
                  >
                    Create Account
                  </Link>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Something went wrong.</h3>
                <p className="text-xs sm:text-sm text-red-300 font-medium mb-6">
                  We couldn't load your wishlist.
                </p>
                <button
                  onClick={loadWishlist}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        )}

        {/* 7. EMPTY STATE */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="text-center py-20 sm:py-28 bg-[#0d0f17]/80 border border-red-950/40 rounded-3xl p-8 sm:p-12 max-w-lg mx-auto my-8 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <div className="w-20 h-20 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center mx-auto mb-5 text-red-400">
              <Heart className="w-10 h-10 fill-red-500/20 text-red-400" />
            </div>
            <h3 className="text-2xl font-['Cinzel',serif] font-bold text-white mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto mb-8 leading-relaxed">
              Save products you love and find them here later.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_35px_rgba(239,68,68,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Products</span>
            </Link>
          </div>
        )}

        {/* 5. WISHLIST PRODUCTS GRID */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlist.map((item) => {
              const productId = item._id || item.id;
              const catKey = item.category ? item.category.toLowerCase() : 'default';
              const fallbackImg = categoryFallbacks[catKey] || categoryFallbacks.default;
              const inStock = typeof item.stock === 'number' ? item.stock > 0 : true;
              const isRemoving = removingId === productId;

              return (
                <div
                  key={productId}
                  className="group relative bg-[#0d0f17]/90 rounded-2xl border border-red-950/40 hover:border-red-500/60 overflow-hidden transition-all duration-300 hover:shadow-[0_10px_30px_rgba(239,68,68,0.25)] flex flex-col justify-between"
                >
                  {/* Top Image Container */}
                  <div className="relative aspect-square w-full bg-[#07080c] overflow-hidden flex items-center justify-center p-3">
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-red-950/80 text-red-300 border border-red-500/30">
                        {item.category || 'Product'}
                      </span>
                    </div>

                    {/* Stock Indicator Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        inStock 
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40' 
                          : 'bg-red-950/90 text-red-400 border border-red-500/50'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Image */}
                    <img
                      src={item.image || fallbackImg}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.src = fallbackImg;
                      }}
                      className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex flex-col flex-grow justify-between bg-gradient-to-b from-[#0d0f17] to-[#090b10]">
                    
                    <div>
                      {/* Product Name */}
                      <h3 className="text-sm font-semibold text-white group-hover:text-red-300 transition-colors line-clamp-1 mb-1">
                        {item.name}
                      </h3>

                      {/* Price */}
                      <div className="mb-3">
                        <span className="text-base font-bold text-white font-['Space_Grotesk',sans-serif]">
                          {formatPriceRupees(item.price)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: View Details & Remove */}
                    <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-2">
                      <button
                        onClick={() => navigate(`/products/${productId}`)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#141722] hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-800 hover:border-red-500/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-red-400" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => handleRemove(productId, item.name)}
                        disabled={isRemoving}
                        className="w-full py-2 px-3 rounded-xl bg-red-950/30 hover:bg-red-950/70 text-red-400 hover:text-red-300 text-xs font-medium border border-red-900/40 hover:border-red-500/60 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isRemoving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Removing...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove from Wishlist</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default Wishlist;
