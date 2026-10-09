import React from 'react';
import Logo from './Logo';
import { Mail, ArrowRight, ShieldCheck, Lock, Globe, Share2, MessageSquare } from 'lucide-react';

function Footer() {
  return (
    <footer id="about" className="relative mt-20 border-t border-red-950/60 bg-[#050507]/95 backdrop-blur-xl text-zinc-400 text-xs">
      
      {/* Red ambient top glow */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" showSubtitle={true} />
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mt-3">
              RØUGE VAULT is a premier luxury destination curating cutting-edge aesthetics, streetwear, high-performance audio, and rare horology with unmatched vault privileges.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#about" className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-500/50 transition-all" title="Global Network">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#about" className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-500/50 transition-all" title="Community Chat">
                <MessageSquare className="w-4 h-4" />
              </a>
              <a href="#about" className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-500/50 transition-all" title="Share">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold tracking-wider uppercase font-['Cinzel',serif]">Vault Collections</h4>
            <ul className="space-y-2">
              <li><a href="#trending" className="hover:text-red-400 transition-colors">Obsidian Apparel</a></li>
              <li><a href="#trending" className="hover:text-red-400 transition-colors">Crimson Footwear</a></li>
              <li><a href="#trending" className="hover:text-red-400 transition-colors">Audiophile Pro</a></li>
              <li><a href="#trending" className="hover:text-red-400 transition-colors">Horology & Timepieces</a></li>
              <li><a href="#trending" className="hover:text-red-400 transition-colors">Limited Edition Drops</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-white font-bold tracking-wider uppercase font-['Cinzel',serif]">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-red-400 transition-colors">VIP Concierge</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Order Tracking</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Authenticity Guarantee</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Return Policy</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div className="space-y-3">
            <h4 className="text-white font-bold tracking-wider uppercase font-['Cinzel',serif]">VIP Access</h4>
            <p className="text-zinc-400 text-xs">
              Subscribe for private vault drops and surprise discount codes.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Enter email..."
                className="w-full bg-[#121218] border border-red-950/60 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/80"
              />
              <button
                className="p-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)] hover:scale-105 transition-all"
                title="Subscribe"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
              <span>Encrypted & 100% Private</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          <p>© {new Date().getFullYear()} RØUGE VAULT Inc. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-red-500" />
            <span>Secured with 256-bit Vault Encryption</span>
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
