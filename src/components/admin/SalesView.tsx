import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Filter, 
  DollarSign, 
  CreditCard, 
  Banknote, 
  ShoppingBag, 
  Edit3, 
  Trash2, 
  ArrowUpDown, 
  Download, 
  UtensilsCrossed, 
  Clock, 
  User, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { Sale, MetodoPago } from '../../types/finance';
import { MenuItem } from '../../types';
import { DeleteSaleModal } from './DeleteSaleModal';

interface SalesViewProps {
  sales: Sale[];
  products: MenuItem[];
  onOpenNewSale: () => void;
  onEditSale: (sale: Sale) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
  onSaleDeleted?: (saleId: string) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  sales,
  products,
  onOpenNewSale,
  onEditSale,
  onShowToast,
  onSaleDeleted,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'todos' | 'hoy' | 'semana' | 'mes' | 'custom'>('todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('todos');
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  // Helper date calculations
  const now = new Date();
  const getLocalDateStr = (d: Date = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayLocalStr = getLocalDateStr(now);
  const todayUtcStr = now.toISOString().split('T')[0];
  
  // Start of week (Monday)
  const dayOfWeek = now.getDay() || 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
  const startOfWeekStr = getLocalDateStr(startOfWeek);

  // Start of month
  const currentYear = now.getFullYear();
  const currentMonthStr = String(now.getMonth() + 1).padStart(2, '0');
  const monthPrefix = `${currentYear}-${currentMonthStr}`;

  const isToday = (fecha: string) => fecha === todayLocalStr || fecha === todayUtcStr;

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      // Date filter
      if (dateFilter === 'hoy') {
        if (!isToday(sale.fecha)) return false;
      } else if (dateFilter === 'semana') {
        if (sale.fecha < startOfWeekStr) return false;
      } else if (dateFilter === 'mes') {
        if (!sale.fecha.startsWith(monthPrefix)) return false;
      } else if (dateFilter === 'custom') {
        if (startDate && sale.fecha < startDate) return false;
        if (endDate && sale.fecha > endDate) return false;
      }

      // Method filter
      if (methodFilter !== 'todos' && sale.metodoPago !== methodFilter) {
        return false;
      }

      // Search query (sale id, customer, items names, notes)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = sale.id.toLowerCase().includes(q);
        const matchesClient = (sale.clienteNombre || '').toLowerCase().includes(q);
        const matchesMesa = (sale.mesa || '').toLowerCase().includes(q);
        const matchesNotas = (sale.notas || '').toLowerCase().includes(q);
        const matchesItems = sale.items.some((i) => i.nombre.toLowerCase().includes(q));

        if (!matchesId && !matchesClient && !matchesMesa && !matchesNotas && !matchesItems) {
          return false;
        }
      }

      return true;
    });
  }, [sales, dateFilter, startDate, endDate, methodFilter, searchQuery, todayLocalStr, todayUtcStr, startOfWeekStr, monthPrefix]);

  const totalFiltrado = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.total, 0);
  }, [filteredSales]);

  const totalProductosVendidos = useMemo(() => {
    return filteredSales.reduce((acc, s) => {
      if (Array.isArray(s.items) && s.items.length > 0) {
        return acc + s.items.reduce((sum, item) => sum + (Number(item.cantidad) || 1), 0);
      }
      return acc + (s.total > 0 ? 1 : 0);
    }, 0);
  }, [filteredSales]);


  const getMethodBadge = (metodo: MetodoPago) => {
    switch (metodo) {
      case 'efectivo':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Banknote className="w-3 h-3" /> Efectivo
          </span>
        );
      case 'tarjeta':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <CreditCard className="w-3 h-3" /> Tarjeta
          </span>
        );
      case 'transferencia':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            🏦 Transferencia
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200">
            Otro
          </span>
        );
    }
  };

  const formatFechaHora = (sale: Sale) => {
    if (sale.creadoEn?.toDate) {
      const d = sale.creadoEn.toDate();
      return `${d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} - ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return sale.fecha || 'Sin fecha';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Action */}
      <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-title text-2xl font-bold text-stone-900">
                Historial de Ventas
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#a83b24]/10 text-[#a83b24] border border-[#a83b24]/20">
                {filteredSales.length} {filteredSales.length === 1 ? 'venta' : 'ventas'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Registro de consumos, tickets emitidos y desglose de platillos vendidos guardados en Firestore.
            </p>
          </div>

          <button
            onClick={onOpenNewSale}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#a83b24] hover:bg-[#91321d] text-white rounded-xs text-xs font-bold uppercase tracking-widest transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Registrar Venta</span>
          </button>
        </div>

        {/* Quick summary strip for the active filter */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-stone-100">
          <div className="p-3 bg-stone-50 rounded-xs border border-stone-200">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
              Total de Ventas
            </span>
            <span className="font-serif-title text-xl font-bold text-stone-900">
              {filteredSales.length} {filteredSales.length === 1 ? 'venta' : 'ventas'}
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">
              {sales.length} en total en el sistema
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xs border border-stone-200">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
              Monto Recaudado
            </span>
            <span className="font-serif-title text-xl font-bold text-[#a83b24]">
              ${totalFiltrado.toFixed(2)} USD
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">
              En el filtro seleccionado
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xs border border-stone-200">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
              Total Platillos Vendidos
            </span>
            <span className="font-serif-title text-xl font-bold text-stone-800">
              {totalProductosVendidos} {totalProductosVendidos === 1 ? 'platillo' : 'platillos'}
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">
              Unidades consumidas
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xs border border-stone-200">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
              Ticket Promedio
            </span>
            <span className="font-serif-title text-xl font-bold text-stone-800">
              ${filteredSales.length > 0 ? (totalFiltrado / filteredSales.length).toFixed(2) : '0.00'} USD
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">
              Gasto promedio por venta
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-5 space-y-3 pt-4 border-t border-stone-100">
          {/* Row 1: Search & Date Pills */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-4 h-4 text-stone-400 my-auto" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ID, platillo, cliente, mesa o notas..."
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xs text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#a83b24]"
              />
            </div>

            {/* Date filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {(['todos', 'hoy', 'semana', 'mes', 'custom'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setDateFilter(period)}
                  className={`px-3 py-1.5 rounded-xs text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                    dateFilter === period
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {period === 'todos' && 'Todo'}
                  {period === 'hoy' && 'Hoy'}
                  {period === 'semana' && 'Esta semana'}
                  {period === 'mes' && 'Este mes'}
                  {period === 'custom' && 'Personalizado'}
                </button>
              ))}
            </div>

            {/* Payment method selector */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xs text-xs text-stone-700 font-semibold uppercase tracking-wider cursor-pointer"
            >
              <option value="todos">💳 Todos los métodos</option>
              <option value="efectivo">💵 Efectivo</option>
              <option value="tarjeta">💳 Tarjeta</option>
              <option value="transferencia">🏦 Transferencia</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Row 2: Custom Date Pickers */}
          {dateFilter === 'custom' && (
            <div className="flex flex-wrap items-center gap-3 p-3 bg-stone-50 rounded-xs border border-stone-200 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-600 font-semibold">Desde:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1 bg-white border border-stone-300 rounded-xs text-xs text-stone-800"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-600 font-semibold">Hasta:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1 bg-white border border-stone-300 rounded-xs text-xs text-stone-800"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="text-xs text-[#a83b24] hover:underline cursor-pointer"
                >
                  Limpiar fechas
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sales List Table */}
      {filteredSales.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-sm border border-stone-200 shadow-xs">
          <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif-title text-lg font-bold text-stone-800">
            No se encontraron ventas
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
            {sales.length === 0
              ? 'Aún no has registrado ninguna venta en Firestore. Registra tu primera orden para comenzar el control financiero.'
              : 'No hay ventas que coincidan con los filtros seleccionados.'}
          </p>
          {sales.length === 0 && (
            <button
              onClick={onOpenNewSale}
              className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-[#a83b24] hover:bg-[#91321d] text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar primera venta</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-stone-200 shadow-xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  <th className="py-3.5 px-4">ID Venta</th>
                  <th className="py-3.5 px-4">Fecha & Hora</th>
                  <th className="py-3.5 px-4">Cliente / Mesa</th>
                  <th className="py-3.5 px-4">Productos Vendidos</th>
                  <th className="py-3.5 px-4">Método de Pago</th>
                  <th className="py-3.5 px-4 text-right">Total (USD)</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {filteredSales.map((sale) => {
                  const isExpanded = expandedSaleId === sale.id;
                  const totalItemsCount = sale.items.reduce((s, i) => s + i.cantidad, 0);

                  return (
                    <React.Fragment key={sale.id}>
                      <tr className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-stone-800">
                          #{sale.id.substring(0, 8)}
                        </td>

                        <td className="py-3.5 px-4 text-stone-600 whitespace-nowrap">
                          {formatFechaHora(sale)}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-stone-900">
                            {sale.clienteNombre || 'Comensal en mesa'}
                          </div>
                          {sale.mesa && (
                            <span className="text-[11px] text-stone-500 block">
                              📍 {sale.mesa}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setExpandedSaleId(isExpanded ? null : sale.id)}
                            className="inline-flex items-center gap-1 text-stone-700 hover:text-[#a83b24] font-medium transition-colors cursor-pointer"
                          >
                            <span className="font-bold">{totalItemsCount} platillos</span>
                            <span className="text-stone-400">({sale.items.length} ítems)</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getMethodBadge(sale.metodoPago)}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span className="font-serif-title font-bold text-sm text-[#a83b24]">
                            ${sale.total.toFixed(2)}
                          </span>{' '}
                          <span className="text-[10px] text-stone-400">USD</span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center space-x-1.5">
                            <button
                              onClick={() => onEditSale(sale)}
                              className="p-1.5 rounded-xs border border-stone-300 hover:border-stone-400 bg-white text-stone-700 transition-colors cursor-pointer"
                              title="Editar Venta"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSaleToDelete(sale)}
                              className="p-1.5 rounded-xs border border-red-200 hover:border-red-300 bg-red-50 text-red-700 transition-colors cursor-pointer"
                              title="Eliminar Venta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Items Drawer Row */}
                      {isExpanded && (
                        <tr className="bg-stone-50/80">
                          <td colSpan={7} className="p-4 border-y border-stone-200">
                            <div className="bg-white p-4 rounded-xs border border-stone-200 space-y-2">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                                Desglose de Productos - Venta #{sale.id}
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {sale.items.map((item, idx) => (
                                  <div key={idx} className="p-2.5 bg-stone-50 rounded-xs border border-stone-200 flex justify-between items-center text-xs">
                                    <div>
                                      <p className="font-bold text-stone-900">{item.nombre}</p>
                                      <p className="text-[11px] text-stone-500">
                                        {item.cantidad} x ${item.precioUnitario.toFixed(2)} USD
                                      </p>
                                    </div>
                                    <span className="font-bold text-stone-900 font-mono">
                                      ${item.subtotal.toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {sale.notas && (
                                <p className="text-xs text-stone-500 italic mt-2">
                                  Nota: "{sale.notas}"
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-stone-200">
            {filteredSales.map((sale) => (
              <div key={sale.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-stone-900 block">
                      #{sale.id.substring(0, 8)}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {formatFechaHora(sale)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif-title font-bold text-base text-[#a83b24]">
                      ${sale.total.toFixed(2)} USD
                    </span>
                    <div className="mt-0.5">{getMethodBadge(sale.metodoPago)}</div>
                  </div>
                </div>

                <div className="bg-stone-50 p-2.5 rounded-xs border border-stone-200 text-xs space-y-1">
                  <div className="font-semibold text-stone-800">
                    {sale.clienteNombre || 'Comensal'} {sale.mesa ? `(${sale.mesa})` : ''}
                  </div>
                  <ul className="text-stone-600 divide-y divide-stone-200/60 pt-1">
                    {sale.items.map((item, idx) => (
                      <li key={idx} className="py-1 flex justify-between items-center text-xs">
                        <span>{item.cantidad}x {item.nombre}</span>
                        <span className="font-mono font-semibold">${item.subtotal.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  {sale.notas && (
                    <p className="text-[11px] text-stone-500 italic pt-1">Nota: {sale.notas}</p>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    onClick={() => onEditSale(sale)}
                    className="px-3 py-1 border border-stone-300 rounded-xs text-xs font-semibold text-stone-700 bg-white"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setSaleToDelete(sale)}
                    className="px-3 py-1 border border-red-200 rounded-xs text-xs font-semibold text-red-600 bg-red-50/50 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para confirmar eliminación con código de seguridad 0000 */}
      {saleToDelete && (
        <DeleteSaleModal
          sale={saleToDelete}
          onClose={() => setSaleToDelete(null)}
          onSuccess={(msg) => onShowToast(msg, 'success')}
          onSaleDeleted={onSaleDeleted}
        />
      )}
    </div>
  );
};
