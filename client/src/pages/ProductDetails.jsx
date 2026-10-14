import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star, 
  Heart, 
  Check, 
  AlertTriangle,
  Loader2,
  Package,
  Layers,
  ChevronRight
} from "lucide-react";
import { fetchProductById, fetchWishlist, toggleWishlistApi } from "../services/api";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import { CATEGORY_FALLBACKS } from "../constants/categories";

function formatPriceRupees(price) {
  if (typeof price === "number") {
    return `₹${price.toLocaleString("en-IN")}`;
  }
  if (!price) return "₹0";
  const str = String(price).trim();
  if (str.startsWith("₹")) return str;
  const num = parseFloat(str.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? str : `₹${num.toLocaleString("en-IN")}`;
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateQuantity: updateCartQty } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [imgSrc, setImgSrc] = useState("");

  useEffect(() => {
    const loadProductAndWishlist = async () => {
      if (!id) {
        setLoading(false);
        setError("Invalid product ID");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await fetchProductById(id);
        const fetchedProduct = data?.product || data;

        if (fetchedProduct && (fetchedProduct._id || fetchedProduct.id || fetchedProduct.name)) {
          setProduct(fetchedProduct);
          setImgSrc(fetchedProduct.image || "");
          
          // Check if wishlisted
          try {
            const wishData = await fetchWishlist();
            if (wishData && Array.isArray(wishData.wishlist)) {
              const pId = fetchedProduct._id || fetchedProduct.id;
              const found = wishData.wishlist.some(
                (item) => (item._id || item.id || item) === pId
              );
              setIsWishlisted(found);
            }
          } catch (e) {
            // Not logged in, ignored
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        // If 404, product is not found (empty state)
        if (err?.response?.status === 404) {
          setProduct(null);
        } else {
          setError("Something went wrong while loading products.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProductAndWishlist();
  }, [id]);

  const handleWishlistToggle = async () => {
    if (isWishlistLoading || !product) return;
    const pId = product._id || product.id;
    if (!pId) return;

    setIsWishlistLoading(true);
    try {
      const res = await toggleWishlistApi(pId);
      const newStatus = res.isWishlisted !== undefined ? res.isWishlisted : !isWishlisted;
      setIsWishlisted(newStatus);
      setToastMessage(
        newStatus
          ? `Added "${product.name}" to your Wishlist!`
          : `Removed "${product.name}" from your Wishlist`
      );

      // Notify Navbar
      window.dispatchEvent(
        new CustomEvent("wishlist-updated", { detail: { productId: pId, isWishlisted: newStatus } })
      );

      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Wishlist toggle error:", err);
      if (err?.response?.status === 401) {
        setToastMessage("Please log in to save items to your wishlist.");
      } else {
        setToastMessage("Unable to save product. Please try again.");
      }
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;
    const pId = product._id || product.id;
    if (!pId) return;

    setIsAddingToCart(true);
    try {
      await addToCart(product, quantity);
      setIsAdded(true);
      setToastMessage(`Added ${quantity}x "${product.name}" to your Cart!`);
      setTimeout(() => {
        setIsAdded(false);
        setToastMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Add to cart error:", err);
      if (err?.isAuth || err?.response?.status === 401 || err?.status === 401) {
        setIsAdded(false);
      } else {
        setToastMessage(err.message || "Failed to add to cart");
        setTimeout(() => {
          setToastMessage(null);
        }, 3000);
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || isAddingToCart) return;
    const pId = product._id || product.id;
    if (!pId) return;

    setIsAddingToCart(true);
    try {
      await addToCart(product, quantity);
      navigate('/checkout');
    } catch (err) {
      console.error("Buy now error:", err);
      setIsAddingToCart(false);
      if (!(err?.isAuth || err?.response?.status === 401 || err?.status === 401)) {
        setToastMessage(err.message || "Failed to process checkout");
        setTimeout(() => {
          setToastMessage(null);
        }, 3000);
      }
    }
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncreaseQty = () => {
    const maxStock = typeof product?.stock === "number" ? product.stock : 99;
    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const catKey = product?.category ? product.category.toLowerCase() : "default";
  const fallbackImg = CATEGORY_FALLBACKS[catKey] || CATEGORY_FALLBACKS.default;

  const displayPrice = product ? formatPriceRupees(product.price) : "₹0";
  const numericPrice = typeof product?.price === "number"
    ? product.price
    : parseFloat(String(product?.price || 0).replace(/[^0-9.]/g, "")) || 0;
  const originalPrice = product?.originalPrice && product.originalPrice > numericPrice
    ? formatPriceRupees(product.originalPrice)
    : (product?.discountPercentage > 0 && numericPrice > 0
        ? formatPriceRupees(Math.round(numericPrice / (1 - (product.discountPercentage / 100))))
        : null);
  const stockCount = typeof product?.stock === "number" ? product.stock : 0;
  const inStock = stockCount > 0;

  return (
    <div className="min-h-full bg-transparent text-white pb-16 flex flex-col justify-between">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12141e]/95 border border-red-500/80 text-white px-5 py-3 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.4)] backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <Sparkles className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
        
        {/* Top Navigation / Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-red-400" />
            <span>Back to Products</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
            <Link to="/" className="hover:text-red-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <Link to="/products" className="hover:text-red-400 transition-colors">Products</Link>
            {product && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-zinc-200 truncate max-w-[200px]">{product.name}</span>
              </>
            )}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            <p className="text-base text-zinc-300 font-medium tracking-wide">
              Loading products...
            </p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="bg-red-950/40 border border-red-500/50 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-12 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Error Occurred</h3>
            <p className="text-sm text-red-300 font-semibold mb-6">
              Something went wrong while loading products.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer"
              >
                Retry
              </button>
              <Link
                to="/products"
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition-all"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && !product && (
          <div className="text-center py-24 bg-white/[0.02] border border-white/5 rounded-3xl p-8 sm:p-12 max-w-xl mx-auto my-12">
            <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              No products found.
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
              The product you are looking for might have been retired, moved, or is temporarily unavailable.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:brightness-110 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore All Products</span>
            </Link>
          </div>
        )}

        {/* PRODUCT DETAILS VIEW */}
        {!loading && !error && product && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Large Product Image Display */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#0a0c12] border border-red-950/60 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center justify-center p-6 group">
                
                {/* Background Ambient Glow */}
                <div className="absolute inset-0 bg-radial from-red-600/10 via-transparent to-transparent pointer-events-none" />

                {/* Category & Status Overlay Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-red-600/90 text-white shadow-[0_0_12px_rgba(239,68,68,0.6)] backdrop-blur-md">
                    {product.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-black/60 text-red-400 border border-red-500/30 backdrop-blur-md">
                    VAULT CERTIFIED
                  </span>
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  disabled={isWishlistLoading}
                  className={`absolute top-4 right-4 z-10 p-3 rounded-full backdrop-blur-md border transition-all active:scale-95 cursor-pointer ${
                    isWishlisted
                      ? "bg-red-950/80 border-red-500/60 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                      : "bg-black/60 hover:bg-red-950/80 text-zinc-300 hover:text-red-400 border-white/10 hover:border-red-500/40"
                  } ${isWishlistLoading ? "opacity-80 cursor-wait" : ""}`}
                  title={
                    isWishlistLoading
                      ? "Saving..."
                      : isWishlisted
                      ? "♥ Remove from Wishlist"
                      : "♡ Add to Wishlist"
                  }
                >
                  {isWishlistLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-red-400" />
                  ) : (
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        isWishlisted ? "fill-red-500 text-red-500 drop-shadow-[0_0_8px_#ef4444]" : "text-zinc-300"
                      }`}
                    />
                  )}
                </button>

                {/* Large Product Image */}
                <img
                  src={imgSrc || fallbackImg}
                  alt={product.name}
                  onError={() => setImgSrc(fallbackImg)}
                  className="w-full h-full object-cover object-center rounded-2xl transform transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Security & Service Guarantee Badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0d0f17]/90 border border-zinc-800/80 rounded-2xl p-3 text-center">
                  <ShieldCheck className="w-5 h-5 text-red-400 mx-auto mb-1.5" />
                  <p className="text-[11px] font-bold text-white">100% Authentic</p>
                  <p className="text-[9px] text-zinc-500">Vault Verified</p>
                </div>
                <div className="bg-[#0d0f17]/90 border border-zinc-800/80 rounded-2xl p-3 text-center">
                  <Truck className="w-5 h-5 text-red-400 mx-auto mb-1.5" />
                  <p className="text-[11px] font-bold text-white">Express Delivery</p>
                  <p className="text-[9px] text-zinc-500">All India Coverage</p>
                </div>
                <div className="bg-[#0d0f17]/90 border border-zinc-800/80 rounded-2xl p-3 text-center">
                  <RotateCcw className="w-5 h-5 text-red-400 mx-auto mb-1.5" />
                  <p className="text-[11px] font-bold text-white">Easy Returns</p>
                  <p className="text-[9px] text-zinc-500">30-Day Guarantee</p>
                </div>
              </div>
            </div>

            {/* Right Column: Product Meta, Details & Purchasing Actions */}
            <div className="lg:col-span-6 flex flex-col space-y-6">
              
              {/* Product Header */}
              <div className="space-y-3 pb-6 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                  <span className="text-xs uppercase font-bold tracking-[0.2em] text-red-400">
                    {product.category}
                  </span>
                  <div className="ml-auto flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>4.9</span>
                    <span className="text-zinc-500 font-normal">(128 reviews)</span>
                  </div>
                </div>

                {/* Product Name */}
                <h1 className="text-2xl sm:text-4xl font-['Cinzel',serif] font-black text-white tracking-wide uppercase leading-tight">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 pt-2">
                  <span className="text-3xl sm:text-4xl font-black text-white font-['Space_Grotesk',sans-serif]">
                    {displayPrice}
                  </span>
                  {originalPrice && (
                    <span className="text-base sm:text-lg text-zinc-500 line-through">
                      {originalPrice}
                    </span>
                  )}
                  {product?.discountPercentage > 0 && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-extrabold bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                      Save {Math.round(product.discountPercentage)}%
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">Inclusive of all taxes & import duties</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-red-400" /> Description
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed bg-[#0d0f17]/60 border border-zinc-800/60 rounded-2xl p-4">
                  {product.description || "No description provided for this product."}
                </p>
              </div>

              {/* Category & Stock Spec Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Category Meta */}
                <div className="bg-[#0d0f17]/90 border border-zinc-800/80 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Category
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {product.category || "Uncategorized"}
                  </span>
                </div>

                {/* Stock Status Meta */}
                <div className="bg-[#0d0f17]/90 border border-zinc-800/80 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Availability
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${inStock ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500"}`} />
                    <span className={`text-sm font-bold ${inStock ? "text-emerald-400" : "text-red-400"}`}>
                      {inStock ? `In Stock (${stockCount} units)` : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector & Add to Cart Action */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/80">
                
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Quantity:
                  </span>
                  <div className="inline-flex items-center bg-[#141722] border border-zinc-800 rounded-xl overflow-hidden">
                    <button
                      onClick={handleDecreaseQty}
                      disabled={quantity <= 1}
                      className="px-3.5 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-xs font-bold text-white min-w-[36px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncreaseQty}
                      disabled={!inStock || quantity >= stockCount}
                      className="px-3.5 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  {stockCount > 0 && stockCount <= 5 && (
                    <span className="text-[11px] font-semibold text-amber-400 animate-pulse">
                      Only {stockCount} left in vault!
                    </span>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className={`flex-1 py-4 px-6 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      isAdded
                        ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                        : inStock
                        ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_35px_rgba(239,68,68,0.7)] active:scale-[0.98]"
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={!inStock || isAddingToCart}
                    className="sm:w-44 py-4 px-6 rounded-2xl text-xs sm:text-sm font-bold bg-[#141722] hover:bg-zinc-800 text-white border border-red-500/40 hover:border-red-500 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
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

export default ProductDetails;
