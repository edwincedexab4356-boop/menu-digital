import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChefHat, 
  XCircle, 
  ArrowRight, 
  Check, 
  RotateCcw,
  PackageCheck,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { getProductImage } from '../../utils/productImages';

export interface CashierOrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CashierOrder {
  id: string;
  items: CashierOrderItem[];
  total: number;
  status: 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado';
  createdAt?: any;
}

export const OrdersModulePlaceholderView: React.FC = () => {
  const [orders, setOrders] = useState<CashierOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Subscribe to 'pedidos' in real-time
  useEffect(() => {
    setLoading(true);
    let unsubscribe: (() => void) | null = null;

    try {
      const ordersRef = collection(db, 'pedidos');
      unsubscribe = onSnapshot(
        ordersRef,
        (snapshot) => {
          const list: CashierOrder[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              items: Array.isArray(data.items) ? data.items : [],
              total: Number(data.total) || 0,
              status: (data.status || 'pendiente') as CashierOrder['status'],
              createdAt: data.createdAt,
            };
          });

          // Sort most recent first
          list.sort((a, b) => {
            const getTime = (val: any) => {
              if (!val) return Date.now(); // If serverTimestamp pending, place at top
              if (val.toMillis) return val.toMillis();
              if (val.seconds) return val.seconds * 1000;
              if (val instanceof Date) return val.getTime();
              return 0;
            };
            return getTime(b.createdAt) - getTime(a.createdAt);
          });

          setOrders(list);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error listening to pedidos collection:', err);
          setError(err?.message || 'Error al conectar con la colección de pedidos.');
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.error('Exception setting up pedidos listener:', err);
      setError(err?.message || 'No se pudo iniciar la conexión de pedidos.');
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Format order date/time safely
  const formatOrderTime = (createdAt: any) => {
    if (!createdAt) return 'Recién recibido';
    try {
      let date: Date;
      if (createdAt.toDate) {
        date = createdAt.toDate();
      } else if (createdAt.seconds) {
        date = new Date(createdAt.seconds * 1000);
      } else if (createdAt instanceof Date) {
        date = createdAt;
      } else {
        return 'Hora actual';
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recién recibido';
    }
  };

  // Change order status directly in Firestore
  const handleUpdateStatus = async (orderId: string, newStatus: CashierOrder['status']) => {
    setUpdatingId(orderId);
    try {
      const orderRef = doc(db, 'pedidos', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
      });
    } catch (err: any) {
      console.error('Error updating order status:', err);
      alert(`Error al actualizar estado: ${err?.message || 'Intente nuevamente'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders by status
  const pendingOrders = orders.filter((o) => o.status === 'pendiente');
  const preparingOrders = orders.filter((o) => o.status === 'preparando');
  const readyOrders = orders.filter((o) => o.status === 'listo');
  const completedOrders = orders.filter((o) => o.status === 'entregado' || o.status === 'cancelado');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Counter Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-sm border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xs bg-[#a83b24] text-white flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-stone-900">
                Pantalla de Caja & Comandas en Vivo
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Recepción automática de pedidos desde el menú digital en tiempo real vía Cloud Firestore.
            </p>
          </div>

          {/* Pending Counter Pill */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/90 text-[#a83b24]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a83b24] animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Pedidos pendientes: <span className="font-mono text-sm font-black">{pendingOrders.length}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-sm text-xs text-red-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error al sincronizar con Firestore</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-sm border border-stone-200 p-8 space-y-3">
          <Loader2 className="w-8 h-8 text-[#a83b24] animate-spin mx-auto" />
          <p className="text-sm font-semibold text-stone-700">Conectando a la caja de pedidos...</p>
          <p className="text-xs text-stone-400">Escuchando órdenes entrantes en tiempo real</p>
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-sm border border-stone-200 p-8 space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-xs bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-serif-title text-lg font-bold text-stone-900">
            No hay pedidos pendientes
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Cuando los clientes envíen un pedido desde el menú digital, aparecerá aquí al instante sin recargar la página.
          </p>
        </div>
      ) : (
        /* 4 Columns / Sections for Cashier workflow */
        <div className="space-y-8">
          {/* 1. SECCIÓN PENDIENTES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-300">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-900">
                  Pedidos Pendientes
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {pendingOrders.length}
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-2">No hay pedidos pendientes en este momento.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    formatTime={formatOrderTime}
                    isUpdating={updatingId === order.id}
                    onStatusChange={handleUpdateStatus}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 2. SECCIÓN EN PREPARACIÓN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-300">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-900">
                  En Preparación
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {preparingOrders.length}
              </span>
            </div>

            {preparingOrders.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-2">No hay comandas en preparación.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {preparingOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    formatTime={formatOrderTime}
                    isUpdating={updatingId === order.id}
                    onStatusChange={handleUpdateStatus}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 3. SECCIÓN LISTOS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-300">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-900">
                  Listos para Entregar
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {readyOrders.length}
              </span>
            </div>

            {readyOrders.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-2">No hay pedidos listos esperando entrega.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {readyOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    formatTime={formatOrderTime}
                    isUpdating={updatingId === order.id}
                    onStatusChange={handleUpdateStatus}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 4. HISTORIAL / FINALIZADOS */}
          {completedOrders.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-stone-300">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-stone-400" />
                  <h3 className="font-serif-title text-base font-bold text-stone-700">
                    Historial de Pedidos Finalizados
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  {completedOrders.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedOrders.slice(0, 9).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    formatTime={formatOrderTime}
                    isUpdating={updatingId === order.id}
                    onStatusChange={handleUpdateStatus}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface OrderCardProps {
  order: CashierOrder;
  formatTime: (ts: any) => string;
  isUpdating: boolean;
  onStatusChange: (id: string, newStatus: CashierOrder['status']) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  formatTime,
  isUpdating,
  onStatusChange,
}) => {
  const shortId = order.id ? order.id.slice(-6).toUpperCase() : 'ORDEN';

  const getStatusBadge = () => {
    switch (order.status) {
      case 'pendiente':
        return (
          <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
            Pendiente
          </span>
        );
      case 'preparando':
        return (
          <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-300">
            En Preparación
          </span>
        );
      case 'listo':
        return (
          <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
            Listo
          </span>
        );
      case 'entregado':
        return (
          <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-300">
            Entregado
          </span>
        );
      case 'cancelado':
        return (
          <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-300">
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-sm border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-stone-300 transition-all">
      {/* Header */}
      <div className="p-3.5 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between">
        <div>
          <span className="font-mono text-xs font-bold text-stone-900">
            Pedido #{shortId}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>Recibido: {formatTime(order.createdAt)}</span>
          </div>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Item List with high-definition food photos */}
      <div className="p-3.5 divide-y divide-stone-100 flex-1 space-y-2">
        {order.items.map((item, idx) => {
          const itemPhoto = getProductImage(null, item.name, '');
          return (
            <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                {/* Visual dish photo thumbnail */}
                <div className="w-9 h-9 rounded-xs overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
                  <img
                    src={itemPhoto}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-stone-900 truncate">
                    <span className="text-[#a83b24] font-bold font-mono mr-1">{item.quantity}×</span>
                    {item.name}
                  </p>
                  <span className="text-[10px] text-stone-400 font-mono">
                    ${Number(item.price).toFixed(2)} c/u
                  </span>
                </div>
              </div>
              <span className="font-mono font-bold text-stone-800 shrink-0 text-xs">
                ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Total & Action Buttons */}
      <div className="p-3.5 bg-stone-50 border-t border-stone-200 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-stone-500">Total:</span>
          <span className="font-mono text-base font-bold text-stone-900">
            ${Number(order.total).toFixed(2)} USD
          </span>
        </div>

        {/* Dynamic Action Buttons according to current status */}
        <div className="pt-1">
          {order.status === 'pendiente' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange(order.id, 'preparando')}
                className="flex-1 py-1.5 px-3 rounded-xs bg-[#a83b24] hover:bg-[#91321d] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChefHat className="w-3.5 h-3.5" />}
                <span>Aceptar Pedido</span>
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => {
                  if (confirm('¿Seguro que deseas cancelar este pedido?')) {
                    onStatusChange(order.id, 'cancelado');
                  }
                }}
                className="py-1.5 px-2.5 rounded-xs bg-white hover:bg-stone-100 text-stone-600 hover:text-red-700 text-xs font-semibold uppercase tracking-wider border border-stone-300 transition-colors cursor-pointer disabled:opacity-50"
                title="Cancelar pedido"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {order.status === 'preparando' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onStatusChange(order.id, 'listo')}
              className="w-full py-1.5 px-3 rounded-xs bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Marcar como Listo</span>
            </button>
          )}

          {order.status === 'listo' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onStatusChange(order.id, 'entregado')}
              className="w-full py-1.5 px-3 rounded-xs bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PackageCheck className="w-3.5 h-3.5" />}
              <span>Marcar como Entregado</span>
            </button>
          )}

          {(order.status === 'entregado' || order.status === 'cancelado') && (
            <div className="flex items-center justify-between text-[11px] text-stone-400">
              <span>Pedido cerrado</span>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange(order.id, 'pendiente')}
                className="text-stone-500 hover:text-stone-800 flex items-center gap-1 underline cursor-pointer"
                title="Reabrir pedido si fue un error"
              >
                <RotateCcw className="w-3 h-3" />
                Reabrir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
