import React from 'react';
import { Truck, ShieldCheck, RefreshCw, ChevronRight, Sparkles } from 'lucide-react';
import heroBanner from '../assets/hero_banner.jpg';

function HeroSection() {
  return (
    <section className="relative pt-4 sm:pt-6 md:pt-8 pb-16 md:pb-24 overflow-hidden">
      {/* Ambient Red Lighting Effects */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '7s' }} />
      <div className="absolute -bottom-20 left-10 w-96 h-96 bg-rose-700/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 z-10 text-center lg:text-left">
            
            {/* VIP Status Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-red-400 animate-spin" style={{ animationDuration: '10s' }} />
              <span className="text-[11px] font-bold tracking-[0.2em] text-red-300 uppercase">
                Exclusive Vault Drop • Up to 80% Off
              </span>
            </div>

            {/* Main Headline matching reference */}
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-['Cinzel',serif] font-black tracking-tight text-white uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                SHOP
              </h1>
              <div className="text-3xl sm:text-5xl xl:text-6xl font-['Cinzel',serif] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-red-600 drop-shadow-[0_0_35px_rgba(239,68,68,0.6)] uppercase">
                BEYOND ORDINARY
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-zinc-300 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
              Premium products. Unbeatable deals. Your style, your way.
            </p>

            {/* CTA Button matching reference image */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="#trending"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-bold text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(239,68,68,0.6)] hover:shadow-[0_0_40px_rgba(239,68,68,0.9)] hover:scale-105 active:scale-95 transition-all duration-500 overflow-hidden"
              >
                {/* Glow sheen animation */}
                <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1200 ease-out pointer-events-none" />
                <span className="relative z-10">SHOP NOW</span>
                <ChevronRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              <a
                href="#categories"
                className="px-6 py-3.5 rounded-full bg-[#121218]/80 hover:bg-[#1a1a24] text-zinc-300 hover:text-white border border-red-950/60 hover:border-red-500/40 text-xs font-semibold tracking-wider uppercase transition-all duration-300 backdrop-blur-md"
              >
                Explore Vault
              </a>
            </div>

            {/* Trust Badges row matching reference */}
            <div className="pt-8 border-t border-red-950/40 grid grid-cols-3 gap-2 sm:gap-4 text-left">
              
              {/* Badge 1: Free Shipping */}
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-red-950/40 border border-red-900/30 text-red-400 shrink-0">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">Free Shipping</h4>
                  <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">On orders over ₹499</p>
                </div>
              </div>

              {/* Badge 2: Secure Payment */}
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-red-950/40 border border-red-900/30 text-red-400 shrink-0">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">Secure Payment</h4>
                  <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">100% safe & secure</p>
                </div>
              </div>

              {/* Badge 3: Easy Returns */}
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-red-950/40 border border-red-900/30 text-red-400 shrink-0">
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">Easy Returns</h4>
                  <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">Hassle-free</p>
                </div>
              </div>

            </div>

          </div>

          {/* Right Hero Visual (Showcase Portal with Red Ring & Luxury Artifacts) */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* Glowing Neon Circular Ring */}
            <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
              
              {/* Outer Neon Glow */}
              <div className="absolute inset-4 rounded-full border-2 border-red-500/80 shadow-[0_0_60px_rgba(239,68,68,0.7),inset_0_0_40px_rgba(239,68,68,0.4)] animate-pulse" style={{ animationDuration: '6s' }} />
              
              {/* Secondary fine orbit ring */}
              <div className="absolute inset-0 rounded-full border border-red-400/20 scale-105 pointer-events-none" />

              {/* Floating Hero Composition Image */}
              <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden p-2 flex items-center justify-center group">
                <img
                  src={heroBanner}
                  alt="RØUGE VAULT Exclusive Collection"
                  className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] transform transition-transform duration-1000 group-hover:scale-105"
                />

                {/* Floating Interactive Product Tag 1 */}
                <div className="absolute top-1/4 left-4 bg-[#0a0c12]/90 border border-red-500/40 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.8)] hidden sm:flex items-center gap-2 animate-bounce" style={{ animationDuration: '5s' }}>
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Sneaker Drop</span>
                    <span className="text-xs font-bold text-white">-40% OFF</span>
                  </div>
                </div>

                {/* Floating Interactive Product Tag 2 */}
                <div className="absolute bottom-1/4 right-4 bg-[#0a0c12]/90 border border-red-500/40 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.8)] hidden sm:flex items-center gap-2 animate-bounce" style={{ animationDuration: '5.5s' }}>
                  <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Ceramic Watch</span>
                    <span className="text-xs font-bold text-white">VIP Edition</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroSection;
