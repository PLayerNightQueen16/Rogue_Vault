import React, { useEffect, useState, useCallback } from 'react';
import { axiosInstance } from '../axiosCalls/axios';
import { fetchProducts, fetchWishlist } from '../services/api';
import HeroSection from '../components/HeroSection';
import CategoryBar from '../components/CategoryBar';
import TrendingSection from '../components/TrendingSection';
import FlashVaultBanner from '../components/FlashVaultBanner';
import Footer from '../components/Footer';
import { Sparkles, CheckCircle2 } from 'lucide-react';

function Home() {
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartCount, setCartCount] = useState(3);
  const [toastMessage, setToastMessage] = useState(null);

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
      setWishlistIds(new Set());
    }
  }, []);

  // Fetch current logged in customer
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axiosInstance.get('/customers/me');
        if (response.data && response.data.customerData) {
          setUser(response.data.customerData);
          loadUserWishlist();
        }
      } catch (err) {
        // Not logged in or guest
      }
    };
    getUser();
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

  // Fetch products based on selected category from backend
  const loadProducts = useCallback(async (cat) => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchProducts({
        category: cat === 'all' ? '' : cat
      });
      if (data && data.products) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching home products:', err);
      setError('Unable to load vault products from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(selectedCategory);
  }, [selectedCategory, loadProducts]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
  };

  const handleAddToCart = (product) => {
    setCartCount((prev) => prev + 1);
    setToastMessage(`Added "${product.name}" to your Vault Cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="relative min-h-screen text-white flex flex-col justify-between">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12141e]/95 border border-red-500/80 text-white px-5 py-3 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.4)] backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Welcome Banner if User is Authenticated */}
      {user && (
        <div className="pt-28 sm:pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-950/40 via-[#10131d]/60 to-red-950/40 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Welcome back, <span className="text-red-400">{user.fullName}</span>
                </h3>
                <p className="text-[11px] text-zinc-400">{user.email} • VIP Vault Access Active</p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider text-red-300 bg-red-600/20 px-3 py-1 rounded-full border border-red-500/30">
              Tier 1 Status
            </span>
          </div>
        </div>
      )}

      {/* Main Showcase Hero */}
      <HeroSection />

      {/* Floating Category Pills Bar */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Trending Products Grid connected to MongoDB backend */}
      <TrendingSection
        products={products}
        loading={loading}
        error={error}
        activeCategory={selectedCategory}
        wishlistIds={wishlistIds}
        onAddToCart={handleAddToCart}
      />

      {/* Flash Vault Limited Time Deals Banner */}
      <FlashVaultBanner />

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default Home;