import React from 'react';
import { 
  ShoppingBag, 
  Clock, 
  Utensils, 
  Printer, 
  Tv, 
  AlertCircle, 
  Sparkles,
  CheckCircle2,
  Database
} from 'lucide-react';

export const OrdersModulePlaceholderView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-title text-2xl font-bold text-stone-900">
                Gestión de Pedidos & Comandas
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Módulo Preparado
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Arquitectura lista para comandas en tiempo real, estados de cocina e impresión de tickets.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Comandas en Cocina */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xs bg-amber-50 text-[#d97706] flex items-center justify-center">
            <Tv className="w-5 h-5" />
          </div>
          <h3 className="font-serif-title text-base font-bold text-stone-900">
            Monitor de Cocina (KDS)
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Preparado para conectarse a pantallas de cocina o tablets para que los cocineros visualicen los pedidos entrantes por mesa en tiempo real.
          </p>
        </div>

        {/* Card 2: Estados de Pedido */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xs bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-serif-title text-base font-bold text-stone-900">
            Ciclo de Estados
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Estructurado para gestionar estados como: <span className="font-semibold text-stone-800">Recibido → En Preparación → Listo para Servir → Entregado</span>.
          </p>
        </div>

        {/* Card 3: Impresión Térmica */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xs bg-stone-100 text-stone-700 flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
          <h3 className="font-serif-title text-base font-bold text-stone-900">
            Impresión de Tickets
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Capacidad para enviar órdenes a impresoras térmicas de 58mm / 80mm vía Bluetooth o red local para control de caja y cocina.
          </p>
        </div>
      </div>

      {/* Info Callout */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-sm text-xs text-amber-900 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Flujo de pedidos actual sin costo de base de datos
          </p>
          <p className="text-amber-800 leading-relaxed">
            Actualmente los comensales configuran su pedido en la carta digital y lo envían directamente con número de mesa y desglose por WhatsApp. Cuando decidas habilitar pedidos en Firestore, este módulo se activará sin romper la estructura actual.
          </p>
        </div>
      </div>
    </div>
  );
};
