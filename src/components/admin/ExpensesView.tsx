import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Receipt, 
  Calendar, 
  Filter, 
  Edit3, 
  Trash2, 
  Tag, 
  TrendingDown, 
  DollarSign 
} from 'lucide-react';
import { Gasto, GastoCategoria } from '../../types/finance';
import { deleteExpense } from '../../services/adminFinance';

interface ExpensesViewProps {
  expenses: Gasto[];
  onOpenNewExpense: () => void;
  onEditExpense: (gasto: Gasto) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

const CATEGORIAS_LIST: (GastoCategoria | 'todas')[] = [
  'todas',
  'Ingredientes',
  'Empaques',
  'Servicios',
  'Transporte',
  'Publicidad',
  'Personal',
  'Otros',
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  onOpenNewExpense,
  onEditExpense,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [dateFilter, setDateFilter] = useState<'todos' | 'hoy' | 'semana' | 'mes' | 'custom'>('todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Helper date boundaries
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const dayOfWeek = now.getDay() || 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
  const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const filteredExpenses = useMemo(() => {
    return expenses.filter((gasto) => {
      // Category filter
      if (selectedCategory !== 'todas' && gasto.categoria !== selectedCategory) {
        return false;
      }

      // Date filter
      if (dateFilter === 'hoy') {
        if (gasto.fecha !== todayStr) return false;
      } else if (dateFilter === 'semana') {
        if (gasto.fecha < startOfWeekStr || gasto.fecha > todayStr) return false;
      } else if (dateFilter === 'mes') {
        if (gasto.fecha < startOfMonthStr || gasto.fecha > todayStr) return false;
      } else if (dateFilter === 'custom') {
        if (startDate && gasto.fecha < startDate) return false;
        if (endDate && gasto.fecha > endDate) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesDesc = (gasto.descripcion || '').toLowerCase().includes(q);
        const matchesNota = (gasto.nota || '').toLowerCase().includes(q);
        const matchesCat = (gasto.categoria || '').toLowerCase().includes(q);
        if (!matchesDesc && !matchesNota && !matchesCat) return false;
      }

      return true;
    });
  }, [expenses, selectedCategory, dateFilter, startDate, endDate, searchQuery, todayStr, startOfWeekStr, startOfMonthStr]);

  const totalGastos = useMemo(() => {
    return filteredExpenses.reduce((acc, g) => acc + (g.monto || 0), 0);
  }, [filteredExpenses]);

  // Breakdown by category for current view
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((g) => {
      map[g.categoria] = (map[g.categoria] || 0) + g.monto;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  const handleDelete = async (gastoId: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este gasto de Firestore?')) {
      return;
    }
    setDeletingId(gastoId);
    try {
      await deleteExpense(gastoId);
      onShowToast('Gasto eliminado exitosamente.', 'success');
    } catch (err: any) {
      console.error('Error al eliminar gasto:', err);
      onShowToast(err?.message || 'Error al eliminar el gasto.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Ingredientes':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Empaques':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Servicios':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'Transporte':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Publicidad':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Personal':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-title text-2xl font-bold text-stone-900">
                Control de Gastos
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {filteredExpenses.length} egresos
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Registra costos operativos, compra de insumos, empaques, servicios y mano de obra.
            </p>
          </div>

          <button
            onClick={onOpenNewExpense}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xs text-xs font-bold uppercase tracking-widest transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Registrar Gasto</span>
          </button>
        </div>

        {/* Total stats card */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-stone-100">
          <div className="p-3 bg-amber-50/60 rounded-xs border border-amber-200">
            <span className="text-[11px] uppercase tracking-wider text-amber-800 font-semibold block">
              Total Gastos Filtrados
            </span>
            <span className="font-serif-title text-xl font-bold text-amber-900">
              ${totalGastos.toFixed(2)} USD
            </span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xs border border-stone-200">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
              Egresos Registrados
            </span>
            <span className="font-serif-title text-xl font-bold text-stone-800">
              {filteredExpenses.length} comprobantes
            </span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xs border border-stone-200">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
              Categoría con Mayor Gasto
            </span>
            <span className="font-serif-title text-sm font-bold text-stone-800 truncate block">
              {categoryBreakdown.length > 0
                ? `${categoryBreakdown[0][0]} ($${categoryBreakdown[0][1].toFixed(2)})`
                : 'Sin registros'}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 space-y-3 pt-4 border-t border-stone-100">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-4 h-4 text-stone-400 my-auto" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por descripción, nota o proveedor..."
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xs text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Date filter buttons */}
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
          </div>

          {/* Category Pill Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIAS_LIST.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xs text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat === 'todas' ? 'Todas las categorías' : cat}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
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
                  className="text-xs text-amber-700 hover:underline cursor-pointer"
                >
                  Limpiar fechas
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expenses Table */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-sm border border-stone-200 shadow-xs">
          <Receipt className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif-title text-lg font-bold text-stone-800">
            No se encontraron gastos
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
            {expenses.length === 0
              ? 'No hay egresos registrados aún. Comienza registrando compras de ingredientes o empaques.'
              : 'No hay gastos que coincidan con la búsqueda o filtro aplicado.'}
          </p>
          {expenses.length === 0 && (
            <button
              onClick={onOpenNewExpense}
              className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar primer gasto</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-stone-200 shadow-xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Descripción</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Nota / Proveedor</th>
                  <th className="py-3.5 px-4 text-right">Monto (USD)</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {filteredExpenses.map((gasto) => (
                  <tr key={gasto.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-stone-600 font-medium">
                      {gasto.fecha}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {gasto.descripcion}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wide border ${getCategoryColor(gasto.categoria)}`}>
                        {gasto.categoria}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-stone-500 truncate">
                      {gasto.nota || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-serif-title font-bold text-sm text-amber-800">
                        ${gasto.monto.toFixed(2)}
                      </span>{' '}
                      <span className="text-[10px] text-stone-400">USD</span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          onClick={() => onEditExpense(gasto)}
                          className="p-1.5 rounded-xs border border-stone-300 hover:border-stone-400 bg-white text-stone-700 transition-colors cursor-pointer"
                          title="Editar Gasto"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(gasto.id)}
                          disabled={deletingId === gasto.id}
                          className="p-1.5 rounded-xs border border-red-200 hover:border-red-300 bg-red-50 text-red-700 transition-colors cursor-pointer"
                          title="Eliminar Gasto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-stone-200">
            {filteredExpenses.map((gasto) => (
              <div key={gasto.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">
                      {gasto.descripcion}
                    </h4>
                    <span className="text-[11px] text-stone-500">
                      {gasto.fecha}
                    </span>
                  </div>
                  <span className="font-serif-title font-bold text-sm text-amber-800">
                    ${gasto.monto.toFixed(2)} USD
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wide border ${getCategoryColor(gasto.categoria)}`}>
                    {gasto.categoria}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditExpense(gasto)}
                      className="px-2.5 py-1 border border-stone-300 rounded-xs text-xs font-semibold text-stone-700 bg-white"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(gasto.id)}
                      className="px-2.5 py-1 border border-red-200 rounded-xs text-xs font-semibold text-red-600 bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                {gasto.nota && (
                  <p className="text-xs text-stone-500 italic bg-stone-50 p-2 rounded-xs">
                    {gasto.nota}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
