import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Clock, 
  Flame, 
  Wine, 
  AlertCircle, 
  Plus, 
  Minus, 
  Check, 
  Utensils,
  Share2
} from 'lucide-react';
import { MenuItem } from '../types';

interface ItemDetailModalProps {
  item: MenuItem | null;
  currency: string;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, instructions?: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  currency,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedEffect, setAddedEffect] = useState(false);

  if (!item) return null;

  const handleAdd = () => {
    onAddToCart(item, quantity, instructions.trim() || undefined);
    setAddedEffect(true);
    setTimeout(() => {
      setAddedEffect(false);
      onClose();
    }, 400);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}?dish=${item.id}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-[#1c1917]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl bg-white border border-stone-300 rounded-sm overflow-hidden shadow-2xl my-auto text-stone-900 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close & Share Buttons */}
        <div className="absolute top-3 right-3 z-30 flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-sm bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 backdrop-blur-xs border border-stone-200 transition-colors cursor-pointer shadow-xs"
            title="Copiar enlace del platillo"
            aria-label="Compartir platillo"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            id="close-dish-modal"
            onClick={onClose}
            className="p-2 rounded-sm bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 backdrop-blur-xs border border-stone-200 transition-colors cursor-pointer shadow-xs"
            title="Cerrar"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1">
          {/* Top Hero Photo or Fallback */}
          <div className="relative aspect-[16/10] sm:aspect-[21/10] w-full bg-stone-100 flex items-center justify-center">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-stone-400">
                <Utensils className="w-16 h-16 mb-2 opacity-50" />
                <span className="text-xs uppercase font-bold tracking-wider text-stone-400">Delicias Belgi</span>
              </div>
            )}
            {item.image && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            )}

            {/* Badges on Photo */}
            <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5 items-center">
                {/* Estado disponible / no disponible */}
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-xs font-bold shadow-xs ${
                    item.available
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  {item.available ? 'Disponible' : 'No disponible'}
                </span>

                {item.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-xs font-bold bg-white text-stone-900 shadow-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {item.rating && (
                <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-xs bg-[#1c1917]/90 text-white text-xs font-bold border border-stone-700">
                  <Star className="w-3.5 h-3.5 fill-[#d97706] text-[#d97706]" />
                  <span>{item.rating}</span>
                  {item.reviewCount && (
                    <span className="text-stone-300 font-normal">({item.reviewCount} valoraciones)</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Body Information */}
          <div className="p-5 sm:p-7 space-y-6">
            {/* Title & Price */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-stone-200 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] uppercase tracking-widest text-[#a83b24] font-bold block">
                    {item.category === 'entradas'
                      ? 'Entrada de Autor'
                      : item.category === 'platos_fuertes'
                      ? 'Plato Fuerte Principal'
                      : item.category === 'postres'
                      ? 'Postre Artesanal'
                      : item.category.toUpperCase()}
                  </span>
                  <span className="text-stone-300 text-xs">•</span>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded-xs border ${
                      item.available
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-stone-100 text-stone-600 border-stone-300'
                    }`}
                  >
                    {item.available ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
                <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                  {item.name}
                </h2>
              </div>
              <div className="sm:text-right shrink-0">
                <span className="text-2xl sm:text-3xl font-bold text-stone-900 block tracking-tight">
                  {currency}{item.price.toFixed(2)} USD
                </span>
                <span className="text-[11px] text-stone-500 font-normal">Impuestos incluidos</span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-sm bg-stone-50 border border-stone-200 text-center text-xs">
              <div>
                <span className="text-stone-500 block mb-0.5 text-[11px] uppercase tracking-wider">Tiempo estimado</span>
                <span className="font-semibold text-stone-800 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#a83b24]" />
                  {item.prepTime}
                </span>
              </div>
              <div className="border-x border-stone-200">
                <span className="text-stone-500 block mb-0.5 text-[11px] uppercase tracking-wider">Porción</span>
                <span className="font-semibold text-stone-800 truncate px-1 block">
                  {item.portionSize || 'Individual'}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block mb-0.5 text-[11px] uppercase tracking-wider">Energía</span>
                <span className="font-semibold text-stone-800 flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#a83b24]" />
                  {item.calories ? `${item.calories} kcal` : 'Selección Chef'}
                </span>
              </div>
            </div>

            {/* Culinary Description */}
            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-stone-500 mb-2">
                Descripción Culinaria
              </h4>
              <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-light">
                {item.longDescription}
              </p>
            </div>

            {/* Ingredients */}
            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-stone-500 mb-2.5 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-[#a83b24]" />
                Ingredientes & Procedencia
              </h4>
              <div className="flex flex-wrap gap-2">
                {item.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-xs bg-stone-50 text-stone-800 border border-stone-300 font-medium"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Wine Pairing */}
            {item.winePairing && (
              <div className="p-4 rounded-sm bg-stone-50 border border-stone-200 flex items-start gap-3">
                <div className="p-2 rounded-xs bg-[#a83b24]/10 text-[#a83b24] shrink-0 mt-0.5">
                  <Wine className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#a83b24] font-bold block mb-0.5">
                    Sugerencia de Maridaje
                  </span>
                  <p className="text-xs sm:text-sm text-stone-800 font-medium">
                    {item.winePairing}
                  </p>
                </div>
              </div>
            )}

            {/* Allergens Warning */}
            {item.allergens && item.allergens.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-50 p-3 rounded-sm border border-stone-200">
                <AlertCircle className="w-4 h-4 text-[#a83b24] shrink-0" />
                <span>
                  <strong className="text-stone-900">Alérgenos presentes:</strong>{' '}
                  {item.allergens.join(', ')}. Indique al personal cualquier intolerancia severa.
                </span>
              </div>
            )}

            {/* Special Instructions / Notes */}
            <div>
              <label htmlFor="special-notes" className="block text-[11px] uppercase tracking-wider font-bold text-stone-500 mb-1.5">
                Indicaciones especiales para cocina (opcional)
              </label>
              <input
                id="special-notes"
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ej. Término medio de la carne, salsa aparte, alérgico a frutos secos..."
                className="w-full px-3.5 py-2.5 rounded-sm bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm placeholder-stone-400 focus:outline-none focus:border-[#a83b24] focus:ring-1 focus:ring-[#a83b24]"
              />
            </div>
          </div>
        </div>

        {/* Footer: Quantity Counter & Add Action */}
        <div className="p-4 sm:p-6 border-t border-stone-200 bg-stone-50/90 flex items-center justify-between gap-4 shrink-0">
          {/* Quantity Selector */}
          <div className="flex items-center space-x-2 bg-white rounded-sm p-1 border border-stone-300">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xs flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-stone-900 text-sm sm:text-base">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-xs flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Order Button */}
          <button
            id="modal-add-to-cart-btn"
            onClick={handleAdd}
            disabled={!item.available}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-5 rounded-sm font-semibold uppercase tracking-wider text-xs sm:text-sm transition-all shadow-xs ${
              !item.available
                ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                : addedEffect
                ? 'bg-emerald-700 text-white scale-98 cursor-pointer'
                : 'bg-[#a83b24] hover:bg-[#91321d] text-white active:scale-98 cursor-pointer'
            }`}
          >
            {!item.available ? (
              <span>Platillo No Disponible</span>
            ) : addedEffect ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>¡Agregado a la comanda!</span>
              </>
            ) : (
              <>
                <span>Añadir a mi Comanda</span>
                <span className="opacity-60">•</span>
                <span>{currency}{(item.price * quantity).toFixed(2)} USD</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
