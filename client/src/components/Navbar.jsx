import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, LogOut, Menu, X, Sparkles, Package } from 'lucide-react';
import Logo from './Logo';
import { axiosInstance } from '../axiosCalls/axios';
import { fetchWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

function Navbar({ wishlistCount: initialWishlistCount = 0 }) {
  const { totalUnits, clearCart, fetchCart: syncCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(initialWishlistCount);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync search input if URL has search param
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchFromUrl = queryParams.get('search');
    if (searchFromUrl !== null) {
      setSearchQuery(searchFromUrl);
    }
  }, [location.search]);

  // Fetch live wishlist count from API
  const syncWishlistCount = useCallback(async () => {
    try {
      const data = await fetchWishlist();
      if (data && typeof data.count === 'number') {
        setWishlistCount(data.count);
      } else if (data && Array.isArray(data.wishlist)) {
        setWishlistCount(data.wishlist.length);
      }
    } catch (err) {
      // User not logged in or backend error
      setWishlistCount(0);
    }
  }, []);

  // Fetch current customer and wishlist if logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axiosInstance.get('/customers/me');
        if (response.data && response.data.customerData) {
          setCurrentUser(response.data.customerData);
          syncWishlistCount();
          syncCart();
        } else {
          setCurrentUser(null);
          setWishlistCount(0);
        }
      } catch (err) {
        // Not logged in or backend offline
        setCurrentUser(null);
        setWishlistCount(0);
      }
    };
    checkAuth();
  }, [location.pathname, syncWishlistCount, syncCart]);

  // Listen to custom event for immediate updates without reload
  useEffect(() => {
    const handleWishlistUpdated = () => {
      syncWishlistCount();
    };
    window.addEventListener('wishlist-updated', handleWishlistUpdated);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdated);
  }, [syncWishlistCount]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/customers/logout');
    } catch (e) {
      console.log('Logout error', e);
    }
    clearCart();
    setCurrentUser(null);
    setWishlistCount(0);
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/products');
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: wishlistCount > 0 ? `Wishlist (${wishlistCount})` : 'Wishlist', path: '/wishlist' },
    { name: totalUnits > 0 ? `Cart (${totalUnits})` : 'Cart', path: '/cart' },
    ...(currentUser ? [{ name: 'Orders', path: '/orders' }] : []),
    { name: 'Categories', path: '/#categories' },
    { name: 'Deals', path: '/#deals' }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050507]/90 backdrop-blur-xl border-b border-red-950/40 shadow-[0_4px_30px_rgba(0,0,0,0.8)] py-3'
          : 'bg-gradient-to-b from-[#050507]/90 via-[#050507]/60 to-transparent backdrop-blur-md py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo on Left */}
          <Logo size="default" showSubtitle={false} />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path && !location.hash;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-3.5 py-1.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
                    isActive
                      ? 'text-white'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-red-500 to-rose-600 rounded-full shadow-[0_0_8px_#ef4444]" />
                  )}
                  <span className="absolute inset-0 rounded-lg bg-red-950/0 group-hover:bg-red-950/25 transition-colors -z-0" />
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Search */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Search Bar matching reference image with onSubmit */}
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 md:w-56 lg:w-64">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121218]/80 text-xs text-white placeholder-zinc-500 pl-9 pr-8 py-2 rounded-full border border-red-950/50 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/50 focus:outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-400 transition-colors"
                title="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  ×
                </button>
              )}
            </form>

            {/* Wishlist Icon Link */}
            <Link
              to="/wishlist"
              title="My Wishlist"
              className="relative p-2 text-zinc-300 hover:text-red-400 hover:bg-red-950/30 rounded-full transition-all border border-transparent hover:border-red-900/40"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 transition-transform active:scale-90" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Icon with Badge */}
            <Link
              to="/cart"
              title="Cart"
              className="relative p-2 text-zinc-300 hover:text-red-400 hover:bg-red-950/30 rounded-full transition-all border border-transparent hover:border-red-900/40"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 transition-transform active:scale-90" />
              {totalUnits > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-600 to-rose-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.9)] ring-2 ring-[#050507] animate-pulse">
                  {totalUnits}
                </span>
              )}
            </Link>

            {/* User Account / Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="p-2 text-zinc-300 hover:text-red-400 hover:bg-red-950/30 rounded-full transition-all border border-transparent hover:border-red-900/40 flex items-center gap-1.5"
                title="Account"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                {currentUser && (
                  <span className="hidden lg:inline text-xs font-semibold text-zinc-200 max-w-[80px] truncate">
                    {currentUser.fullName?.split(' ')[0]}
                  </span>
                )}
              </button>

              {/* Account Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#0e1017] border border-red-900/40 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.85)] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl">
                  {currentUser ? (
                    <div>
                      <div className="px-3 py-2 border-b border-zinc-800">
                        <p className="text-xs font-bold text-white">{currentUser.fullName}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{currentUser.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/cart"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-red-950/40 hover:text-white rounded-lg transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-red-400" />
                          <span>My Cart {totalUnits > 0 && `(${totalUnits})`}</span>
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-red-950/40 hover:text-white rounded-lg transition-colors"
                        >
                          <Package className="w-3.5 h-3.5 text-red-400" />
                          <span>My Orders</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-red-950/40 hover:text-white rounded-lg transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5 text-red-400" />
                          <span>My Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</span>
                        </Link>
                        <Link
                          to="/"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-red-950/40 hover:text-white rounded-lg transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-red-400" />
                          <span>My VIP Vault</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/50 hover:text-red-300 rounded-lg transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-1 space-y-1.5">
                      <Link
                        to="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block w-full py-2 px-3 text-center text-xs font-semibold bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg shadow-[0_0_12px_rgba(239,68,68,0.4)] hover:brightness-110 transition-all"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block w-full py-2 px-3 text-center text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-all"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-red-950/60 pb-2 space-y-2">
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121218] text-xs text-white placeholder-zinc-500 pl-9 pr-3.5 py-2.5 rounded-xl border border-red-950/60 focus:outline-none focus:border-red-500/80"
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-red-950/30 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}

      </div>
    </header>
  );
}

export default Navbar;