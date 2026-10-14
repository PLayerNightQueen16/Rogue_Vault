import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../axiosCalls/axios';
import Logo from '../components/Logo';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToCart, fetchCart } = useCart();

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await axiosInstance.post('/customers/login', form);
      setForm({ email: '', password: '' });

      // Load authenticated cart
      await fetchCart();

      // Check if user had an intended add to cart action preserved
      const pendingRaw = sessionStorage.getItem('rouge_pending_cart_item');
      if (pendingRaw) {
        sessionStorage.removeItem('rouge_pending_cart_item');
        try {
          const pending = JSON.parse(pendingRaw);
          if (pending && pending.productId) {
            await addToCart(pending.product || pending.productId, pending.quantity || 1);
            navigate(pending.returnUrl || '/cart');
            return;
          }
        } catch (pendingErr) {
          console.warn('Failed to resume pending cart action:', pendingErr);
        }
      }

      navigate('/');
      console.log('User LoggedIn Successfully!!');
    } catch (error) {
      console.log(error);
      setErrorMsg(error?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-5 pb-16 relative overflow-hidden font-['Outfit',sans-serif]">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Glass Card */}
      <div className="w-full max-w-md bg-[#0d0f17]/90 backdrop-blur-2xl border border-red-950/60 hover:border-red-500/40 rounded-3xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] z-10 transition-all duration-300">
        
        {/* Header with Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="lg" showSubtitle={false} />
          
          <h2 className="text-2xl font-bold text-white mt-6 font-['Cinzel',serif] tracking-wide">
            Vault Access
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Enter your credentials to access exclusive drops & perks.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300 tracking-wide flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-red-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              className="w-full px-4 py-3 bg-[#131622]/80 border border-red-950/60 rounded-xl text-white text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-zinc-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300 tracking-wide flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-red-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-[#131622]/80 border border-red-950/60 rounded-xl text-white text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-zinc-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
            />
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8)] hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In To Vault'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center pt-5 border-t border-zinc-900/80">
          <p className="text-xs text-zinc-400">
            Don't have an Account ?{' '}
            <Link
              to="/register"
              className="text-red-400 font-semibold cursor-pointer hover:text-red-300 hover:underline transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;