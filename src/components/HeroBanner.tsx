import React from 'react';
import { Star, MapPin, Clock, Phone, Salad, Flame, CakeSlice, Sparkles, Utensils, Heart } from 'lucide-react';
import { RestaurantData } from '../types';
import { getCategoryPhoto } from '../utils/productImages';

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Info Column */}
          <div className="lg:col-span-8">
            {/* Status & Rating Micro Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
                Abierto · Carta en Línea
              </span>

              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-stone-900/80 text-stone-200 border border-stone-700/80 backdrop-blur-xs">
                <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                <span className="font-bold text-white">{restaurant.rating}</span>
                <span className="text-stone-400 text-[10px]">({restaurant.reviewsCount} opiniones)</span>
              </div>

              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-900/80 text-rose-300 border border-stone-800 backdrop-blur-xs">
                Gourmet
              </span>
            </div>

            {/* Main Title & Philosophy */}
            <h1 className="font-serif-title text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.15] mb-3">
              {restaurant.name}
            </h1>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl mb-6 font-normal">
              {restaurant.description || 'Catálogo y menú digital interactivo. Descubre nuestra cuidada selección culinaria con fotografía en alta resolución y precios en tiempo real.'}
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

            {/* Direct Category Shortcuts with tactile photo pills */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs uppercase tracking-wider text-stone-400 self-center mr-1 font-semibold">
                Explorar:
              </span>
              <button
                onClick={() => onExploreCategory('entradas')}
                className="pl-1.5 pr-3.5 py-1 rounded-full text-xs font-semibold bg-stone-900/90 hover:bg-[#a83b24] text-stone-200 hover:text-white border border-stone-700/90 hover:border-[#a83b24] transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden border border-stone-600 shrink-0">
                  <img src={getCategoryPhoto('entradas')} alt="Entradas" className="w-full h-full object-cover" />
                </div>
                <span>Entradas</span>
              </button>
              <button
                onClick={() => onExploreCategory('platos_fuertes')}
                className="pl-1.5 pr-3.5 py-1 rounded-full text-xs font-semibold bg-stone-900/90 hover:bg-[#a83b24] text-stone-200 hover:text-white border border-stone-700/90 hover:border-[#a83b24] transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden border border-stone-600 shrink-0">
                  <img src={getCategoryPhoto('platos_fuertes')} alt="Platos Fuertes" className="w-full h-full object-cover" />
                </div>
                <span>Platos Fuertes</span>
              </button>
              <button
                onClick={() => onExploreCategory('postres')}
                className="pl-1.5 pr-3.5 py-1 rounded-full text-xs font-semibold bg-stone-900/90 hover:bg-[#a83b24] text-stone-200 hover:text-white border border-stone-700/90 hover:border-[#a83b24] transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden border border-stone-600 shrink-0">
                  <img src={getCategoryPhoto('postres')} alt="Postres" className="w-full h-full object-cover" />
                </div>
                <span>Postres</span>
              </button>
            </div>
          </div>

          {/* Right Showcase Card: Featured Photos Preview */}
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-3">
            <div className="p-4 bg-stone-900/80 border border-stone-700/80 rounded-sm backdrop-blur-md shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="text-[11px] uppercase tracking-widest font-bold text-[#e06547] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Especialidades Recomendadas
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Alta Cocina</span>
              </div>

              {/* 3 Featured visual previews */}
              <div className="space-y-2.5">
                <div 
                  onClick={() => onExploreCategory('entradas')}
                  className="flex items-center gap-3 p-2 rounded-xs bg-stone-800/60 hover:bg-stone-800 border border-stone-700/40 transition-colors cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80" 
                    alt="Carpaccio Trufado" 
                    className="w-12 h-12 rounded-xs object-cover border border-stone-700 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate group-hover:text-[#e06547] transition-colors">Carpaccio de Res Trufado</p>
                    <p className="text-[10px] text-stone-400">Entrada · Trufa negra & parmesano</p>
                  </div>
                  <span className="text-xs font-bold text-stone-200">$16.50</span>
                </div>

                <div 
                  onClick={() => onExploreCategory('platos_fuertes')}
                  className="flex items-center gap-3 p-2 rounded-xs bg-stone-800/60 hover:bg-stone-800 border border-stone-700/40 transition-colors cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=200&q=80" 
                    alt="Ojo de Bife Angus" 
                    className="w-12 h-12 rounded-xs object-cover border border-stone-700 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate group-hover:text-[#e06547] transition-colors">Ojo de Bife Angus 45D</p>
                    <p className="text-[10px] text-stone-400">Plato Fuerte · Brasa de encina</p>
                  </div>
                  <span className="text-xs font-bold text-stone-200">$29.50</span>
                </div>

                <div 
                  onClick={() => onExploreCategory('postres')}
                  className="flex items-center gap-3 p-2 rounded-xs bg-stone-800/60 hover:bg-stone-800 border border-stone-700/40 transition-colors cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=200&q=80" 
                    alt="Tarta de Queso Fluida" 
                    className="w-12 h-12 rounded-xs object-cover border border-stone-700 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate group-hover:text-[#e06547] transition-colors">Tarta de Queso Donostia</p>
                    <p className="text-[10px] text-stone-400">Postre · Corazón fundente</p>
                  </div>
                  <span className="text-xs font-bold text-stone-200">$8.50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
