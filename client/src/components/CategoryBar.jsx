import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  CATEGORY_ITEMS,
  CATEGORY_ICONS,
  CATEGORY_GROUPS,
  getMainCategory
} from '../constants/categories';

function CategoryBar({ onSelectCategory, selectedCategory = 'all' }) {
  const scrollContainerRef = useRef(null);

  const activeMainCategory = getMainCategory(selectedCategory);

  const handleCategoryClick = (catId) => {
    if (onSelectCategory) {
      if (selectedCategory && selectedCategory.toLowerCase() === catId.toLowerCase()) {
        onSelectCategory('all');
      } else {
        onSelectCategory(catId);
      }
    }
  };

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Floating Curved Pill Container */}
      <div className="relative bg-[#0d0f17]/90 backdrop-blur-xl border border-red-950/50 rounded-3xl p-3 sm:p-4 shadow-[0_10px_40px_rgba(0,0,0,0.85)] group">
        
        {/* Subtle Ambient Red Strip Glow */}
        <div className="absolute inset-x-12 -bottom-2 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent blur-sm" />

        {/* Scroll Left Button */}
        <button
          onClick={() => handleScroll('left')}
          aria-label="Scroll categories left"
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-red-950/90 border border-red-500/50 text-white items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-600 hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-80 hover:opacity-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scroll Right Button */}
        <button
          onClick={() => handleScroll('right')}
          aria-label="Scroll categories right"
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-red-950/90 border border-red-500/50 text-white items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-600 hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-80 hover:opacity-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Scrollable Categories List */}
        <div
          ref={scrollContainerRef}
          className="flex items-center justify-start gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth"
        >
          {CATEGORY_ITEMS.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id];
            const isSelected =
              Boolean(selectedCategory && selectedCategory.toLowerCase() === cat.id.toLowerCase()) ||
              Boolean(activeMainCategory && activeMainCategory.toLowerCase() === cat.id.toLowerCase());

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex flex-col items-center justify-center min-w-[76px] sm:min-w-[88px] py-2 px-2 rounded-2xl transition-all duration-300 group/btn cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-red-950/70 border border-red-500/70 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-105'
                    : 'bg-transparent border border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                }`}
              >
                {/* Icon Container with glowing red outline */}
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-b from-red-600/40 to-red-900/50 text-red-400 border border-red-500/70 shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                      : 'bg-[#141722]/80 group-hover/btn:bg-red-950/40 border border-zinc-800/80 group-hover/btn:border-red-900/60 text-red-500/80 group-hover/btn:text-red-400'
                  }`}
                >
                  {Icon && <Icon size={18} />}
                </div>

                {/* Category Label */}
                <span
                  className={`text-[10px] sm:text-[11px] font-medium tracking-wide mt-1.5 transition-colors whitespace-nowrap ${
                    isSelected ? 'text-white font-semibold' : 'text-zinc-400 group-hover/btn:text-zinc-200'
                  }`}
                >
                  {cat.label}
                </span>

                {/* Active Indicator Dot */}
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] mt-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Subcategories Selector Row when a main category is selected */}
        {activeMainCategory && CATEGORY_GROUPS[activeMainCategory] && (
          <div className="mt-3 pt-3 border-t border-red-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar px-1">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider shrink-0">
              Subcategories:
            </span>
            <button
              onClick={() => onSelectCategory && onSelectCategory(activeMainCategory)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory.toLowerCase() === activeMainCategory.toLowerCase()
                  ? 'bg-red-600/30 text-red-200 border border-red-500/60'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              All {activeMainCategory}
            </button>
            {CATEGORY_GROUPS[activeMainCategory].map((subSlug) => {
              const isSubSelected = selectedCategory.toLowerCase() === subSlug.toLowerCase();
              const subLabel = subSlug
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
              return (
                <button
                  key={subSlug}
                  onClick={() => onSelectCategory && onSelectCategory(subSlug)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isSubSelected
                      ? 'bg-red-600/30 text-red-200 border border-red-500/60'
                      : 'bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {subLabel}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default CategoryBar;
