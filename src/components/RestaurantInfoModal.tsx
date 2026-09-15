import React, { useState } from 'react';
import { X, MapPin, Phone, Clock, Wifi, Award, ChefHat, Check, Copy } from 'lucide-react';
import { RestaurantData } from '../types';

interface RestaurantInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: RestaurantData;
}

export const RestaurantInfoModal: React.FC<RestaurantInfoModalProps> = ({
  isOpen,
  onClose,
  restaurant,
}) => {
  const [copiedWifi, setCopiedWifi] = useState(false);

  if (!isOpen) return null;

  const handleCopyWifi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('AuraGuest2026');
      setCopiedWifi(true);
      setTimeout(() => setCopiedWifi(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1c1917]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white border border-stone-300 rounded-sm p-6 sm:p-7 text-stone-900 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-restaurant-info"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-sm hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-stone-200 pb-4">
          <div className="w-12 h-12 rounded-xs bg-[#a83b24] text-white flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-stone-900">
              {restaurant.name}
            </h3>
            <p className="text-xs text-[#a83b24] font-semibold uppercase tracking-wider">
              {restaurant.subtitle}
            </p>
          </div>
        </div>

        {/* Philosophy */}
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-sm border border-stone-200 font-light">
          "Nuestra cocina nace del respeto profundo por el producto panameño y del Pacífico, las técnicas del fuego a baja temperatura y la pasión por crear memorias inolvidables en cada servicio."
        </p>

        {/* Info Grid */}
        <div className="space-y-3.5 text-xs sm:text-sm">
          <div className="flex items-start space-x-3">
            <Clock className="w-4 h-4 text-[#a83b24] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 block text-[11px] uppercase tracking-wider">Horario de Cocina</span>
              <span className="text-stone-600">{restaurant.hours}</span>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <MapPin className="w-4 h-4 text-[#a83b24] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 block text-[11px] uppercase tracking-wider">Ubicación</span>
              <span className="text-stone-600">{restaurant.address}</span>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Phone className="w-4 h-4 text-[#a83b24] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 block text-[11px] uppercase tracking-wider">Reservas y Contacto</span>
              <span className="text-stone-600 font-medium">{restaurant.phone}</span>
            </div>
          </div>

          {/* Wifi for diners */}
          <div className="flex items-center justify-between p-3.5 rounded-sm bg-stone-50 border border-stone-200">
            <div className="flex items-center space-x-2.5">
              <Wifi className="w-4 h-4 text-[#a83b24]" />
              <div>
                <span className="text-xs text-stone-900 block font-semibold">Red WiFi Comensales</span>
                <span className="text-xs text-stone-500 font-mono">Red: Aura_Guest_Panama</span>
              </div>
            </div>
            <button
              onClick={handleCopyWifi}
              className="px-3 py-1.5 rounded-xs bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-stone-300 cursor-pointer shadow-xs"
            >
              {copiedWifi ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copiada</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#a83b24]" />
                  <span>Copiar clave</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1 font-medium">
            <Award className="w-3.5 h-3.5 text-[#a83b24]" />
            Guía Gastronómica de Panamá 2026
          </span>
          <span className="uppercase tracking-wider text-[10px]">Menú digital oficial</span>
        </div>
      </div>
    </div>
  );
};
