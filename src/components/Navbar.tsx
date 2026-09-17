import React from 'react';
import { UtensilsCrossed, ShoppingBag, MapPin, Clock, Phone, Sparkles, Info, ShieldCheck } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group select-none min-w-0" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#a83b24] to-[#872d1a] text-white flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105 shrink-0">
              <UtensilsCrossed className="w-5 h-5 sm:w-5 sm:h-5 text-white stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-serif-title text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-[#a83b24] transition-colors truncate">
                  {restaurant.name}
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-[#a83b24] border border-rose-200/80">
                  Menú Digital
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block font-normal truncate">
                {restaurant.subtitle || 'Heladería, Dulcería & Repostería Artesanal'}
              </p>
            </div>
          </div>

          {/* Table Indicator & Quick Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Table Badge */}
            <button
              id="table-selector-btn"
              onClick={onChangeTable}
              className="flex items-center space-x-2 px-3 py-1.5 sm:py-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/90 text-stone-700 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-2xs hover:border-stone-300 active:scale-98"
              title="Toca para cambiar mesa o servicio"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="text-stone-400 hidden xs:inline uppercase tracking-wider text-[10px] font-bold">Mesa:</span>
              <span className="text-stone-900 font-bold tracking-tight">{tableNumber}</span>
            </button>

            {/* Restaurant Info Trigger */}
            <button
              id="restaurant-info-btn"
              onClick={onOpenInfo}
              className="p-2 sm:p-2.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200/80 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Información del restaurante, horarios y contacto"
              aria-label="Información del restaurante"
            >
              <Info className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Admin Panel Trigger */}
            {onNavigateToAdmin && (
              <button
                id="admin-nav-btn"
                onClick={onNavigateToAdmin}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-stone-600 hover:text-[#a83b24] hover:bg-rose-50/60 border border-stone-200 text-xs font-semibold tracking-wider transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Acceso al Panel de Administración (/admin)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#a83b24]" />
                <span>Admin</span>
              </button>
            )}

            {/* Cart / Pedido Button */}
            <button
              id="cart-floating-btn"
              onClick={onOpenCart}
              className="relative flex items-center space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#a83b24] to-[#91321d] hover:from-[#91321d] hover:to-[#7d2916] text-white font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95 select-none"
              aria-label="Ver mi pedido"
            >
              <ShoppingBag className="w-4 h-4 text-white stroke-[2.2]" />
              <span className="hidden sm:inline font-medium">Mi Pedido</span>
              {cartCount > 0 ? (
                <span className="ml-0.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold bg-white text-[#a83b24] rounded-full shadow-xs animate-in zoom-in-75 duration-150">
                  {cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
