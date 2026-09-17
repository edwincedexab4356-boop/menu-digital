import React from 'react';
import { 
  Package, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  Sparkles,
  DollarSign,
  Plus,
  Receipt,
  Calendar,
  Wallet,
  ArrowDownRight,
  TrendingDown
} from 'lucide-react';
import { MenuItem } from '../../types';
import { CategoryItem } from '../../services/adminCategories';
import { Sale, Gasto } from '../../types/finance';

interface DashboardHomeViewProps {
  products: MenuItem[];
  categories: CategoryItem[];
  sales: Sale[];
  expenses: Gasto[];
  onNavigateTab: (tab: 'inicio' | 'productos' | 'secciones' | 'pedidos' | 'ventas' | 'gastos' | 'ganancias' | 'configuracion') => void;
  onAddProduct: () => void;
  onEditProduct: (product: MenuItem) => void;
  onNewSale: () => void;
  onNewExpense: () => void;
}

export const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({
  products,
  categories,
  sales,
  expenses,
  onNavigateTab,
  onAddProduct,
  onEditProduct,
  onNewSale,
  onNewExpense,
}) => {
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.available).length;
  const inactiveProducts = totalProducts - activeProducts;
  const totalCategories = categories.length;

  // Helper date boundaries
  const now = new Date();
  const getLocalDateStr = (d: Date = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayLocalStr = getLocalDateStr(now);
  const todayUtcStr = now.toISOString().split('T')[0];

  // Week boundary (Monday)
  const dayOfWeek = now.getDay() || 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
  const startOfWeekStr = getLocalDateStr(startOfWeek);

  // Month boundary
  const currentYear = now.getFullYear();
  const currentMonthStr = String(now.getMonth() + 1).padStart(2, '0');
  const monthPrefix = `${currentYear}-${currentMonthStr}`;

  // Helper to check if a sale/gasto matches today
  const isToday = (fecha: string) => fecha === todayLocalStr || fecha === todayUtcStr;

  // 1. Resumen Financiero Calculations:
  // - Ventas de hoy
  const ventasHoy = sales
    .filter((s) => isToday(s.fecha))
    .reduce((acc, s) => acc + s.total, 0);

  // - Ventas de esta semana
  const ventasSemana = sales
    .filter((s) => s.fecha >= startOfWeekStr)
    .reduce((acc, s) => acc + s.total, 0);

  // - Ventas de este mes
  const salesMes = sales.filter((s) => s.fecha.startsWith(monthPrefix));
  const ventasMes = salesMes.reduce((acc, s) => acc + s.total, 0);

  // - Gastos de este mes
  const expensesMes = expenses.filter((e) => e.fecha.startsWith(monthPrefix));
  const gastosMes = expensesMes.reduce((acc, e) => acc + e.monto, 0);

  // - Ganancia estimada del mes = Ventas - Gastos
  const gananciaMes = ventasMes - gastosMes;

  // - Cantidad de ventas (total y este mes)
  const cantidadVentasTotal = sales.length;
  const cantidadVentasMes = salesMes.length;

  // - Cantidad de unidades/platillos vendidos (total y este mes)
  const totalUnidadesVendidas = sales.reduce((acc, s) => {
    if (Array.isArray(s.items) && s.items.length > 0) {
      return acc + s.items.reduce((sum, item) => sum + (Number(item.cantidad) || 1), 0);
    }
    return acc + (s.total > 0 ? 1 : 0);
  }, 0);

  const unidadesVendidasMes = salesMes.reduce((acc, s) => {
    if (Array.isArray(s.items) && s.items.length > 0) {
      return acc + s.items.reduce((sum, item) => sum + (Number(item.cantidad) || 1), 0);
    }
    return acc + (s.total > 0 ? 1 : 0);
  }, 0);

  // Recent products & recent sales
  const recentProducts = [...products].slice(0, 5);
  const recentSales = [...sales].slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-[#1c1917] to-stone-900 rounded-sm p-6 text-white border border-stone-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#d97706]" />
            <span className="text-[11px] uppercase tracking-widest text-[#d97706] font-bold">
              Panel Administrativo y Financiero
            </span>
          </div>
          <h2 className="font-serif-title text-2xl sm:text-3xl font-bold">
            Delicias Belgi · Control General
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            Gestiona la carta, registra consumos, monitorea gastos operativos y consulta la ganancia neta en tiempo real con Cloud Firestore.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onNewSale}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#a83b24] hover:bg-[#91321d] text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Registrar Venta</span>
          </button>
          <button
            onClick={onNewExpense}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Registrar Gasto</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: RESUMEN FINANCIERO (Cards Requeridas por el Usuario) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-[#a83b24]" />
            <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-900">
              Resumen Financiero (USD)
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('ganancias')}
            className="text-xs font-bold uppercase tracking-wider text-[#a83b24] hover:text-[#91321d] flex items-center gap-1 cursor-pointer"
          >
            <span>Ver análisis completo</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {/* Card 1: Ventas de hoy */}
          <div 
            onClick={() => onNavigateTab('ventas')}
            className="bg-white p-4 rounded-sm border border-stone-200 hover:border-stone-400 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Ventas de Hoy
              </span>
              <div className="w-7 h-7 rounded-xs bg-stone-100 group-hover:bg-[#a83b24] group-hover:text-white text-stone-600 flex items-center justify-center transition-colors">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="font-serif-title text-2xl font-bold text-stone-900">
                ${ventasHoy.toFixed(2)}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">USD hoy</span>
            </div>
          </div>

          {/* Card 2: Ventas de esta semana */}
          <div 
            onClick={() => onNavigateTab('ventas')}
            className="bg-white p-4 rounded-sm border border-stone-200 hover:border-stone-400 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Ventas Esta Semana
              </span>
              <div className="w-7 h-7 rounded-xs bg-stone-100 group-hover:bg-[#a83b24] group-hover:text-white text-stone-600 flex items-center justify-center transition-colors">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="font-serif-title text-2xl font-bold text-stone-900">
                ${ventasSemana.toFixed(2)}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">USD semana</span>
            </div>
          </div>

          {/* Card 3: Ventas de este mes */}
          <div 
            onClick={() => onNavigateTab('ventas')}
            className="bg-white p-4 rounded-sm border border-stone-200 hover:border-emerald-300 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Ventas Este Mes
              </span>
              <div className="w-7 h-7 rounded-xs bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="font-serif-title text-2xl font-bold text-emerald-800">
                ${ventasMes.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">USD acumulado</span>
            </div>
          </div>

          {/* Card 4: Gastos de este mes */}
          <div 
            onClick={() => onNavigateTab('gastos')}
            className="bg-white p-4 rounded-sm border border-stone-200 hover:border-amber-300 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Gastos Este Mes
              </span>
              <div className="w-7 h-7 rounded-xs bg-amber-50 text-amber-700 flex items-center justify-center">
                <Receipt className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="font-serif-title text-2xl font-bold text-amber-900">
                ${gastosMes.toFixed(2)}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">{expensesMes.length} egresos</span>
            </div>
          </div>

          {/* Card 5: Ganancia estimada del mes (Ventas - Gastos) */}
          <div 
            onClick={() => onNavigateTab('ganancias')}
            className="bg-white p-4 rounded-sm border-2 border-stone-800 hover:border-[#a83b24] transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-900">
                Ganancia Mes
              </span>
              <div className="w-7 h-7 rounded-xs bg-stone-900 text-[#d97706] flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className={`font-serif-title text-2xl font-bold ${gananciaMes >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                ${gananciaMes.toFixed(2)}
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">Ventas - Gastos</span>
            </div>
          </div>

          {/* Card 6: Cantidad de ventas y unidades vendidas */}
          <div 
            onClick={() => onNavigateTab('ventas')}
            className="bg-white p-4 rounded-sm border border-stone-200 hover:border-stone-400 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Total de Ventas
              </span>
              <div className="w-7 h-7 rounded-xs bg-stone-100 text-stone-600 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="font-serif-title text-2xl font-bold text-stone-900">
                {cantidadVentasTotal} {cantidadVentasTotal === 1 ? 'venta' : 'ventas'}
              </span>
              <span className="text-[11px] font-semibold text-[#a83b24] block mt-0.5">
                {totalUnidadesVendidas} {totalUnidadesVendidas === 1 ? 'platillo vendido' : 'platillos vendidos'}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                {cantidadVentasMes} este mes ({unidadesVendidasMes} platillos)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: ESTADO DEL MENÚ (Tarjetas de Productos y Secciones) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Total de productos */}
        <div 
          onClick={() => onNavigateTab('productos')}
          className="bg-white p-4 rounded-sm border border-stone-200 hover:border-stone-400 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Total Platillos
            </span>
            <div className="w-8 h-8 rounded-xs bg-stone-100 group-hover:bg-[#a83b24] group-hover:text-white text-stone-600 flex items-center justify-center transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif-title text-3xl font-bold text-stone-900">
              {totalProducts}
            </span>
            <span className="text-xs text-stone-400">en carta</span>
          </div>
        </div>

        {/* Card: Productos Activos */}
        <div 
          onClick={() => onNavigateTab('productos')}
          className="bg-white p-4 rounded-sm border border-stone-200 hover:border-emerald-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Disponibles
            </span>
            <div className="w-8 h-8 rounded-xs bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif-title text-3xl font-bold text-emerald-700">
              {activeProducts}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              {totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0}% disponible
            </span>
          </div>
        </div>

        {/* Card: Productos Inactivos */}
        <div 
          onClick={() => onNavigateTab('productos')}
          className="bg-white p-4 rounded-sm border border-stone-200 hover:border-amber-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Agotados
            </span>
            <div className="w-8 h-8 rounded-xs bg-stone-100 text-stone-500 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif-title text-3xl font-bold text-stone-700">
              {inactiveProducts}
            </span>
            <span className="text-xs text-stone-400">
              {inactiveProducts > 0 ? 'requiere reposición' : 'todo al día'}
            </span>
          </div>
        </div>

        {/* Card: Total de Secciones */}
        <div 
          onClick={() => onNavigateTab('secciones')}
          className="bg-white p-4 rounded-sm border border-stone-200 hover:border-amber-400 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Secciones Menú
            </span>
            <div className="w-8 h-8 rounded-xs bg-amber-50 group-hover:bg-[#d97706] group-hover:text-white text-[#d97706] flex items-center justify-center transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif-title text-3xl font-bold text-stone-900">
              {totalCategories}
            </span>
            <span className="text-xs text-stone-400">categorías</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: Recent Sales & Recent Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Últimas Ventas Registradas */}
        <div className="bg-white rounded-sm border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#a83b24]" />
                <span>Últimas Ventas</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Órdenes guardadas en Firestore
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('ventas')}
              className="text-xs font-bold uppercase tracking-wider text-[#a83b24] hover:text-[#91321d] flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todas ({sales.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {recentSales.length === 0 ? (
              <div className="p-8 text-center text-stone-400">
                Aún no hay ventas registradas. Pulsa "+ Registrar Venta".
              </div>
            ) : (
              recentSales.map((sale) => (
                <div key={sale.id} className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-stone-50/60 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900">
                        #{sale.id.substring(0, 8)}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-600 uppercase font-semibold">
                        {sale.metodoPago}
                      </span>
                    </div>
                    <p className="text-stone-500 text-[11px] mt-0.5">
                      {sale.items.length} ítems {sale.mesa ? `· ${sale.mesa}` : ''} · {sale.fecha}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-serif-title font-bold text-sm text-[#a83b24]">
                      ${sale.total.toFixed(2)} USD
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Productos en Carta */}
        <div className="bg-white rounded-sm border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-stone-600" />
                <span>Productos en Carta</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Colección 'productos'
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('productos')}
              className="text-xs font-bold uppercase tracking-wider text-[#a83b24] hover:text-[#91321d] flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos ({totalProducts})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {recentProducts.length === 0 ? (
              <div className="p-8 text-center text-stone-400">
                No hay productos en la carta.
              </div>
            ) : (
              recentProducts.map((product) => (
                <div key={product.id} className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-stone-50/60 transition-colors">
                  <div className="flex items-center space-x-3 min-w-0">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-10 h-10 rounded-xs object-cover border border-stone-200 shrink-0 bg-stone-100"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xs bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shrink-0 text-xs">
                        <Package className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                        {product.name}
                      </p>
                      <span className="text-[11px] text-stone-400">
                        ${product.price.toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        product.available
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-stone-100 text-stone-500 border-stone-200'
                      }`}
                    >
                      {product.available ? 'Activo' : 'Agotado'}
                    </span>
                    <button
                      onClick={() => onEditProduct(product)}
                      className="px-2.5 py-1 text-xs border border-stone-200 hover:border-stone-300 rounded-xs text-stone-700 bg-white hover:bg-stone-50 font-medium transition-colors cursor-pointer"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
