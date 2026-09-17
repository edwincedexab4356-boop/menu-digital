import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Award, 
  ShoppingBag, 
  Receipt, 
  BarChart3, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { Sale, Gasto } from '../../types/finance';
import { MenuItem } from '../../types';

interface FinanceAnalyticsViewProps {
  sales: Sale[];
  expenses: Gasto[];
  products: MenuItem[];
}

export const FinanceAnalyticsView: React.FC<FinanceAnalyticsViewProps> = ({
  sales,
  expenses,
  products,
}) => {
  const [rangeMode, setRangeMode] = useState<'hoy' | 'semana' | 'mes' | 'ano' | 'custom'>('mes');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Date calculation boundaries
  const now = new Date();
  const getLocalDateStr = (d: Date = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayLocalStr = getLocalDateStr(now);
  const todayUtcStr = now.toISOString().split('T')[0];
  const isToday = (fecha: string) => fecha === todayLocalStr || fecha === todayUtcStr;

  // Week boundary (Monday)
  const dayOfWeek = now.getDay() || 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
  const startOfWeekStr = getLocalDateStr(startOfWeek);

  // Month boundary
  const currentYear = now.getFullYear();
  const currentMonthStr = String(now.getMonth() + 1).padStart(2, '0');
  const monthPrefix = `${currentYear}-${currentMonthStr}`;

  // Year boundary
  const startOfYearStr = `${currentYear}-01-01`;

  // Filtered sales and expenses according to selected range
  const { filteredSales, filteredExpenses } = useMemo(() => {
    const isWithinRange = (fecha: string) => {
      if (rangeMode === 'hoy') return isToday(fecha);
      if (rangeMode === 'semana') return fecha >= startOfWeekStr;
      if (rangeMode === 'mes') return fecha.startsWith(monthPrefix);
      if (rangeMode === 'ano') return fecha >= startOfYearStr;
      if (rangeMode === 'custom') {
        if (customStart && fecha < customStart) return false;
        if (customEnd && fecha > customEnd) return false;
        return true;
      }
      return true;
    };

    return {
      filteredSales: sales.filter((s) => isWithinRange(s.fecha)),
      filteredExpenses: expenses.filter((g) => isWithinRange(g.fecha)),
    };
  }, [sales, expenses, rangeMode, customStart, customEnd, todayLocalStr, todayUtcStr, startOfWeekStr, monthPrefix, startOfYearStr]);

  // Aggregate values for current range
  const totalVentas = useMemo(() => filteredSales.reduce((acc, s) => acc + s.total, 0), [filteredSales]);
  const totalGastos = useMemo(() => filteredExpenses.reduce((acc, g) => acc + g.monto, 0), [filteredExpenses]);
  const gananciaEstimada = totalVentas - totalGastos;
  const margenGanancia = totalVentas > 0 ? (gananciaEstimada / totalVentas) * 100 : 0;

  // Fixed Periods (Hoy, Semana, Mes)
  const dailyMetrics = useMemo(() => {
    const s = sales.filter((s) => isToday(s.fecha)).reduce((acc, item) => acc + item.total, 0);
    const g = expenses.filter((e) => isToday(e.fecha)).reduce((acc, item) => acc + item.monto, 0);
    return { ventas: s, gastos: g, ganancia: s - g };
  }, [sales, expenses, todayLocalStr, todayUtcStr]);

  const weeklyMetrics = useMemo(() => {
    const s = sales.filter((s) => s.fecha >= startOfWeekStr).reduce((acc, item) => acc + item.total, 0);
    const g = expenses.filter((e) => e.fecha >= startOfWeekStr).reduce((acc, item) => acc + item.monto, 0);
    return { ventas: s, gastos: g, ganancia: s - g };
  }, [sales, expenses, startOfWeekStr]);

  const monthlyMetrics = useMemo(() => {
    const s = sales.filter((s) => s.fecha.startsWith(monthPrefix)).reduce((acc, item) => acc + item.total, 0);
    const g = expenses.filter((e) => e.fecha.startsWith(monthPrefix)).reduce((acc, item) => acc + item.monto, 0);
    return { ventas: s, gastos: g, ganancia: s - g };
  }, [sales, expenses, monthPrefix]);

  // 1. Chart: Ventas por día (últimos 14 días)
  const dailyChartData = useMemo(() => {
    const days: { label: string; fecha: string; ventas: number; gastos: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const localStr = getLocalDateStr(d);
      const iso = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });

      const dayVentas = sales
        .filter((s) => s.fecha === localStr || s.fecha === iso)
        .reduce((sum, s) => sum + s.total, 0);
      const dayGastos = expenses
        .filter((g) => g.fecha === localStr || g.fecha === iso)
        .reduce((sum, g) => sum + g.monto, 0);

      days.push({ label: dayLabel, fecha: iso, ventas: dayVentas, gastos: dayGastos });
    }
    return days;
  }, [sales, expenses, now]);

  const maxDailyValue = useMemo(() => {
    return Math.max(...dailyChartData.map((d) => Math.max(d.ventas, d.gastos)), 50);
  }, [dailyChartData]);

  // 2. Chart: Ventas y Ganancias por Mes (últimos 6 meses)
  const monthlyChartData = useMemo(() => {
    const monthsData: { monthKey: string; label: string; ventas: number; gastos: number; ganancia: number }[] = [];
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
      const label = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });

      const mVentas = sales
        .filter((s) => s.fecha.startsWith(monthPrefix))
        .reduce((sum, s) => sum + s.total, 0);
      const mGastos = expenses
        .filter((g) => g.fecha.startsWith(monthPrefix))
        .reduce((sum, g) => sum + g.monto, 0);

      monthsData.push({
        monthKey: monthPrefix,
        label,
        ventas: mVentas,
        gastos: mGastos,
        ganancia: mVentas - mGastos,
      });
    }
    return monthsData;
  }, [sales, expenses, now]);

  const maxMonthlyValue = useMemo(() => {
    return Math.max(...monthlyChartData.map((m) => Math.max(m.ventas, m.gastos, Math.abs(m.ganancia))), 100);
  }, [monthlyChartData]);

  // 3. Gastos por categoría (Desglose circular/barras)
  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((g) => {
      map[g.categoria] = (map[g.categoria] || 0) + g.monto;
    });
    return Object.entries(map)
      .map(([categoria, total]) => ({
        categoria,
        total,
        porcentaje: totalGastos > 0 ? (total / totalGastos) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenses, totalGastos]);

  // 4. Ranking de Productos Más Vendidos
  const topProducts = useMemo(() => {
    const map: Record<string, { id: string; nombre: string; cantidad: number; ingresos: number; categoria?: string }> = {};

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!map[item.productId]) {
          map[item.productId] = {
            id: item.productId,
            nombre: item.nombre,
            cantidad: 0,
            ingresos: 0,
            categoria: item.categoria,
          };
        }
        map[item.productId].cantidad += item.cantidad;
        map[item.productId].ingresos += item.subtotal;
      });
    });

    return Object.values(map).sort((a, b) => b.cantidad - a.cantidad);
  }, [filteredSales]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Date Range Selector Bar */}
      <div className="bg-white p-5 rounded-sm border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-serif-title text-2xl font-bold text-stone-900">
            Ganancias y Análisis Financiero
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Cálculo automático: <span className="font-semibold text-stone-700">Ventas totales - Gastos totales = Ganancia neta</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['hoy', 'semana', 'mes', 'ano', 'custom'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRangeMode(r)}
              className={`px-3 py-1.5 rounded-xs text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                rangeMode === r
                  ? 'bg-[#a83b24] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {r === 'hoy' && 'Hoy'}
              {r === 'semana' && 'Esta semana'}
              {r === 'mes' && 'Este mes'}
              {r === 'ano' && 'Este año'}
              {r === 'custom' && 'Rango personalizado'}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Pickers */}
      {rangeMode === 'custom' && (
        <div className="p-4 bg-white rounded-sm border border-stone-200 flex flex-wrap items-center gap-4 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-600">Desde:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 border border-stone-300 rounded-xs text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-600">Hasta:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 border border-stone-300 rounded-xs text-xs"
            />
          </div>
        </div>
      )}

      {/* Triad Metric Cards for Fixed Periods (Diaria, Semanal, Mensual) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ganancia Diaria */}
        <div className="bg-white p-5 rounded-sm border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Ganancia Diaria (Hoy)
            </span>
            <span className="text-[11px] font-mono text-stone-400">{todayLocalStr}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`font-serif-title text-2xl font-bold ${dailyMetrics.ganancia >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              ${dailyMetrics.ganancia.toFixed(2)} USD
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Ventas: <strong className="text-stone-800">${dailyMetrics.ventas.toFixed(2)}</strong></span>
            <span>Gastos: <strong className="text-amber-800">${dailyMetrics.gastos.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Ganancia Semanal */}
        <div className="bg-white p-5 rounded-sm border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Ganancia Semanal
            </span>
            <span className="text-[11px] font-semibold text-[#a83b24]">Semana en curso</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`font-serif-title text-2xl font-bold ${weeklyMetrics.ganancia >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              ${weeklyMetrics.ganancia.toFixed(2)} USD
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Ventas: <strong className="text-stone-800">${weeklyMetrics.ventas.toFixed(2)}</strong></span>
            <span>Gastos: <strong className="text-amber-800">${weeklyMetrics.gastos.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Ganancia Mensual */}
        <div className="bg-white p-5 rounded-sm border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Ganancia Mensual
            </span>
            <span className="text-[11px] font-semibold text-emerald-700">Mes actual</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`font-serif-title text-2xl font-bold ${monthlyMetrics.ganancia >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              ${monthlyMetrics.ganancia.toFixed(2)} USD
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Ventas: <strong className="text-stone-800">${monthlyMetrics.ventas.toFixed(2)}</strong></span>
            <span>Gastos: <strong className="text-amber-800">${monthlyMetrics.gastos.toFixed(2)}</strong></span>
          </div>
        </div>
      </div>

      {/* Selected Range KPI Banner */}
      <div className="bg-stone-900 text-white p-6 rounded-sm border border-stone-800 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
              Ventas del Periodo
            </span>
            <span className="font-serif-title text-3xl font-bold text-white mt-1 block">
              ${totalVentas.toFixed(2)}
            </span>
            <span className="text-xs text-stone-400 mt-1 block">
              {filteredSales.length} transacciones registradas
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
              Gastos del Periodo
            </span>
            <span className="font-serif-title text-3xl font-bold text-amber-400 mt-1 block">
              ${totalGastos.toFixed(2)}
            </span>
            <span className="text-xs text-stone-400 mt-1 block">
              {filteredExpenses.length} egresos reportados
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
              Ganancia Estimada
            </span>
            <span className={`font-serif-title text-3xl font-bold mt-1 block ${gananciaEstimada >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ${gananciaEstimada.toFixed(2)}
            </span>
            <span className="text-xs text-stone-400 mt-1 block">
              Ventas - Gastos
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
              Margen de Ganancia
            </span>
            <span className="font-serif-title text-3xl font-bold text-[#d97706] mt-1 block">
              {margenGanancia.toFixed(1)}%
            </span>
            <span className="text-xs text-stone-400 mt-1 block">
              Rendimiento neto sobre ventas
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Ventas por día (últimos 14 días) */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif-title text-lg font-bold text-stone-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#a83b24]" />
                <span>Ventas y Gastos por Día</span>
              </h3>
              <p className="text-xs text-stone-500">Últimos 14 días calendario</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs bg-[#a83b24] inline-block"></span> Ventas
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block"></span> Gastos
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end gap-2 pt-6 pb-2 border-b border-stone-200 overflow-x-auto">
            {dailyChartData.map((d, idx) => {
              const ventasHeight = maxDailyValue > 0 ? (d.ventas / maxDailyValue) * 100 : 0;
              const gastosHeight = maxDailyValue > 0 ? (d.gastos / maxDailyValue) * 100 : 0;

              return (
                <div key={idx} className="flex-1 min-w-[28px] flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 z-20 hidden group-hover:block bg-stone-900 text-white text-[10px] p-1.5 rounded shadow-lg whitespace-nowrap">
                    <p className="font-bold">{d.fecha}</p>
                    <p className="text-emerald-300">Ventas: ${d.ventas.toFixed(2)}</p>
                    <p className="text-amber-300">Gastos: ${d.gastos.toFixed(2)}</p>
                  </div>

                  <div className="w-full flex items-end justify-center gap-0.5 h-full">
                    {/* Ventas bar */}
                    <div
                      style={{ height: `${Math.max(ventasHeight, 4)}%` }}
                      className={`w-1/2 rounded-t-xs transition-all ${
                        d.ventas > 0 ? 'bg-[#a83b24] group-hover:bg-[#8f321e]' : 'bg-stone-200'
                      }`}
                    />
                    {/* Gastos bar */}
                    <div
                      style={{ height: `${Math.max(gastosHeight, 4)}%` }}
                      className={`w-1/2 rounded-t-xs transition-all ${
                        d.gastos > 0 ? 'bg-amber-500 group-hover:bg-amber-600' : 'bg-stone-100'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-stone-500 mt-1 truncate w-full text-center">
                    {d.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 2: Ganancias y Ventas por Mes (últimos 6 meses) */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif-title text-lg font-bold text-stone-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>Ventas y Ganancias por Mes</span>
              </h3>
              <p className="text-xs text-stone-500">Histórico de los últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs bg-stone-800 inline-block"></span> Ventas
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block"></span> Ganancia
              </span>
            </div>
          </div>

          <div className="h-64 flex items-end gap-3 pt-6 pb-2 border-b border-stone-200">
            {monthlyChartData.map((m, idx) => {
              const ventasHeight = maxMonthlyValue > 0 ? (m.ventas / maxMonthlyValue) * 100 : 0;
              const gananciaHeight = maxMonthlyValue > 0 ? (Math.max(0, m.ganancia) / maxMonthlyValue) * 100 : 0;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-14 z-20 hidden group-hover:block bg-stone-900 text-white text-[10px] p-2 rounded shadow-lg whitespace-nowrap">
                    <p className="font-bold">{m.monthKey}</p>
                    <p>Ventas: ${m.ventas.toFixed(2)}</p>
                    <p>Gastos: ${m.gastos.toFixed(2)}</p>
                    <p className="text-emerald-300 font-bold">Ganancia: ${m.ganancia.toFixed(2)}</p>
                  </div>

                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Ventas */}
                    <div
                      style={{ height: `${Math.max(ventasHeight, 4)}%` }}
                      className={`w-1/2 rounded-t-xs transition-all ${
                        m.ventas > 0 ? 'bg-stone-800 group-hover:bg-stone-900' : 'bg-stone-200'
                      }`}
                    />
                    {/* Ganancia */}
                    <div
                      style={{ height: `${Math.max(gananciaHeight, 4)}%` }}
                      className={`w-1/2 rounded-t-xs transition-all ${
                        m.ganancia > 0 ? 'bg-emerald-600 group-hover:bg-emerald-700' : 'bg-stone-200'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-stone-600 mt-1 uppercase">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 3: Gastos por Categoría */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif-title text-lg font-bold text-stone-900 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-amber-600" />
                <span>Distribución de Gastos por Categoría</span>
              </h3>
              <p className="text-xs text-stone-500">¿En qué se está invirtiendo el presupuesto?</p>
            </div>
            <span className="font-bold text-amber-800 text-sm font-serif-title">
              Total: ${totalGastos.toFixed(2)} USD
            </span>
          </div>

          {expensesByCategory.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              No hay gastos registrados en este periodo.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {expensesByCategory.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                      {cat.categoria}
                    </span>
                    <span className="font-mono text-stone-600">
                      <strong>${cat.total.toFixed(2)}</strong> ({cat.porcentaje.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${cat.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION: PRODUCTOS MÁS VENDIDOS */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif-title text-lg font-bold text-stone-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#d97706]" />
                <span>Productos Más Vendidos</span>
              </h3>
              <p className="text-xs text-stone-500">Ranking por cantidad de unidades consumidas</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
              {topProducts.length} platillos vendidos
            </span>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              No hay ventas registradas en este periodo para calcular el ranking.
            </div>
          ) : (
            <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1">
              {topProducts.map((prod, index) => (
                <div key={prod.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                        index === 0
                          ? 'bg-amber-400 text-stone-900'
                          : index === 1
                          ? 'bg-stone-300 text-stone-800'
                          : index === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-stone-900">{prod.nombre}</p>
                      {prod.categoria && (
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                          {prod.categoria}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-stone-900 font-mono block">
                      {prod.cantidad} {prod.cantidad === 1 ? 'unidad' : 'unidades'}
                    </span>
                    <span className="text-[11px] text-[#a83b24] font-bold">
                      ${prod.ingresos.toFixed(2)} USD
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
