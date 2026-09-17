import React from 'react';
import { UtensilsCrossed, ShoppingBag, MapPin, Clock, Phone, Sparkles, Info } from 'lucide-react';
import { RestaurantData } from '../types';

interface NavbarProps {
  restaurant: RestaurantData;
  cartCount: number;
  tableNumber: string;
  onOpenCart: () => void;
  onOpenInfo: () => void;
  onChangeTable: () => void;
  onNavigateToAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  restaurant,
  cartCount,
  tableNumber,
  onOpenCart,
  onOpenInfo,
  onChangeTable,
  onNavigateToAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-stone-900 border-b border-stone-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-sm bg-[#a83b24] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-title text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                  {restaurant.name}
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-[#a83b24] border border-stone-200">
                  Panamá
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block font-normal">
                {restaurant.subtitle}
              </p>
            </div>
          </div>

          {/* Table Indicator & Quick Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Table Badge */}
            <button
              id="table-selector-btn"
              onClick={onChangeTable}
              className="flex items-center space-x-2 px-3 py-2 rounded-sm bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              title="Cambiar número de mesa o modalidad"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span className="text-stone-400 hidden xs:inline uppercase tracking-wider text-[11px]">Ubicación:</span>
              <span className="text-stone-900 font-semibold">{tableNumber}</span>
            </button>

            {/* Restaurant Info Trigger */}
            <button
              id="restaurant-info-btn"
              onClick={onOpenInfo}
              className="p-2 rounded-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
              title="Información del restaurante, horarios y contacto"
              aria-label="Información del restaurante"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Admin Panel Trigger */}
            {onNavigateToAdmin && (
              <button
                id="admin-nav-btn"
                onClick={onNavigateToAdmin}
                className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-2 rounded-sm text-stone-600 hover:text-[#a83b24] hover:bg-stone-100 border border-stone-200 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                title="Acceso al Panel de Administración (/admin)"
              >
                <span>Admin</span>
              </button>
            )}

            {/* Cart / Pedido Button */}
            <button
              id="cart-floating-btn"
              onClick={onOpenCart}
              className="relative flex items-center space-x-2 px-4 py-2 rounded-sm bg-[#a83b24] hover:bg-[#91321d] text-white font-medium text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-95"
              aria-label="Ver mi pedido"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Pedido</span>
              {cartCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold bg-white text-[#a83b24] rounded-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
