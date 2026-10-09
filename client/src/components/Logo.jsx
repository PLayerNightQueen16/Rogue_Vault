import React from 'react';
import { Link } from 'react-router-dom';
import logoArt from '../assets/logo_art.png';

/**
 * RØUGE VAULT Logo Component
 * Incorporates the glowing red shopping bag + stylized 'R' icon and luxury brand typography.
 */
function Logo({ size = 'default', showSubtitle = false, linkTo = '/' }) {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const content = (
    <div className="flex items-center gap-3 group cursor-pointer select-none">
      {/* Glow Bag Logo Icon */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Red Glow Filter */}
        <div className="absolute inset-0 bg-red-600/50 rounded-full blur-xl group-hover:bg-red-500/70 transition-all duration-300 scale-95 group-hover:scale-110" />

        {/* Large Circular Logo */}
        <div
          className={`relative overflow-hidden rounded-full border-2 border-red-500/60 bg-black shadow-[0_0_30px_rgba(239,68,68,0.65)] transition-transform duration-300 group-hover:scale-105 ${isSmall
              ? 'w-16 h-16'
              : isLarge
                ? 'w-[104px] h-[104px]'
                : 'w-[88px] h-[88px]'
            }`}
        >
          <img
            src={logoArt}
            alt="RØUGE VAULT Logo"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-center tracking-[0.22em] font-['Cinzel',serif] font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-100 via-white to-red-300 drop-shadow-[0_0_12px_rgba(239,68,68,0.65)] leading-tight transition-all duration-300 group-hover:from-white group-hover:to-red-400">
          <span className={`${isSmall ? 'text-sm' : isLarge ? 'text-2xl' : 'text-lg'}`}>
            RØUGE
          </span>
          <span className={`ml-1.5 text-red-500 font-extrabold ${isSmall ? 'text-xs' : isLarge ? 'text-xl' : 'text-base'}`}>
            VAULT
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[9px] tracking-[0.35em] text-red-400/80 uppercase font-sans font-medium -mt-0.5">
            Beyond Ordinary
          </span>
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} className="inline-block">{content}</Link>;
  }

  return content;
}

export default Logo;
