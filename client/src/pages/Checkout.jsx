import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  ShoppingBag,
  ArrowLeft,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Truck,
  MapPin,
  User,
  Phone
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createPaymentOrderApi, verifyPaymentApi } from '../services/api';
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

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cart, totalUnits, subtotal, clearCart, loading: cartLoading } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setErrorMessage('');
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }

    const cleanPhone = formData.phone.trim().replace(/[\s\-()]/g, '');
    if (!cleanPhone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.addressLine1.trim()) {
      errors.addressLine1 = 'Address line is required';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      errors.pincode = 'Pincode must be exactly 6 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedPayment = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    if (!validateForm()) {
      return;
    }

    if (!cart || cart.length === 0) {
      setErrorMessage('Your cart is empty. Please add items to proceed.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    setProcessingStatus('Securing order and initializing Razorpay payment...');

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay payment gateway. Please check your internet connection.');
      }

      // 2. Call backend to create payment order
      const paymentOrderData = await createPaymentOrderApi({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim()
      });

      if (!paymentOrderData || !paymentOrderData.razorpayOrderId) {
        throw new Error(paymentOrderData?.message || 'Failed to initialize payment order on server.');
      }

      setProcessingStatus('Opening Razorpay Test Payment Modal...');

      // 3. Open Razorpay modal
      const options = {
        key: paymentOrderData.key,
        amount: paymentOrderData.amount,
        currency: paymentOrderData.currency || 'INR',
        name: 'ShopKart Vault',
        description: 'Test Mode Order Payment',
        order_id: paymentOrderData.razorpayOrderId,
        prefill: {
          name: formData.fullName.trim(),
          contact: formData.phone.trim()
        },
        theme: {
          color: '#dc2626'
        },
        handler: async (response) => {
          setProcessingStatus('Verifying payment signature with server...');
          try {
            const verificationResult = await verifyPaymentApi({
              shopKartOrderId: paymentOrderData.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verificationResult && verificationResult.success) {
              // Clear frontend cart only after server verification
              clearCart();
              navigate(`/order-success/${verificationResult.order._id || paymentOrderData.shopKartOrderId}`);
            } else {
              throw new Error(verificationResult?.message || 'Payment verification failed on server.');
            }
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr);
            setErrorMessage(
              verifyErr?.response?.data?.message || verifyErr.message || 'Payment verification failed.'
            );
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setProcessingStatus('');
            setErrorMessage('Payment was cancelled. Your cart remains saved.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setIsProcessing(false);
        setProcessingStatus('');
        setErrorMessage(
          resp.error?.description || 'Payment failed. Your cart has been preserved.'
        );
      });
      rzp.open();
    } catch (err) {
      console.error('Payment checkout error:', err);
      setIsProcessing(false);
      setProcessingStatus('');
      setErrorMessage(
        err?.response?.data?.message || err.message || 'An error occurred during checkout.'
      );
    }
  };

  // If cart is empty
  if (!cartLoading && (!cart || cart.length === 0)) {
    return (
      <div className="min-h-screen bg-[#050507] text-white pt-28 pb-16 flex flex-col justify-between">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex items-center justify-center">
          <div className="text-center py-20 bg-[#0d0f17]/90 border border-red-950/40 rounded-3xl p-8 sm:p-12 max-w-lg mx-auto backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <ShoppingBag className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-['Cinzel',serif] font-bold text-white mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto mb-6">
              You must have items in your cart before proceeding to checkout.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:brightness-110 transition-all cursor-pointer"
            >
              <span>Return to Shopping</span>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white pt-28 pb-16 flex flex-col justify-between">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-red-400" />
            <span>Back to Cart</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="text-zinc-500">Cart</span>
            <span>&gt;</span>
            <span className="text-red-400 font-bold">Checkout</span>
            <span>&gt;</span>
            <span className="text-zinc-500">Confirmation</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <p className="text-red-400 text-xs tracking-[0.25em] uppercase font-bold">
              SECURE CHECKOUT
            </p>
          </div>
          <h1 className="text-3xl sm:text-5xl font-['Cinzel',serif] font-black tracking-tight text-white uppercase flex items-center gap-3">
            <span>Payment & Shipping</span>
            <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" />
          </h1>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-8 bg-red-950/60 border border-red-500/80 rounded-2xl p-4 flex items-start gap-3 text-red-200 shadow-[0_0_25px_rgba(239,68,68,0.3)] animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-semibold">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Shipping Form */}
          <div className="lg:col-span-7 bg-[#0d0f17]/90 border border-red-950/50 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2 pb-4 mb-6 border-b border-zinc-800">
              <Truck className="w-5 h-5 text-red-400" />
              <h2 className="text-base sm:text-lg font-bold text-white font-['Cinzel',serif] uppercase tracking-wide">
                Shipping Address Details
              </h2>
            </div>

            <form onSubmit={handleProceedPayment} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-red-400" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Aarav Sharma"
                  className={`w-full bg-[#141722] text-sm text-white placeholder-zinc-500 px-4 py-3 rounded-xl border transition-all focus:outline-none ${
                    formErrors.fullName
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-zinc-800 focus:border-red-500/80'
                  }`}
                />
                {formErrors.fullName && (
                  <p className="text-[11px] text-red-400 mt-1 font-medium">{formErrors.fullName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-red-400" />
                  <span>Phone Number (10 Digits) *</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  className={`w-full bg-[#141722] text-sm text-white placeholder-zinc-500 px-4 py-3 rounded-xl border transition-all focus:outline-none ${
                    formErrors.phone
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-zinc-800 focus:border-red-500/80'
                  }`}
                />
                {formErrors.phone && (
                  <p className="text-[11px] text-red-400 mt-1 font-medium">{formErrors.phone}</p>
                )}
              </div>

              {/* Address Line */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>Address Line (Street, Flat/Building) *</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  placeholder="e.g. 22 MG Road, Residency Flat 4B"
                  className={`w-full bg-[#141722] text-sm text-white placeholder-zinc-500 px-4 py-3 rounded-xl border transition-all focus:outline-none ${
                    formErrors.addressLine1
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-zinc-800 focus:border-red-500/80'
                  }`}
                />
                {formErrors.addressLine1 && (
                  <p className="text-[11px] text-red-400 mt-1 font-medium">{formErrors.addressLine1}</p>
                )}
              </div>

              {/* City & State Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Bengaluru"
                    className={`w-full bg-[#141722] text-sm text-white placeholder-zinc-500 px-4 py-3 rounded-xl border transition-all focus:outline-none ${
                      formErrors.city
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-zinc-800 focus:border-red-500/80'
                    }`}
                  />
                  {formErrors.city && (
                    <p className="text-[11px] text-red-400 mt-1 font-medium">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Karnataka"
                    className={`w-full bg-[#141722] text-sm text-white placeholder-zinc-500 px-4 py-3 rounded-xl border transition-all focus:outline-none ${
                      formErrors.state
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-zinc-800 focus:border-red-500/80'
                    }`}
                  />
                  {formErrors.state && (
                    <p className="text-[11px] text-red-400 mt-1 font-medium">{formErrors.state}</p>
                  )}
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Pincode (6 Digits) *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  maxLength={6}
                  placeholder="e.g. 560001"
                  className={`w-full bg-[#141722] text-sm text-white placeholder-zinc-500 px-4 py-3 rounded-xl border transition-all focus:outline-none ${
                    formErrors.pincode
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-zinc-800 focus:border-red-500/80'
                  }`}
                />
                {formErrors.pincode && (
                  <p className="text-[11px] text-red-400 mt-1 font-medium">{formErrors.pincode}</p>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-6 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_35px_rgba(239,68,68,0.8)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{processingStatus || 'Processing Payment...'}</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Pay {formatPriceRupees(subtotal)} via Razorpay (Test Mode)</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Order Summary with Items Snapshot */}
          <div className="lg:col-span-5 bg-[#0d0f17]/95 border border-red-950/60 rounded-3xl p-6 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.7)] sticky top-28 space-y-6">
            <h2 className="text-base font-bold text-white font-['Cinzel',serif] uppercase tracking-wide pb-3 border-b border-zinc-800">
              Order Review ({totalUnits} Items)
            </h2>

            {/* Cart Items Quick List */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-zinc-800/40">
              {cart.map((item) => {
                const product = item.product || {};
                const catKey = product.category ? product.category.toLowerCase() : 'default';
                const fallbackImg = categoryFallbacks[catKey] || categoryFallbacks.default;
                const price = typeof product.price === 'number' ? product.price : 0;
                const qty = Number(item.quantity) || 1;

                return (
                  <div key={product._id || item._id} className="pt-3 first:pt-0 flex items-center gap-3">
                    <img
                      src={product.image || fallbackImg}
                      alt={product.name || 'Product'}
                      className="w-12 h-12 rounded-lg object-cover bg-[#07080c] border border-zinc-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{product.name || 'Product'}</p>
                      <p className="text-[11px] text-zinc-400">
                        {formatPriceRupees(price)} × {qty}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-zinc-200">
                      {formatPriceRupees(price * qty)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Summary Totals */}
            <div className="space-y-2.5 pt-4 border-t border-zinc-800 text-xs sm:text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Items Subtotal</span>
                <span className="text-white font-semibold">{formatPriceRupees(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span className="text-emerald-400 font-semibold">FREE (Vault Express)</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>GST / Taxes</span>
                <span className="text-zinc-300 font-semibold">Included</span>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white uppercase">Amount Payable</span>
                <span className="text-2xl font-black text-red-400 font-['Space_Grotesk',sans-serif]">
                  {formatPriceRupees(subtotal)}
                </span>
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="bg-[#141722]/80 border border-zinc-800 rounded-2xl p-4 space-y-2 text-[11px] text-zinc-400">
              <div className="flex items-center gap-2 text-white font-semibold">
                <ShieldCheck className="w-4 h-4 text-red-400 shrink-0" />
                <span>Razorpay Standard Test Checkout</span>
              </div>
              <p className="leading-relaxed">
                You will be redirected to the secure Razorpay Test Sandbox window to complete simulated UPI, NetBanking, or Card authorization.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default Checkout;
