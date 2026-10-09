import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Loader2,
  Plus,
  Minus,
  CheckCircle2,
  Package
} from 'lucide-react';
import { useCart } from '../context/CartContext';
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

const Cart = () => {
  const {
    cart,
    loading,
    error,
    totalUnits,
    subtotal,
    updateQuantity,
    removeFromCart,
    fetchCart
  } = useCart();

  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const handleQuantityChange = async (productId, newQty, maxStock) => {
    if (newQty < 1) return;
    if (typeof maxStock === 'number' && newQty > maxStock) {
      setActionError(`Cannot add more than ${maxStock} units (maximum stock available)`);
      setTimeout(() => setActionError(''), 3000);
      return;
    }

    try {
      setUpdatingId(productId);
      setActionError('');
      await updateQuantity(productId, newQty);
    } catch (err) {
      setActionError(err.message || 'Failed to update quantity');
      setTimeout(() => setActionError(''), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      setActionError('');
      await removeFromCart(productId);
    } catch (err) {
      setActionError(err.message || 'Failed to remove item');
      setTimeout(() => setActionError(''), 3000);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white pt-28 pb-16 flex flex-col justify-between">
      
      {/* Toast Error if any */}
      {actionError && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-950/95 border border-red-500/80 text-white px-5 py-3 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.4)] backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-xs font-semibold">{actionError}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <p className="text-red-400 text-xs tracking-[0.25em] uppercase font-bold">
              SHOPKART VAULT CART
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl font-['Cinzel',serif] font-black tracking-tight text-white uppercase flex items-center gap-3">
                <span>Shopping Cart</span>
                <ShoppingBag className="w-7 h-7 sm:w-9 sm:h-9 text-red-500" />
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                Review your items, adjust quantities, and proceed safely to our encrypted checkout.
              </p>
            </div>

            {!loading && !error && cart && cart.length > 0 && (
              <div className="text-xs font-semibold text-zinc-300 bg-white/5 border border-white/10 px-4 py-2 rounded-full self-start sm:self-auto">
                Total Units: <strong className="text-red-400">{totalUnits}</strong>
              </div>
            )}
          </div>
        </div>

        {/* 1. LOADING STATE */}
        {loading && (!cart || cart.length === 0) && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            <p className="text-sm sm:text-base text-zinc-300 font-medium tracking-wide">
              Loading your cart...
            </p>
          </div>
        )}

        {/* 2. ERROR STATE */}
        {error && (!cart || cart.length === 0) && (
          <div className="bg-red-950/40 border border-red-500/50 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-12 shadow-[0_0_40px_rgba(239,68,68,0.2)] backdrop-blur-xl">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Unable to load your cart.</h3>
            <p className="text-xs sm:text-sm text-red-300 font-medium mb-6">
              {error}
            </p>
            <button
              onClick={() => fetchCart()}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* 3. EMPTY CART STATE */}
        {!loading && (!cart || cart.length === 0) && !error && (
          <div className="text-center py-20 sm:py-28 bg-[#0d0f17]/80 border border-red-950/40 rounded-3xl p-8 sm:p-12 max-w-lg mx-auto my-8 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <div className="w-20 h-20 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center mx-auto mb-5 text-red-400 text-3xl">
              🛒
            </div>
            <h3 className="text-2xl font-['Cinzel',serif] font-bold text-white mb-2">
              Your cart is empty 🛒
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto mb-8 leading-relaxed">
              Looks like you haven't added anything yet. Explore our vault catalog to find exclusive products.
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

        {/* 4. CART CONTENT WITH ITEMS & SUMMARY */}
        {cart && cart.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cart.map((item) => {
                const product = item.product || {};
                const productId = product._id || product.id || item._id;
                const catKey = product.category ? product.category.toLowerCase() : 'default';
                const fallbackImg = categoryFallbacks[catKey] || categoryFallbacks.default;
                const price = typeof product.price === 'number' ? product.price : 0;
                const itemQuantity = Number(item.quantity) || 1;
                const itemTotal = price * itemQuantity;
                const stock = typeof product.stock === 'number' ? product.stock : 99;
                const isItemUpdating = updatingId === productId;
                const isItemRemoving = removingId === productId;

                return (
                  <div
                    key={productId}
                    className="bg-[#0d0f17]/90 border border-red-950/40 hover:border-red-900/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 backdrop-blur-xl transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                  >
                    {/* Item Image */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#07080c] shrink-0 border border-zinc-800/80">
                      <img
                        src={product.image || fallbackImg}
                        alt={product.name || 'Product'}
                        onError={(e) => {
                          e.currentTarget.src = fallbackImg;
                        }}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-red-400 uppercase">
                            {product.category || 'Vault Product'}
                          </span>
                          <Link
                            to={`/products/${productId}`}
                            className="block text-sm sm:text-base font-bold text-white hover:text-red-300 transition-colors truncate"
                          >
                            {product.name || 'Unnamed Item'}
                          </Link>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs text-zinc-400 block sm:inline">Price: </span>
                          <span className="text-sm font-semibold text-zinc-200">
                            {formatPriceRupees(price)}
                          </span>
                        </div>
                      </div>

                      {/* Stock Status */}
                      <div className="mt-1.5 flex items-center justify-center sm:justify-start gap-2">
                        {stock > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                            {stock <= 5 ? `Only ${stock} left in vault` : 'In Stock'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-red-400 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Controls and Subtotal */}
                      <div className="mt-4 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400 font-medium">Qty:</span>
                          <div className="inline-flex items-center bg-[#141722] border border-zinc-800 rounded-xl overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(productId, itemQuantity - 1, stock)}
                              disabled={itemQuantity <= 1 || isItemUpdating || isItemRemoving}
                              className="p-1.5 sm:p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition-colors cursor-pointer"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 py-1 text-xs font-bold text-white min-w-[32px] text-center">
                              {isItemUpdating ? (
                                <Loader2 className="w-3 h-3 animate-spin mx-auto text-red-400" />
                              ) : (
                                itemQuantity
                              )}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(productId, itemQuantity + 1, stock)}
                              disabled={itemQuantity >= stock || isItemUpdating || isItemRemoving}
                              className="p-1.5 sm:p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition-colors cursor-pointer"
                              title="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Item Subtotal */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] uppercase text-zinc-500 font-semibold block">Subtotal</span>
                            <span className="text-sm sm:text-base font-bold text-white font-['Space_Grotesk',sans-serif]">
                              {formatPriceRupees(itemTotal)}
                            </span>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemove(productId)}
                            disabled={isItemRemoving || isItemUpdating}
                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition-all border border-transparent hover:border-red-900/40 cursor-pointer disabled:opacity-40"
                            title="Remove from cart"
                          >
                            {isItemRemoving ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="lg:col-span-4 bg-[#0d0f17]/95 border border-red-950/60 rounded-3xl p-6 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.7)] sticky top-28 space-y-6">
              <h2 className="text-lg font-bold text-white font-['Cinzel',serif] uppercase tracking-wide pb-3 border-b border-zinc-800">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Total Items</span>
                  <span className="text-zinc-200 font-semibold">{totalUnits} units</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Cart Subtotal</span>
                  <span className="text-white font-semibold">{formatPriceRupees(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping & Handling</span>
                  <span className="text-emerald-400 font-semibold">FREE (Vault VIP)</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Taxes & Duties</span>
                  <span className="text-zinc-200 font-semibold">Included</span>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex justify-between items-baseline">
                  <span className="text-base font-bold text-white">Estimated Total</span>
                  <span className="text-2xl font-black text-white font-['Space_Grotesk',sans-serif] text-red-400">
                    {formatPriceRupees(subtotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 px-6 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_35px_rgba(239,68,68,0.8)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-zinc-800/80 space-y-2 text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Razorpay 256-Bit SSL Encrypted Test Mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-red-400 shrink-0" />
                  <span>30-Day Money Back Guarantee</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default Cart;
