import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Zap, 
  Flame, 
  Tag, 
  Sparkles, 
  TrendingDown, 
  SlidersHorizontal, 
  Search, 
  Loader2, 
  AlertTriangle,
  ArrowUpDown,
  ShoppingBag,
  Percent
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { fetchProducts, fetchWishlist } from '../services/api';
import { CATEGORY_GROUPS, CATEGORY_ICONS } from '../constants/categories';

const Deals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [minDiscount, setMinDiscount] = useState(0); // 0, 10, 15
  const [sortBy, setSortBy] = useState('biggest-discount'); // 'biggest-discount', 'price-low', 'price-high', 'rating'
  const [toastMessage, setToastMessage] = useState(null);

  // Sync wishlist items from server
  const loadUserWishlist = useCallback(async () => {
    try {
      const data = await fetchWishlist();
      if (data && Array.isArray(data.wishlist)) {
        const idSet = new Set(
          data.wishlist.map((item) => (item._id || item.id || item).toString())
        );
        setWishlistIds(idSet);
      }
    } catch {
      setWishlistIds(new Set());
    }
  }, []);

  useEffect(() => {
    loadUserWishlist();
  }, [loadUserWishlist]);

  // Listen to wishlist updates
  useEffect(() => {
    const handleWishlistUpdated = (e) => {
      if (e.detail && e.detail.productId) {
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (e.detail.isWishlisted) {
            next.add(e.detail.productId.toString());
          } else {
            next.delete(e.detail.productId.toString());
          }
          return next;
        });
      } else {
        loadUserWishlist();
      }
    };

    window.addEventListener('wishlist-updated', handleWishlistUpdated);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdated);
  }, [loadUserWishlist]);

  // Fetch all products and filter for genuine discounts
  const loadDeals = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchProducts();
      if (data && Array.isArray(data.products)) {
        // Genuine discount criteria:
        // Must have verified discountPercentage > 0 OR originalPrice > price
        const genuineDeals = data.products.filter((p) => {
          const hasPct = typeof p.discountPercentage === 'number' && p.discountPercentage > 0;
          const hasOrigPrice = typeof p.originalPrice === 'number' && p.originalPrice > p.price;
          return hasPct || hasOrigPrice;
        });
        setProducts(genuineDeals);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError('Unable to load current vault deals. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  // Handle toast notification on Add to Cart
  const handleAddToCart = (product) => {
    setToastMessage(`Added "${product.name}" to your Cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Filter and Sort Deals
  const filteredDeals = useMemo(() => {
    let list = [...products];

    // Category group filter
    if (selectedGroup !== 'all' && CATEGORY_GROUPS[selectedGroup]) {
      const allowedSubs = CATEGORY_GROUPS[selectedGroup].map((s) => s.toLowerCase());
      list = list.filter((p) => allowedSubs.includes((p.category || '').toLowerCase()));
    }

    // Min discount filter
    if (minDiscount > 0) {
      list = list.filter((p) => (p.discountPercentage || 0) >= minDiscount);
    }

    // Search query filter
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter((p) => {
        const titleMatch = (p.name || '').toLowerCase().includes(query);
        const descMatch = (p.description || '').toLowerCase().includes(query);
        const brandMatch = (p.brand || '').toLowerCase().includes(query);
        const catMatch = (p.category || '').toLowerCase().includes(query);
        return titleMatch || descMatch || brandMatch || catMatch;
      });
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'biggest-discount') {
        return (b.discountPercentage || 0) - (a.discountPercentage || 0);
      }
      if (sortBy === 'price-low') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortBy === 'price-high') {
        return (b.price || 0) - (a.price || 0);
      }
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });

    return list;
  }, [products, selectedGroup, minDiscount, searchQuery, sortBy]);

  // Deal statistics
  const stats = useMemo(() => {
    if (!products.length) return { total: 0, maxDiscount: 0, avgDiscount: 0 };
    const discounts = products.map((p) => p.discountPercentage || 0).filter((d) => d > 0);
    const max = discounts.length ? Math.max(...discounts) : 0;
    const avg = discounts.length ? Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length) : 0;
    return {
      total: products.length,
      maxDiscount: Math.round(max),
      avgDiscount: avg
    };
  }, [products]);

  return (
    <div className="min-h-full bg-transparent text-white pb-16 flex flex-col justify-between font-['Outfit',sans-serif]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12141e]/95 border border-red-500/80 text-white px-5 py-3 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.4)] backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <Sparkles className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
        
        {/* Page Hero Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <p className="text-red-400 text-xs tracking-[0.25em] uppercase font-bold">
              VERIFIED PRICE DROPS & PROMOTIONS
            </p>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-red-950/40">
            <div>
              <h1 className="text-3xl sm:text-5xl font-['Cinzel',serif] font-black tracking-tight text-white uppercase flex items-center gap-3">
                <span>THE DEAL VAULT</span>
                <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 fill-red-500/20 animate-pulse" />
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Explore confirmed price reductions across luxury streetwear, smart electronics, accessories, and vault collectibles. Every discount is calculated from genuine catalog pricing.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            {!loading && !error && products.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-red-950/40 border border-red-500/30 px-3.5 py-2 rounded-2xl flex items-center gap-2.5 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                  <Tag className="w-4 h-4 text-red-400" />
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block leading-none">Live Deals</span>
                    <span className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif]">{stats.total} Items</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-600/20 to-rose-600/20 border border-red-500/40 px-3.5 py-2 rounded-2xl flex items-center gap-2.5">
                  <Percent className="w-4 h-4 text-rose-400" />
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block leading-none">Max Discount</span>
                    <span className="text-sm font-bold text-red-400 font-['Space_Grotesk',sans-serif]">Up to {stats.maxDiscount}% Off</span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 px-3.5 py-2 rounded-2xl flex items-center gap-2.5">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block leading-none">Average Drop</span>
                    <span className="text-sm font-bold text-emerald-400 font-['Space_Grotesk',sans-serif]">~{stats.avgDiscount}% Off</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter & Sorting Controls */}
        <div className="space-y-4 mb-8">
          
          {/* Main Controls Row */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search deals by title, brand, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d0f17]/90 text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-red-950/60 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/50 outline-none transition-all placeholder:text-zinc-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort & Threshold Selectors */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              
              {/* Minimum Discount Badges */}
              <div className="flex items-center gap-1 bg-[#0d0f17] border border-red-950/60 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setMinDiscount(0)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    minDiscount === 0
                      ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All Deals
                </button>
                <button
                  onClick={() => setMinDiscount(10)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    minDiscount === 10
                      ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  10%+ Off
                </button>
                <button
                  onClick={() => setMinDiscount(15)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    minDiscount === 15
                      ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  15%+ Off
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 bg-[#0d0f17] border border-red-950/60 px-3 py-1.5 rounded-xl text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[11px] text-zinc-500 font-medium hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-zinc-200 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="biggest-discount" className="bg-[#0e1017] text-white">Biggest Discount</option>
                  <option value="price-low" className="bg-[#0e1017] text-white">Price: Low to High</option>
                  <option value="price-high" className="bg-[#0e1017] text-white">Price: High to Low</option>
                  <option value="rating" className="bg-[#0e1017] text-white">Top Customer Rating</option>
                </select>
              </div>

            </div>

          </div>

          {/* Category Group Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedGroup === 'all'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                  : 'bg-[#0d0f17]/80 text-zinc-400 hover:text-white border border-red-950/40 hover:border-red-500/40'
              }`}
            >
              All Categories
            </button>
            {Object.keys(CATEGORY_GROUPS).map((groupName) => {
              const Icon = CATEGORY_ICONS[groupName];
              const isSelected = selectedGroup === groupName;
              return (
                <button
                  key={groupName}
                  onClick={() => setSelectedGroup(groupName)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                      : 'bg-[#0d0f17]/80 text-zinc-400 hover:text-white border border-red-950/40 hover:border-red-500/40'
                  }`}
                >
                  {Icon && <Icon size={12} className={isSelected ? 'text-white' : 'text-red-400'} />}
                  <span>{groupName}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Results Count Summary */}
        {!loading && !error && (
          <div className="flex items-center justify-between mb-6 text-xs text-zinc-400">
            <span>
              Showing <strong className="text-white">{filteredDeals.length}</strong> verified vault {filteredDeals.length === 1 ? 'deal' : 'deals'}
              {selectedGroup !== 'all' && ` in ${selectedGroup}`}
              {minDiscount > 0 && ` (${minDiscount}%+ discount)`}
            </span>
            {(selectedGroup !== 'all' || minDiscount > 0 || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedGroup('all');
                  setMinDiscount(0);
                  setSearchQuery('');
                  setSortBy('biggest-discount');
                }}
                className="text-red-400 hover:text-red-300 font-semibold underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            <p className="text-sm sm:text-base text-zinc-300 font-medium tracking-wide">
              Scanning vault inventory for active price drops...
            </p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="bg-red-950/40 border border-red-500/50 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-12 shadow-[0_0_40px_rgba(239,68,68,0.2)] backdrop-blur-xl">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Failed to load deals</h3>
            <p className="text-xs sm:text-sm text-red-300 font-medium mb-6">{error}</p>
            <button
              onClick={loadDeals}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filteredDeals.length === 0 && (
          <div className="text-center py-20 bg-[#0d0f17]/80 border border-red-950/40 rounded-3xl p-8 sm:p-12 max-w-lg mx-auto my-8 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400">
              <Tag className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-['Cinzel',serif] font-bold text-white mb-2">
              No matching deals found
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto mb-6">
              Try adjusting your search criteria, clearing your discount filters, or browsing other vault categories.
            </p>
            <button
              onClick={() => {
                setSelectedGroup('all');
                setMinDiscount(0);
                setSearchQuery('');
                setSortBy('biggest-discount');
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:brightness-110 transition-all cursor-pointer"
            >
              <span>Reset Deal Filters</span>
            </button>
          </div>
        )}

        {/* DEALS PRODUCT GRID */}
        {!loading && !error && filteredDeals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredDeals.map((product) => {
              const productId = (product._id || product.id).toString();
              return (
                <ProductCard
                  key={productId}
                  product={product}
                  onAddToCart={handleAddToCart}
                  isWishlisted={wishlistIds.has(productId)}
                />
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

export default Deals;
