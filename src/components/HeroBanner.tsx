import React from 'react';
import { Star, MapPin, Clock, Phone, Salad, Flame, CakeSlice, Sparkles, Utensils, Heart } from 'lucide-react';
import { RestaurantData } from '../types';

interface HeroBannerProps {
  restaurant: RestaurantData;
  onExploreCategory: (category: 'entradas' | 'platos_fuertes' | 'postres') => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ restaurant, onExploreCategory }) => {
  return (
    <div className="relative bg-gradient-to-b from-[#2a1d1a] via-[#1f1715] to-[#181211] text-stone-100 overflow-hidden border-b border-stone-800/80 shadow-inner">
      {/* Background Image with Gourmet Warm Overlay */}
      <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover object-center scale-105 filter blur-[0.5px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c1311] via-[#1c1311]/90 to-[#1c1311]/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14">
        <div className="max-w-3xl">
          {/* Status & Rating Micro Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
              Abierto · Servicio en Sala
            </span>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-stone-900/80 text-stone-200 border border-stone-700/80 backdrop-blur-xs">
              <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
              <span className="font-bold text-white">{restaurant.rating}</span>
              <span className="text-stone-400 text-[10px]">({restaurant.reviewsCount} opiniones)</span>
            </div>

            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-900/80 text-rose-300 border border-stone-800 backdrop-blur-xs">
              Ciudad de Panamá
            </span>
          </div>

          {/* Main Title & Philosophy */}
          <h1 className="font-serif-title text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.15] mb-3">
            {restaurant.name}
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl mb-6 font-normal">
            {restaurant.description || 'Heladería, dulcería y repostería artesanal. Disfruta de nuestra selecta carta de platillos, postres y bebidas recién preparadas para tu mesa.'}
          </p>

          {/* Key Info Micro Badges */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-stone-300 mb-6 py-3 border-y border-stone-800/80">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#e06547] shrink-0" />
              <span className="truncate max-w-xs">{restaurant.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#e06547] shrink-0" />
              <span>{restaurant.hours}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#e06547] shrink-0" />
              <span className="font-mono text-stone-200">{restaurant.phone}</span>
            </div>
          </div>

          {/* Direct Category Shortcuts with tactile pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-stone-400 self-center mr-1 font-semibold">
              Explorar:
            </span>
            <button
              onClick={() => onExploreCategory('entradas')}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-900/90 hover:bg-[#a83b24] text-stone-200 hover:text-white border border-stone-700/90 hover:border-[#a83b24] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Salad className="w-3.5 h-3.5 text-[#fca5a5]" />
              <span>Entradas</span>
            </button>
            <button
              onClick={() => onExploreCategory('platos_fuertes')}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-900/90 hover:bg-[#a83b24] text-stone-200 hover:text-white border border-stone-700/90 hover:border-[#a83b24] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 text-[#fca5a5]" />
              <span>Platos Fuertes</span>
            </button>
            <button
              onClick={() => onExploreCategory('postres')}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-900/90 hover:bg-[#a83b24] text-stone-200 hover:text-white border border-stone-700/90 hover:border-[#a83b24] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <CakeSlice className="w-3.5 h-3.5 text-[#fca5a5]" />
              <span>Postres</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
