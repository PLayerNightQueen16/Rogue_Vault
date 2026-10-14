import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Loader2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { fetchOrdersApi } from '../services/api';
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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthError, setIsAuthError] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setIsAuthError(false);

      const data = await fetchOrdersApi();
      if (data && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err?.response?.status === 401) {
        setIsAuthError(true);
        setError('Please sign in to view your order history.');
      } else {
        setError('Unable to load your orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="min-h-full bg-transparent text-white pb-16 flex flex-col justify-between">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <p className="text-red-400 text-xs tracking-[0.25em] uppercase font-bold">
              PURCHASE HISTORY
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl font-['Cinzel',serif] font-black tracking-tight text-white uppercase flex items-center gap-3">
                <span>My Orders</span>
                <Package className="w-7 h-7 sm:w-9 sm:h-9 text-red-500" />
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                View your confirmed orders, historical price snapshots, and real-time delivery status.
              </p>
            </div>

            {!loading && !error && orders.length > 0 && (
              <div className="text-xs font-semibold text-zinc-300 bg-white/5 border border-white/10 px-4 py-2 rounded-full self-start sm:self-auto">
                Total Orders: <strong className="text-red-400">{orders.length}</strong>
              </div>
            )}
          </div>
        </div>

        {/* 1. LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            <p className="text-sm sm:text-base text-zinc-300 font-medium tracking-wide">
              Loading your orders...
            </p>
          </div>
        )}

        {/* 2. ERROR / AUTH STATE */}
        {error && !loading && (
          <div className="bg-red-950/40 border border-red-500/50 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-12 shadow-[0_0_40px_rgba(239,68,68,0.2)] backdrop-blur-xl">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {isAuthError ? 'Authentication Required' : 'Something went wrong'}
            </h3>
            <p className="text-xs sm:text-sm text-red-300 font-medium mb-6">
              {error}
            </p>
            {isAuthError ? (
              <Link
                to="/login"
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:brightness-110 transition-all inline-block"
              >
                Sign In to View Orders
              </Link>
            ) : (
              <button
                onClick={loadOrders}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer"
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-20 sm:py-28 bg-[#0d0f17]/80 border border-red-950/40 rounded-3xl p-8 sm:p-12 max-w-lg mx-auto my-8 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <div className="w-20 h-20 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center mx-auto mb-5 text-red-400">
              <Package className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-2xl font-['Cinzel',serif] font-bold text-white mb-2">
              No orders placed yet
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto mb-8 leading-relaxed">
              When you purchase items through our secure Razorpay checkout, your order history and receipt snapshots will appear here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_35px_rgba(239,68,68,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Start Shopping</span>
            </Link>
          </div>
        )}

        {/* 4. ORDERS LIST */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              const isPaid = order.paymentStatus === 'PAID';
              const shipping = order.shippingAddress || {};

              return (
                <div
                  key={order._id}
                  className="bg-[#0d0f17]/90 border border-red-950/50 hover:border-red-900/70 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] transition-all"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-red-400">
                          Order #{order._id}
                        </span>
                        <span className="text-xs text-zinc-500">•</span>
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          {orderDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                      {/* Payment Status Pill */}
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${
                          isPaid
                            ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400'
                            : 'bg-amber-950/80 border border-amber-500/40 text-amber-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isPaid ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-amber-400'
                          }`}
                        />
                        {order.paymentStatus || 'PENDING'}
                      </span>

                      {/* Order Status Pill */}
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-red-950/80 border border-red-500/40 text-red-300">
                        {order.status || 'PLACED'}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Grid / List */}
                  <div className="py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(order.items || []).map((item, idx) => {
                      const fallbackImg = categoryFallbacks.default;
                      const itemPrice = typeof item.price === 'number' ? item.price : 0;
                      const itemQty = Number(item.quantity) || 1;

                      return (
                        <div
                          key={idx}
                          className="bg-[#141722]/80 border border-zinc-800/80 rounded-2xl p-3 flex items-center gap-3"
                        >
                          <img
                            src={item.image || fallbackImg}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover bg-[#07080c] border border-zinc-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-white truncate">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              Snapshot: {formatPriceRupees(itemPrice)} × {itemQty}
                            </p>
                            <p className="text-xs font-bold text-red-400 mt-1 font-['Space_Grotesk',sans-serif]">
                              {formatPriceRupees(itemPrice * itemQty)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Card Footer */}
                  <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="truncate max-w-md">
                        Shipping to: <strong className="text-zinc-200">{shipping.fullName}</strong> ({shipping.city}, {shipping.state})
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Total Amount</span>
                        <span className="text-lg sm:text-xl font-black text-white font-['Space_Grotesk',sans-serif]">
                          {formatPriceRupees(order.totalAmount)}
                        </span>
                      </div>

                      <Link
                        to={`/order-success/${order._id}`}
                        className="px-4 py-2 bg-[#141722] hover:bg-zinc-800 border border-red-500/30 hover:border-red-500/60 text-xs font-semibold text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>View Receipt</span>
                        <ChevronRight className="w-3.5 h-3.5 text-red-400" />
                      </Link>
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

export default Orders;
