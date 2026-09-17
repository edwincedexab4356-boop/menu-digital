import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Send, 
  CheckCircle2, 
  UtensilsCrossed,
  MapPin,
  FileText
} from 'lucide-react';
import { CartItem, RestaurantData } from '../types';
import { createOrder } from '../services/orderService';

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: string;
  tableNumber: string;
  onChangeTable: (table: string) => void;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  restaurant: RestaurantData;
}

export const OrderDrawer: React.FC<OrderDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency,
  tableNumber,
  onChangeTable,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  restaurant,
}) => {
  const [orderSent, setOrderSent] = useState(false);
  const [orderTicketNumber, setOrderTicketNumber] = useState('');
  const [orderType, setOrderType] = useState<'mesa' | 'llevar'>('mesa');
  const [tipPercentage, setTipPercentage] = useState<number>(10);
  const [generalNotes, setGeneralNotes] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, current) => acc + current.item.price * current.quantity, 0);
  const tipAmount = (subtotal * tipPercentage) / 100;
  const total = subtotal + tipAmount;

  const handleSendOrder = async () => {
    try {
      if (cartItems.length === 0) return;

      const orderItems = cartItems.map((ci) => ({
        id: ci.item.id,
        name: ci.item.name,
        price: ci.item.price,
        quantity: ci.quantity,
      }));

      const orderTotal = total;

      const orderId = await createOrder(orderItems, orderTotal);

      setOrderTicketNumber(orderId);
      setOrderSent(true);

      console.log('Pedido enviado correctamente:', orderId);
    } catch (error) {
      console.error('No se pudo enviar el pedido:', error);
      alert('No se pudo enviar el pedido. Intenta nuevamente.');
    }
  };

  const handleReset = () => {
    onClearCart();
    setOrderSent(false);
    setOrderTicketNumber('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#1c1917]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white text-stone-900 h-full flex flex-col shadow-2xl border-l border-stone-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xs bg-[#a83b24] text-white">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-title text-xl font-bold text-stone-900">
                Mi Pedido
              </h2>
              <p className="text-xs text-stone-500 font-normal">
                {cartItems.length} {cartItems.length === 1 ? 'platillo seleccionado' : 'platillos seleccionados'}
              </p>
            </div>
          </div>

          <button
            id="close-order-drawer"
            onClick={onClose}
            className="p-2 rounded-sm hover:bg-stone-200/60 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            aria-label="Cerrar pedido"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation View */}
        {orderSent ? (
          <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-sm bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif-title text-2xl font-bold text-stone-900">
                Pedido enviado correctamente
              </h3>
              {orderTicketNumber && (
                <p className="text-xs text-stone-600">
                  Número de Pedido: <span className="font-mono font-bold text-stone-900">{orderTicketNumber}</span>
                </p>
              )}
            </div>

            <div className="w-full pt-4">
              <button
                onClick={handleReset}
                className="w-full py-3 px-4 rounded-sm bg-[#a83b24] hover:bg-[#91321d] text-white font-semibold uppercase tracking-wider text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
              >
                Nuevo pedido
              </button>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty State */
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 text-stone-500">
            <div className="w-16 h-16 rounded-sm bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Su pedido está vacío</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Explore las secciones de Entradas, Platos Fuertes y Postres para seleccionar sus creaciones favoritas.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-sm bg-[#a83b24] hover:bg-[#91321d] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
            >
              Explorar la carta
            </button>
          </div>
        ) : (
          /* Normal Cart Items & Checkout */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Dining location toggle & Selector */}
            <div className="p-3 sm:p-4 bg-stone-50 border-b border-stone-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 uppercase tracking-wider font-bold text-[10px]">
                  Modalidad de servicio
                </span>
                <div className="flex bg-white p-0.5 rounded-sm border border-stone-300">
                  <button
                    onClick={() => setOrderType('mesa')}
                    className={`px-3 py-1 rounded-xs uppercase tracking-wider text-[11px] font-semibold transition-all cursor-pointer ${
                      orderType === 'mesa'
                        ? 'bg-[#1c1917] text-white'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    En Mesa
                  </button>
                  <button
                    onClick={() => setOrderType('llevar')}
                    className={`px-3 py-1 rounded-xs uppercase tracking-wider text-[11px] font-semibold transition-all cursor-pointer ${
                      orderType === 'llevar'
                        ? 'bg-[#1c1917] text-white'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Para Llevar
                  </button>
                </div>
              </div>

              {orderType === 'mesa' && (
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-sm border border-stone-300">
                  <span className="text-stone-700 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#a83b24]" />
                    Ubicación asignada:
                  </span>
                  <select
                    value={tableNumber}
                    onChange={(e) => onChangeTable(e.target.value)}
                    className="bg-stone-50 border border-stone-300 text-stone-900 font-bold rounded-xs px-2.5 py-1 text-xs focus:outline-none focus:border-[#a83b24]"
                  >
                    <option value="Mesa 01">Mesa 01</option>
                    <option value="Mesa 02">Mesa 02</option>
                    <option value="Mesa 03">Mesa 03</option>
                    <option value="Mesa 04">Mesa 04 (Salón Principal)</option>
                    <option value="Mesa 05">Mesa 05</option>
                    <option value="Mesa 10">Mesa 10 (Terraza)</option>
                    <option value="Mesa 12">Mesa 12 (Terraza Jardín)</option>
                    <option value="Barra 01">Barra Principal</option>
                  </select>
                </div>
              )}
            </div>

            {/* Scrollable list of ordered items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.map((ci) => (
                <div
                  key={ci.item.id}
                  className="p-3 bg-stone-50 rounded-sm border border-stone-200 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <img
                        src={ci.item.image}
                        alt={ci.item.name}
                        className="w-14 h-14 rounded-xs object-cover shrink-0 border border-stone-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-[#a83b24] font-bold">
                          {ci.item.category === 'entradas' ? 'Entrada' : ci.item.category === 'platos_fuertes' ? 'Plato Fuerte' : 'Postre'}
                        </span>
                        <h4 className="font-bold text-stone-900 text-sm truncate">
                          {ci.item.name}
                        </h4>
                        <span className="text-xs text-stone-900 font-bold">
                          {currency}{(ci.item.price * ci.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(ci.item.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Eliminar plato"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity and notes */}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                    <span className="text-[11px] text-stone-500">
                      {currency}{ci.item.price.toFixed(2)} c/u
                    </span>

                    <div className="flex items-center space-x-2 bg-white rounded-xs p-0.5 border border-stone-300">
                      <button
                        onClick={() => onUpdateQuantity(ci.item.id, ci.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-stone-900 cursor-pointer"
                        aria-label="Menos"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-xs text-stone-900">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(ci.item.id, ci.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-stone-900 cursor-pointer"
                        aria-label="Más"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {ci.specialInstructions && (
                    <div className="text-[11px] text-stone-600 bg-white px-2.5 py-1 rounded-xs border border-stone-200 italic">
                      Nota: "{ci.specialInstructions}"
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom calculation and action */}
            <div className="p-4 border-t border-stone-200 bg-white space-y-3 shrink-0">
              {/* Tip options */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium text-[11px] uppercase tracking-wider">Propina de servicio:</span>
                <div className="flex gap-1">
                  {[0, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setTipPercentage(pct)}
                      className={`px-2.5 py-1 rounded-xs text-xs font-semibold transition-colors cursor-pointer border ${
                        tipPercentage === pct
                          ? 'bg-[#1c1917] text-white border-[#1c1917]'
                          : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border-stone-300'
                      }`}
                    >
                      {pct === 0 ? '0%' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-1 text-xs text-stone-600 border-t border-stone-200 pt-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-stone-900 font-medium">{currency}{subtotal.toFixed(2)}</span>
                </div>
                {tipPercentage > 0 && (
                  <div className="flex justify-between">
                    <span>Propina sugerida ({tipPercentage}%):</span>
                    <span className="text-stone-900 font-medium">{currency}{tipAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-200">
                  <span>Total estimado:</span>
                  <span className="text-[#a83b24] text-base font-bold">{currency}{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  id="send-kitchen-order-btn"
                  onClick={handleSendOrder}
                  className="w-full py-3 px-4 rounded-sm bg-[#a83b24] hover:bg-[#91321d] text-white font-semibold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar pedido</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
