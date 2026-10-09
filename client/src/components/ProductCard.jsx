import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Eye, Check, Loader2, AlertCircle } from 'lucide-react';
import { toggleWishlistApi, addToWishlist, removeFromWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

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

function getOriginalPriceRupees(product) {
  if (product.originalPrice) {
    return formatPriceRupees(product.originalPrice);
  }
  const numericPrice = typeof product.price === 'number' 
    ? product.price 
    : parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;
  
  if (numericPrice > 0) {
    const markup = Math.round(numericPrice * 1.35);
    return `₹${markup.toLocaleString('en-IN')}`;
  }
  return '';
}

function ProductCard({ product, onAddToCart, onQuickView, isWishlisted: initialWishlisted = false, onWishlistChange }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [wishlistFeedback, setWishlistFeedback] = useState(null); // 'saved' | 'removed' | 'error'
  const [wishlistError, setWishlistError] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [cartError, setCartError] = useState('');
  const [imgSrc, setImgSrc] = useState(product.image);

  const productId = product._id || product.id;

  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const handleCardClick = () => {
    if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (isAddingToCart || !productId) return;

    setIsAddingToCart(true);
    setCartError('');

    try {
      await addToCart(productId);
      setIsAdded(true);
      if (onAddToCart) {
        onAddToCart(product);
      }
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      console.error('Add to cart error:', err);
      setCartError(err.message || 'Failed to add to cart');
      setTimeout(() => setCartError(''), 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (isWishlistLoading || !productId) return;

    setIsWishlistLoading(true);
    setWishlistError('');

    try {
      // Use toggle endpoint or add/remove
      const res = await toggleWishlistApi(productId);
      const newStatus = res.isWishlisted !== undefined ? res.isWishlisted : !isWishlisted;
      setIsWishlisted(newStatus);
      setWishlistFeedback(newStatus ? 'saved' : 'removed');

      // Dispatch event to sync wishlist counters
      window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { productId, isWishlisted: newStatus } }));

      if (onWishlistChange) {
        onWishlistChange(productId, newStatus);
      }

      setTimeout(() => {
        setWishlistFeedback(null);
      }, 2000);
    } catch (err) {
      console.error('Wishlist error:', err);
      if (err?.response?.status === 401) {
        setWishlistError('Please log in to save to wishlist.');
      } else if (err?.response?.status === 409) {
        setIsWishlisted(true);
        setWishlistFeedback('saved');
      } else {
        setWishlistError('Unable to save product. Please try again.');
      }
      setTimeout(() => {
        setWishlistError('');
        setWishlistFeedback(null);
      }, 3000);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const catKey = product.category ? product.category.toLowerCase() : 'default';
  const fallbackImg = categoryFallbacks[catKey] || categoryFallbacks.default;

  const displayPrice = formatPriceRupees(product.price);
  const displayOriginalPrice = getOriginalPriceRupees(product);
  const displayDiscount = product.discount || '-30%';
  const displayRating = product.rating || (4.7 + ((product.name?.length || 0) % 4) * 0.1).toFixed(1);
  const displayReviews = product.reviews || ((product.stock || 12) * 6 + 18);

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-[#0d0f17]/90 rounded-2xl border border-red-950/40 hover:border-red-500/60 overflow-hidden transition-all duration-300 hover:shadow-[0_10px_30px_rgba(239,68,68,0.25)] flex flex-col cursor-pointer"
    >
      {/* Top Media Container */}
      <div className="relative aspect-square w-full bg-[#07080c] overflow-hidden flex items-center justify-center p-3">
        
        {/* Discount Badge in Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-extrabold bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.6)]">
            {displayDiscount}
          </span>
        </div>

        {/* Wishlist Button in Top Right */}
        <button
          onClick={handleWishlist}
          disabled={isWishlistLoading}
          title={
            isWishlistLoading
              ? "Saving..."
              : isWishlisted
              ? "♥ Remove from Wishlist"
              : "♡ Add to Wishlist"
          }
          className={`absolute top-3 right-3 z-10 py-1.5 px-2.5 rounded-full backdrop-blur-md border transition-all flex items-center gap-1.5 text-xs font-semibold ${
            isWishlisted
              ? "bg-red-950/85 border-red-500/60 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
              : "bg-black/60 hover:bg-red-950/80 border-white/10 hover:border-red-500/40 text-zinc-300 hover:text-red-400"
          } ${isWishlistLoading ? "opacity-80 cursor-wait" : "active:scale-95 cursor-pointer"}`}
        >
          {isWishlistLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
              <span className="text-[10px] text-zinc-200 hidden sm:inline">Saving...</span>
            </>
          ) : (
            <>
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  isWishlisted ? "fill-red-500 text-red-500 drop-shadow-[0_0_8px_#ef4444]" : "text-zinc-300"
                }`}
              />
              {wishlistFeedback === 'saved' && (
                <span className="text-[10px] text-red-300 font-bold hidden sm:inline animate-in fade-in">Added</span>
              )}
            </>
          )}
        </button>

        {/* Wishlist Error Feedback Notification */}
        {wishlistError && (
          <div className="absolute top-12 right-3 z-20 max-w-[190px] bg-red-950/95 border border-red-500/80 rounded-xl p-2 text-[10px] text-red-200 shadow-xl backdrop-blur-md flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
            <span>{wishlistError}</span>
          </div>
        )}

        {/* Ambient Red Glow behind product */}
        <div className="absolute inset-0 bg-radial from-red-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Product Image */}
        <img
          src={imgSrc || fallbackImg}
          alt={product.name}
          onError={() => setImgSrc(fallbackImg)}
          className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-110"
        />

        {/* View Details Hover Action Bar */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center justify-center gap-2">
          <button
            onClick={handleViewDetails}
            className="w-full py-2 px-3 rounded-xl bg-black/85 hover:bg-red-600 text-white text-xs font-semibold backdrop-blur-md border border-red-500/40 hover:border-red-500 flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-red-400 group-hover:text-white" />
            <span>View Details</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-grow justify-between bg-gradient-to-b from-[#0d0f17] to-[#090b10]">
        
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-bold tracking-wider text-red-400/90 uppercase truncate">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-amber-400 shrink-0">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="font-semibold text-zinc-300">{displayRating}</span>
              <span className="text-[10px] text-zinc-500 hidden sm:inline">({displayReviews})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-red-300 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>

        {/* Price & Action Row */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold text-white font-['Space_Grotesk',sans-serif]">
              {displayPrice}
            </span>
            {displayOriginalPrice && (
              <span className="text-[10px] sm:text-xs text-zinc-500 line-through">
                {displayOriginalPrice}
              </span>
            )}
          </div>

          <div className="relative">
            <button
              onClick={handleAdd}
              disabled={isAddingToCart}
              className={`p-2 sm:p-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                isAdded
                  ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : isAddingToCart
                  ? 'bg-red-900/80 text-white opacity-80 cursor-wait'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)] active:scale-95'
              }`}
              title="Add to Vault Cart"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-white" />
                  <span className="hidden sm:inline">Adding...</span>
                </>
              ) : isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Add</span>
                </>
              )}
            </button>

            {/* Cart Error Notification */}
            {cartError && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-red-950/95 border border-red-500/80 rounded-xl p-2 text-[10px] text-red-200 shadow-xl backdrop-blur-md flex items-start gap-1.5 z-30 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span>{cartError}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProductCard;
