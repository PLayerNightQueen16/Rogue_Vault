import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, X } from 'lucide-react';

const AuthRequiredModal = ({ isOpen, message, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0d0f17]/95 border border-red-500/50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 text-center max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.3)] backdrop-blur-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-['Cinzel',serif]">
          Authentication Required
        </h3>
        <p className="text-xs sm:text-sm text-zinc-300 mb-6 max-w-sm mx-auto">
          {message || 'Please log in to your account to add items to your shopping cart.'}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Link
            to="/login"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredModal;
