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
    <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer select-none">
      {/* Glow Bag Logo Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        {/* Ambient Red Glow Filter */}
        <div className="absolute inset-0 bg-red-600/50 rounded-full blur-lg sm:blur-xl group-hover:bg-red-500/70 transition-all duration-300 scale-95 group-hover:scale-110" />

        {/* Circular Logo - Responsive sizes */}
        <div
          className={`relative overflow-hidden rounded-full border-2 border-red-500/60 bg-black shadow-[0_0_20px_rgba(239,68,68,0.5)] sm:shadow-[0_0_30px_rgba(239,68,68,0.65)] transition-transform duration-300 group-hover:scale-105 shrink-0 ${
            isSmall
              ? 'w-7 h-7 sm:w-8 sm:h-8'
              : isLarge
                ? 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20'
                : 'w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 md:w-12 md:h-12'
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
      <div className="flex flex-col min-w-0">
        <div className="flex items-center tracking-[0.16em] sm:tracking-[0.22em] font-['Cinzel',serif] font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-100 via-white to-red-300 drop-shadow-[0_0_12px_rgba(239,68,68,0.65)] leading-tight transition-all duration-300 group-hover:from-white group-hover:to-red-400">
          <span className={`${isSmall ? 'text-xs' : isLarge ? 'text-xl sm:text-2xl md:text-3xl' : 'text-sm xs:text-base sm:text-lg'}`}>
            RØUGE
          </span>
          <span className={`ml-1 sm:ml-1.5 text-red-500 font-extrabold ${isSmall ? 'text-[10px]' : isLarge ? 'text-lg sm:text-xl md:text-2xl' : 'text-xs xs:text-sm sm:text-base'}`}>
            VAULT
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[8px] sm:text-[9px] tracking-[0.28em] sm:tracking-[0.35em] text-red-400/80 uppercase font-sans font-medium -mt-0.5">
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
