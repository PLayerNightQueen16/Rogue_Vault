import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../axiosCalls/axios';
import Logo from '../components/Logo';
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await axiosInstance.post('/customers/register', form);
      setSuccessMsg('Account created successfully! Redirecting to login...');
      setForm({ fullName: '', email: '', password: '', phone: '' });

      setTimeout(() => {
        navigate('/login');
      }, 1500);
      console.log('User Registered!!');
    } catch (error) {
      console.log(error);
      setErrorMsg(error?.response?.data?.message || 'Registration failed. Please try again.');
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
            Join The Vault
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Unlock tier privileges, flash sales, and personal vault access.
          </p>
        </div>

        {/* Status Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300 tracking-wide flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-red-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Alexander Vance"
              required
              className="w-full px-4 py-3 bg-[#131622]/80 border border-red-950/60 rounded-xl text-white text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-zinc-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
            />
          </div>

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
              placeholder="vance@luxury.com"
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

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300 tracking-wide flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-red-400" />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 (555) 019-2834"
              className="w-full px-4 py-3 bg-[#131622]/80 border border-red-950/60 rounded-xl text-white text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-zinc-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
            />
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8)] hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating VIP Membership...' : 'Create Vault Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center pt-5 border-t border-zinc-900/80">
          <p className="text-xs text-zinc-400">
            Already have an account ?{' '}
            <Link
              to="/login"
              className="text-red-400 font-semibold cursor-pointer hover:text-red-300 hover:underline transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;