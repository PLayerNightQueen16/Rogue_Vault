import React, { useState, useEffect } from 'react';
import { Timer, Zap, Sparkles, Copy, Check } from 'lucide-react';

function FlashVaultBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 15 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('ROUGE80');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNum = (n) => String(n).padStart(2, '0');

  return (
    <div id="deals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#170508] via-[#0d0914] to-[#170508] border border-red-500/40 p-6 sm:p-10 shadow-[0_0_40px_rgba(239,68,68,0.25)]">
        
        {/* Ambient Red Glow Beams */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
          
          {/* Left Text */}
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/50 text-red-400 text-xs font-bold tracking-wider uppercase">
              <Zap className="w-3.5 h-3.5 fill-red-400" />
              <span>Flash Vault Access</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-['Cinzel',serif] font-bold text-white tracking-wide">
              Unlock Extra 80% Off With Code
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Limited time VIP clearance across luxury streetwear, audio, and accessories.
            </p>
          </div>

          {/* Center Timer */}
          <div className="flex items-center gap-2 sm:gap-3 bg-black/60 border border-red-950/80 px-4 py-3 rounded-2xl backdrop-blur-md">
            <Timer className="w-5 h-5 text-red-500 animate-pulse" />
            <div className="flex items-center gap-1.5 font-['Space_Grotesk',monospace] font-bold text-lg sm:text-xl text-white">
              <span className="bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-900/50 text-red-300">
                {formatNum(timeLeft.hours)}h
              </span>
              <span className="text-red-500">:</span>
              <span className="bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-900/50 text-red-300">
                {formatNum(timeLeft.minutes)}m
              </span>
              <span className="text-red-500">:</span>
              <span className="bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-900/50 text-red-400 animate-pulse">
                {formatNum(timeLeft.seconds)}s
              </span>
            </div>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyCode}
              className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>COPIED: ROUGE80</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>CLAIM CODE: ROUGE80</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default FlashVaultBanner;
