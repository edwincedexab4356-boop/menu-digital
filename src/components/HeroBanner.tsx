import React from 'react';
import { Star, MapPin, Clock, Phone, Salad, Flame, CakeSlice, Sparkles } from 'lucide-react';
import { RestaurantData } from '../types';

interface HeroBannerProps {
  restaurant: RestaurantData;
  onExploreCategory: (category: 'entradas' | 'platos_fuertes' | 'postres') => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ restaurant, onExploreCategory }) => {
  return (
    <div className="relative bg-[#1c1917] text-stone-100 overflow-hidden border-b border-stone-800">
      {/* Background Image with Architectural Overlay */}
      <div className="absolute inset-0 z-0 opacity-20">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover object-center filter grayscale contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c1917] via-[#1c1917]/95 to-[#1c1917]/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-3xl">
          {/* Status & Rating Micro Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2" />
              Cocina Activa · Servicio en Sala
            </span>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold bg-stone-900 text-stone-200 border border-stone-700">
              <Star className="w-3.5 h-3.5 fill-[#d97706] text-[#d97706]" />
              <span className="font-bold text-white">{restaurant.rating}</span>
              <span className="text-stone-400">({restaurant.reviewsCount} comensales)</span>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-semibold bg-stone-900 text-[#fca5a5] border border-stone-800">
              Panamá
            </span>
          </div>

          {/* Main Title & Philosophy */}
          <h1 className="font-serif-title text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-3">
            Carta & Experiencia Gastronómica
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl mb-6 font-light">
            {restaurant.description}
          </p>

          {/* Key Info Micro Badges */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-300 mb-8 border-y border-stone-800/80 py-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#a83b24] shrink-0" />
              <span>{restaurant.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#a83b24] shrink-0" />
              <span>{restaurant.hours}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#a83b24] shrink-0" />
              <span className="font-mono text-stone-200">{restaurant.phone}</span>
            </div>
          </div>

          {/* Direct Category Shortcuts with clean vector icons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-stone-400 self-center mr-1 font-semibold">
              Secciones:
            </span>
            <button
              onClick={() => onExploreCategory('entradas')}
              className="px-3.5 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider bg-stone-900 hover:bg-[#a83b24] text-stone-200 hover:text-white border border-stone-700 hover:border-[#a83b24] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Salad className="w-3.5 h-3.5 text-[#a83b24] group-hover:text-white" />
              <span>Entradas</span>
            </button>
            <button
              onClick={() => onExploreCategory('platos_fuertes')}
              className="px-3.5 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider bg-stone-900 hover:bg-[#a83b24] text-stone-200 hover:text-white border border-stone-700 hover:border-[#a83b24] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-[#a83b24] group-hover:text-white" />
              <span>Platos Fuertes</span>
            </button>
            <button
              onClick={() => onExploreCategory('postres')}
              className="px-3.5 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider bg-stone-900 hover:bg-[#a83b24] text-stone-200 hover:text-white border border-stone-700 hover:border-[#a83b24] transition-all flex items-center gap-2 cursor-pointer"
            >
              <CakeSlice className="w-3.5 h-3.5 text-[#a83b24] group-hover:text-white" />
              <span>Postres</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
