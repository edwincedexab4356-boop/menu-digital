import React, { useState } from 'react';
import { Plus, Check, Clock, Flame, Star, Eye, Utensils } from 'lucide-react';
import { MenuItem } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  currency: string;
  onSelect: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem, event?: React.MouseEvent) => void;
  viewMode: 'grid' | 'list';
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  currency,
  onSelect,
  onAddToCart,
  viewMode,
}) => {
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.available) return;
    onAddToCart(item, e);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const formatCategoryLabel = (cat: string) => {
    if (cat === 'entradas') return 'Entrada';
    if (cat === 'platos_fuertes') return 'Plato Fuerte';
    if (cat === 'postres') return 'Postre';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const getTagBadgeClass = (tag: string) => {
    switch (tag) {
      case 'Chef':
        return 'bg-[#a83b24] text-white border-[#a83b24]';
      case 'Popular':
        return 'bg-stone-900 text-white border-stone-900';
      case 'Nuevo':
        return 'bg-emerald-700 text-white border-emerald-700';
      case 'Vegetariano':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Sin Gluten':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Pescado Fresco':
        return 'bg-cyan-50 text-cyan-800 border-cyan-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        id={`menu-item-${item.id}`}
        onClick={() => onSelect(item)}
        className={`group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 bg-white hover:bg-stone-50/80 rounded-sm border transition-all duration-150 cursor-pointer shadow-xs gap-4 ${
          item.available ? 'border-stone-200 hover:border-stone-400' : 'border-stone-200 opacity-80'
        }`}
      >
        {/* Left: Thumbnail & Details */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xs overflow-hidden shrink-0 bg-stone-100 border border-stone-200 flex items-center justify-center">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-2 text-stone-400 text-center">
                <Utensils className="w-7 h-7 mb-1 opacity-60" />
                <span className="text-[9px] uppercase font-bold text-stone-400">Sin foto</span>
              </div>
            )}
            {item.tags?.includes('Chef') && (
              <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded-xs text-[9px] font-bold uppercase tracking-wider bg-[#a83b24] text-white shadow-xs">
                Chef
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-[#a83b24] font-bold">
                {formatCategoryLabel(item.category)}
              </span>
              <span className="text-stone-300 text-xs">•</span>
              {/* Estado disponible / no disponible */}
              <span
                className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-xs border ${
                  item.available
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-stone-100 text-stone-600 border-stone-300'
                }`}
              >
                {item.available ? 'Disponible' : 'No disponible'}
              </span>
              {item.prepTime && (
                <>
                  <span className="text-stone-300 text-xs">•</span>
                  <span className="flex items-center text-[11px] text-stone-500 font-medium">
                    <Clock className="w-3 h-3 mr-1 text-stone-400" />
                    {item.prepTime}
                  </span>
                </>
              )}
            </div>

            <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#a83b24] transition-colors truncate">
              {item.name}
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 mt-0.5 leading-relaxed">
              {item.description}
            </p>

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-xs border ${getTagBadgeClass(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Price & Actions */}
        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center border-t sm:border-t-0 border-stone-200 pt-2 sm:pt-0 shrink-0 gap-2">
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">Precio (USD)</span>
            <span className="text-lg font-bold text-stone-900">
              {currency}{item.price.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item);
              }}
              className="p-2 rounded-sm text-stone-500 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
              title="Ver detalles e ingredientes"
              aria-label="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              id={`quick-add-${item.id}`}
              onClick={handleQuickAdd}
              disabled={!item.available}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all shadow-xs ${
                !item.available
                  ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                  : justAdded
                  ? 'bg-emerald-700 text-white cursor-pointer'
                  : 'bg-[#a83b24] hover:bg-[#91321d] text-white active:scale-95 cursor-pointer'
              }`}
            >
              {!item.available ? (
                <span>Agotado</span>
              ) : justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Añadido</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Pedir</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid / Card View Mode
  return (
    <div
      id={`menu-item-card-${item.id}`}
      onClick={() => onSelect(item)}
      className={`group relative flex flex-col bg-white hover:bg-stone-50/50 rounded-sm border transition-all duration-200 overflow-hidden cursor-pointer shadow-xs hover:shadow-md ${
        item.available ? 'border-stone-200 hover:border-stone-400' : 'border-stone-200 opacity-85'
      }`}
    >
      {/* Top Media: Dish Photo or Fallback */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400">
            <Utensils className="w-10 h-10 mb-1 opacity-50" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Delicias Belgi</span>
          </div>
        )}

        {/* Subtle Bottom Scrim for text readability */}
        {item.image && (
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {/* Estado disponible / no disponible */}
          <span
            className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-xs border shadow-xs ${
              item.available
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-stone-800 text-stone-300 border-stone-700'
            }`}
          >
            {item.available ? 'Disponible' : 'No disponible'}
          </span>

          {item.tags?.map((tag) => (
            <span
              key={tag}
              className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-xs border shadow-xs ${getTagBadgeClass(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Rating Badge */}
        {item.rating && (
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center space-x-1 px-2 py-0.5 rounded-xs bg-[#1c1917]/90 text-white text-xs font-semibold border border-stone-700">
            <Star className="w-3 h-3 fill-[#d97706] text-[#d97706]" />
            <span>{item.rating}</span>
          </div>
        )}

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-stone-950/30 backdrop-blur-[1px]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white text-stone-900 text-xs font-semibold uppercase tracking-wider border border-stone-300 shadow-md">
            <Eye className="w-3.5 h-3.5 text-[#a83b24]" />
            Ver Detalles
          </span>
        </div>

        {/* Time / Portion Indicator at Bottom of Image */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-white z-10">
          {item.prepTime && (
            <span className="flex items-center gap-1 bg-[#1c1917]/80 px-2 py-0.5 rounded-xs border border-stone-700">
              <Clock className="w-3 h-3 text-[#fca5a5]" />
              {item.prepTime}
            </span>
          )}
          {item.calories && (
            <span className="flex items-center gap-1 bg-[#1c1917]/80 px-2 py-0.5 rounded-xs border border-stone-700">
              <Flame className="w-3 h-3 text-[#fca5a5]" />
              {item.calories} kcal
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#a83b24]">
              {formatCategoryLabel(item.category)}
            </span>
            {item.portionSize && (
              <span className="text-[11px] text-stone-500 font-medium truncate max-w-[140px]">
                {item.portionSize}
              </span>
            )}
          </div>

          <h3 className="font-serif-title text-lg font-bold text-stone-900 group-hover:text-[#a83b24] transition-colors leading-snug line-clamp-1 mb-2">
            {item.name}
          </h3>

          <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed mb-4">
            {item.description}
          </p>
        </div>

        {/* Price & Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-200">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">
              Precio (USD)
            </span>
            <span className="text-xl font-bold text-stone-900 tracking-tight">
              {currency}{item.price.toFixed(2)}
            </span>
          </div>

          <button
            id={`grid-add-${item.id}`}
            onClick={handleQuickAdd}
            disabled={!item.available}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all duration-150 shadow-xs ${
              !item.available
                ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-700 text-white cursor-pointer'
                : 'bg-[#a83b24] hover:bg-[#91321d] text-white active:scale-95 cursor-pointer'
            }`}
            title={item.available ? 'Añadir a mi comanda' : 'Producto no disponible'}
          >
            {!item.available ? (
              <span>No disponible</span>
            ) : justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Añadido</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Pedir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

