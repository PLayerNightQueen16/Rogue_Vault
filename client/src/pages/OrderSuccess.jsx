import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { fetchOrderByIdApi } from '../services/api';
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

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const data = await fetchOrderByIdApi(id);
        if (data && data.order) {
          setOrder(data.order);
        } else {
          setError('Order details not found.');
        }
      } catch (err) {
        console.error('Failed to load order:', err);
        setError(err?.response?.data?.message || 'Failed to retrieve order confirmation details.');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-full bg-transparent text-white pb-16 flex flex-col justify-between">
        <div className="max-w-3xl mx-auto px-4 w-full flex-grow flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
          <p className="text-base text-zinc-300 font-medium tracking-wide">
            Loading order confirmation...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-full bg-transparent text-white pb-16 flex flex-col justify-between">
        <div className="max-w-3xl mx-auto px-4 w-full flex-grow flex items-center justify-center">
          <div className="bg-red-950/40 border border-red-500/50 rounded-3xl p-8 sm:p-12 text-center max-w-xl w-full backdrop-blur-xl shadow-[0_0_40px_rgba(239,68,68,0.2)]">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
            <p className="text-sm text-red-300 mb-6">{error || 'Unable to locate this order.'}</p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/orders"
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]"
              >
                View My Orders
              </Link>
              <Link
                to="/products"
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition-all"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const shipping = order.shippingAddress || {};
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-full bg-transparent text-white pb-16 flex flex-col justify-between">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
        
        {/* Success Header Box */}
        <div className="bg-gradient-to-b from-red-950/40 to-[#0d0f17]/90 border border-red-500/50 rounded-3xl p-6 sm:p-10 text-center backdrop-blur-xl shadow-[0_10px_50px_rgba(239,68,68,0.2)] mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-in zoom-in-75 duration-300">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>

          <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-red-400 block mb-1">
            PAYMENT CONFIRMED
          </span>
          <h1 className="text-2xl sm:text-4xl font-['Cinzel',serif] font-black tracking-wide text-white uppercase mb-2">
            Order Successfully Placed!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto">
            Thank you for shopping with ShopKart. Your transaction has been verified via Razorpay and your vault items are being prepared.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-zinc-300">
              Order ID: <strong className="text-red-400 font-mono font-bold">#{order._id}</strong>
            </div>
            <div className="bg-emerald-950/60 border border-emerald-500/40 px-4 py-2 rounded-xl text-emerald-400">
              Payment Status: <strong className="font-bold">{order.paymentStatus}</strong>
            </div>
            <div className="bg-red-950/60 border border-red-500/40 px-4 py-2 rounded-xl text-red-300">
              Order Status: <strong className="font-bold">{order.status}</strong>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Shipping & Payment Meta */}
          <div className="bg-[#0d0f17]/90 border border-red-950/50 rounded-3xl p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800 text-sm font-bold text-white font-['Cinzel',serif] uppercase">
              <Truck className="w-4 h-4 text-red-400" />
              <span>Delivery & Payment Info</span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-zinc-500 block text-[11px] uppercase font-semibold">Customer Details</span>
                <p className="text-white font-semibold">{shipping.fullName}</p>
                <p className="text-zinc-400">{shipping.phone}</p>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px] uppercase font-semibold">Shipping Address</span>
                <p className="text-zinc-300">
                  {shipping.addressLine1}, {shipping.city}, {shipping.state} - {shipping.pincode}
                </p>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px] uppercase font-semibold">Date & Time</span>
                <p className="text-zinc-300">{orderDate}</p>
              </div>

              {order.razorpayPaymentId && (
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase font-semibold">Razorpay Payment ID</span>
                  <p className="text-zinc-400 font-mono text-[11px]">{order.razorpayPaymentId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Purchased Items Snapshot */}
          <div className="bg-[#0d0f17]/90 border border-red-950/50 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-800 text-sm font-bold text-white font-['Cinzel',serif] uppercase mb-4">
                <Package className="w-4 h-4 text-red-400" />
                <span>Purchased Items Snapshot ({order.items?.length || 0})</span>
              </div>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-zinc-800/40">
                {(order.items || []).map((item, idx) => {
                  const fallbackImg = categoryFallbacks.default;
                  const itemPrice = typeof item.price === 'number' ? item.price : 0;
                  const itemQty = Number(item.quantity) || 1;

                  return (
                    <div key={idx} className="pt-3 first:pt-0 flex items-center gap-3">
                      <img
                        src={item.image || fallbackImg}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover bg-[#07080c] border border-zinc-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                        <p className="text-[11px] text-zinc-400">
                          {formatPriceRupees(itemPrice)} × {itemQty}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-zinc-200">
                        {formatPriceRupees(itemPrice * itemQty)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Footer */}
            <div className="pt-4 border-t border-zinc-800 mt-4 flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-zinc-400">Total Paid</span>
              <span className="text-2xl font-black text-red-400 font-['Space_Grotesk',sans-serif]">
                {formatPriceRupees(order.totalAmount)}
              </span>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/orders"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_35px_rgba(239,68,68,0.8)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <Package className="w-4 h-4" />
            <span>View All My Orders</span>
          </Link>

          <Link
            to="/products"
            className="w-full sm:w-auto px-8 py-4 bg-[#141722] hover:bg-zinc-800 text-zinc-200 hover:text-white border border-red-500/30 hover:border-red-500/60 text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <ShoppingBag className="w-4 h-4 text-red-400" />
            <span>Continue Shopping</span>
          </Link>
        </div>

      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default OrderSuccess;
