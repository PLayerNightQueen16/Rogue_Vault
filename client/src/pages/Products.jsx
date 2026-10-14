import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Filter, Sparkles, SlidersHorizontal, ArrowUpDown, X, Loader2, ShoppingBag } from "lucide-react";
import { fetchProducts, fetchWishlist } from "../services/api";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import {
  CATEGORY_ITEMS,
  CATEGORY_ICONS,
  CATEGORY_GROUPS,
  formatCategoryName,
  getMainCategory
} from "../constants/categories";

const CATEGORIES = CATEGORY_ITEMS;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "all";

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("default"); // 'default', 'price-low', 'price-high', 'name'
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  const activeMainCategory = getMainCategory(selectedCategory);

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
    } catch (err) {
      // User not logged in, ignore
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

    window.addEventListener("wishlist-updated", handleWishlistUpdated);
    return () => window.removeEventListener("wishlist-updated", handleWishlistUpdated);
  }, [loadUserWishlist]);

  // Sync state when URL params change (e.g. searching from Navbar)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "all";
    setSearch(urlSearch);
    setSelectedCategory(urlCategory);
  }, [searchParams]);

  const loadProducts = useCallback(async (searchTerm, categoryTerm) => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchProducts({
        search: searchTerm,
        category: categoryTerm === "all" ? "" : categoryTerm
      });

      if (data && data.products) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Something went wrong while loading products.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when search or category changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(search, selectedCategory);
    }, 250); // slight debounce for smooth typing

    return () => clearTimeout(timer);
  }, [search, selectedCategory, loadProducts]);

  // Update URL params
  const updateUrlParams = (newSearch, newCategory) => {
    const params = {};
    if (newSearch && newSearch.trim() !== "") {
      params.search = newSearch.trim();
    }
    if (newCategory && newCategory !== "all") {
      params.category = newCategory;
    }
    setSearchParams(params);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    updateUrlParams(value, selectedCategory);
  };

  const handleClearSearch = () => {
    setSearch("");
    updateUrlParams("", selectedCategory);
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    updateUrlParams(search, catId);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSortBy("default");
    setSearchParams({});
  };

  const handleAddToCart = (product) => {
    setToastMessage(`Added "${product.name}" to your Vault Cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sort products client-side
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price-low") {
      return (a.price || 0) - (b.price || 0);
    }
    if (sortBy === "price-high") {
      return (b.price || 0) - (a.price || 0);
    }
    if (sortBy === "name") {
      return (a.name || "").localeCompare(b.name || "");
    }
    return 0;
  });

  return (
    <div className="min-h-full bg-transparent text-white pb-16 flex flex-col justify-between">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12141e]/95 border border-red-500/80 text-white px-5 py-3 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.4)] backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <Sparkles className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <p className="text-red-400 text-xs tracking-[0.25em] uppercase font-bold">
              RØUGE VAULT INVENTORY
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl xs:text-3xl sm:text-5xl font-['Cinzel',serif] font-black tracking-tight text-white uppercase">
                Discover All Vault Pieces
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                Browse authentic luxury electronics, high-end fashion, accessories and collectibles priced in Rupees.
              </p>
            </div>

            {/* Total Results Count */}
            <div className="text-xs font-semibold text-zinc-400 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full self-start md:self-auto shrink-0">
              {loading ? (
                <span className="flex items-center gap-1.5 text-red-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching...
                </span>
              ) : (
                <span>Showing <strong className="text-white">{sortedProducts.length}</strong> products</span>
              )}
            </div>
          </div>
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="bg-[#0d0f17]/90 border border-red-950/50 rounded-2xl p-3 sm:p-5 mb-6 sm:mb-8 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-3 sm:space-y-4">
          
          <div className="flex flex-col md:flex-row items-center gap-2.5 sm:gap-3">
            {/* Search Input Box */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search products by name..."
                className="w-full bg-[#141722]/80 border border-red-950/60 rounded-xl pl-10 pr-9 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white rounded-full bg-zinc-800/80 transition-colors cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Dropdown Selector */}
            <div className="relative w-full md:w-56 shrink-0">
              <div className="flex items-center bg-[#141722]/80 border border-red-950/60 rounded-xl px-3 py-1.5">
                <Filter className="w-4 h-4 text-red-400 shrink-0 mr-2" />
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full bg-transparent text-xs text-zinc-200 py-1.5 focus:outline-none cursor-pointer"
                  aria-label="Filter by category"
                >
                  <option value="all" className="bg-[#12141e] text-white">All Categories</option>
                  {Object.keys(CATEGORY_GROUPS).map((groupName) => (
                    <optgroup key={groupName} label={groupName} className="bg-[#12141e] text-red-400 font-bold">
                      <option value={groupName} className="bg-[#12141e] text-white">
                        All {groupName}
                      </option>
                      {CATEGORY_GROUPS[groupName].map((subSlug) => (
                        <option key={subSlug} value={subSlug} className="bg-[#12141e] text-zinc-300">
                          &nbsp;&nbsp;{subSlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative w-full md:w-52 shrink-0">
              <div className="flex items-center bg-[#141722]/80 border border-red-950/60 rounded-xl px-3 py-1.5">
                <ArrowUpDown className="w-4 h-4 text-red-400 shrink-0 mr-2" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-transparent text-xs text-zinc-200 py-1.5 focus:outline-none cursor-pointer"
                  aria-label="Sort products"
                >
                  <option value="default" className="bg-[#12141e] text-white">Sort: Featured</option>
                  <option value="price-low" className="bg-[#12141e] text-white">Price: Low to High (₹)</option>
                  <option value="price-high" className="bg-[#12141e] text-white">Price: High to Low (₹)</option>
                  <option value="name" className="bg-[#12141e] text-white">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 touch-pan-x">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5 text-red-400" /> Filter:
            </span>
            <button
              onClick={() => handleCategorySelect("all")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                selectedCategory.toLowerCase() === "all"
                  ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)] border border-red-400'
                  : 'bg-[#181a26] text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id];
              const isSelected =
                Boolean(selectedCategory && selectedCategory.toLowerCase() === cat.id.toLowerCase()) ||
                Boolean(activeMainCategory && activeMainCategory.toLowerCase() === cat.id.toLowerCase());
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)] border border-red-400'
                      : 'bg-[#181a26] text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  {Icon && <Icon size={13} />}
                  <span>{cat.label}</span>
                </button>
              );
            })}

            {(search || selectedCategory !== 'all' || sortBy !== 'default') && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1 rounded-full text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40 transition-colors shrink-0 ml-auto cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Subcategory Pills when main category is selected */}
          {activeMainCategory && CATEGORY_GROUPS[activeMainCategory] && (
            <div className="pt-2 border-t border-zinc-800/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs touch-pan-x">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider shrink-0 mr-1">
                Subcategories:
              </span>
              <button
                onClick={() => handleCategorySelect(activeMainCategory)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCategory.toLowerCase() === activeMainCategory.toLowerCase()
                    ? 'bg-red-600/30 text-white border border-red-500/70 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                    : 'bg-[#141622] text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                All {activeMainCategory}
              </button>
              {CATEGORY_GROUPS[activeMainCategory].map((subSlug) => {
                const isSubSelected = selectedCategory.toLowerCase() === subSlug.toLowerCase();
                return (
                  <button
                    key={subSlug}
                    onClick={() => handleCategorySelect(subSlug)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      isSubSelected
                        ? 'bg-red-600/30 text-white border border-red-500/70 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                        : 'bg-[#141622] text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {subSlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                );
              })}
            </div>
          )}

        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            <p className="text-sm text-zinc-400">Loading products...</p>
          </div>
        )}

        {/* Error Notice */}
        {error && !loading && (
          <div className="bg-red-950/40 border border-red-500/50 rounded-2xl p-6 text-center max-w-lg mx-auto my-12">
            <p className="text-sm text-red-300 font-semibold">{error}</p>
            <button
              onClick={() => loadProducts(search, selectedCategory)}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sortedProducts.length === 0 && (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl p-8 max-w-lg mx-auto">
            <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No products found.</h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              No products matched your search {search ? `"${search}"` : ''} {selectedCategory !== 'all' ? `in ${formatCategoryName(selectedCategory)}` : ''}.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:brightness-110 transition-all cursor-pointer"
            >
              View All Products
            </button>
          </div>
        )}

        {/* Product Cards Grid */}
        {!loading && !error && sortedProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {sortedProducts.map((product) => {
              const pId = (product._id || product.id)?.toString();
              return (
                <ProductCard
                  key={pId}
                  product={product}
                  isWishlisted={wishlistIds.has(pId)}
                  onAddToCart={handleAddToCart}
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

export default Products;