import React from 'react';
import { 
  Sparkles, 
  Shirt, 
  Footprints, 
  ShoppingBag, 
  Flame, 
  Headphones, 
  Armchair, 
  Dumbbell, 
  BookOpen
} from 'lucide-react';

function CategoryBar({ onSelectCategory, selectedCategory = 'all' }) {
  const categories = [
    { id: 'all', name: 'All Products', icon: '🌟', svgIcon: Sparkles },
    { id: 'Electronics', name: 'Electronics', icon: '🎧', svgIcon: Headphones },
    { id: 'Fashion', name: 'Fashion', icon: '👕', svgIcon: Shirt },
    { id: 'Home', name: 'Home & Living', icon: '🛋️', svgIcon: Armchair },
    { id: 'Accessories', name: 'Accessories', icon: '👜', svgIcon: ShoppingBag },
    { id: 'Books', name: 'Books', icon: '📚', svgIcon: BookOpen },
    { id: 'Footwear', name: 'Footwear', icon: '👟', svgIcon: Footprints },
    { id: 'Beauty', name: 'Beauty', icon: '💄', svgIcon: Flame }
  ];

  const handleCategoryClick = (catId) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  return (
    <div id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Floating Curved Pill Container */}
      <div className="relative bg-[#0d0f17]/80 backdrop-blur-xl border border-red-950/50 rounded-3xl p-3 sm:p-4 shadow-[0_10px_40px_rgba(0,0,0,0.85)]">
        
        {/* Subtle Ambient Red Strip Glow */}
        <div className="absolute inset-x-12 -bottom-2 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent blur-sm" />

        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-1 px-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex flex-col items-center justify-center min-w-[76px] sm:min-w-[88px] py-2.5 px-2 rounded-2xl transition-all duration-300 group cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-red-950/60 border border-red-500/60 text-white shadow-[0_0_20px_rgba(239,68,68,0.35)] scale-105'
                    : 'bg-transparent border border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]'
                }`}
              >
                {/* Icon Container with glowing red outline */}
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-b from-red-600/30 to-red-900/40 text-red-400 border border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                    : 'bg-[#141722]/70 group-hover:bg-red-950/30 border border-zinc-800/80 group-hover:border-red-900/50 text-red-500/80 group-hover:text-red-400'
                }`}>
                  {cat.svgIcon ? (
                    <cat.svgIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <span className="text-base">{cat.icon}</span>
                  )}
                </div>

                {/* Category Label */}
                <span className={`text-[11px] sm:text-xs font-medium tracking-wide mt-2 transition-colors whitespace-nowrap ${
                  isSelected ? 'text-white font-semibold' : 'text-zinc-400 group-hover:text-zinc-200'
                }`}>
                  {cat.name}
                </span>

                {/* Active Indicator Dot */}
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CategoryBar;
