import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  FolderPlus,
  RefreshCw,
  Search
} from 'lucide-react';
import { MenuItem } from '../../types';
import { CategoryItem } from '../../services/adminCategories';

interface SectionsManagementViewProps {
  categories: CategoryItem[];
  products: MenuItem[];
  onAddCategory: (name: string) => Promise<string>;
  onUpdateCategory: (id: string, newName: string) => Promise<void>;
  onRemoveCategory: (id: string) => Promise<void>;
  onNavigateToProductsWithCategory: (category: string) => void;
  onQuickReassign: (productId: string, newCategory: string) => Promise<void>;
}

export const SectionsManagementView: React.FC<SectionsManagementViewProps> = ({
  categories,
  products,
  onAddCategory,
  onUpdateCategory,
  onRemoveCategory,
  onNavigateToProductsWithCategory,
  onQuickReassign,
}) => {
  const [newSectionName, setNewSectionName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [reassigningProductId, setReassigningProductId] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Product counts per category
  const productCounts = categories.reduce((acc, cat) => {
    acc[cat.id] = products.filter((p) => p.category === cat.id).length;
    return acc;
  }, {} as Record<string, number>);

  // Handle Add Section
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    setIsAdding(true);
    try {
      await onAddCategory(newSectionName.trim());
      showToast(`Sección "${newSectionName.trim()}" creada con éxito.`);
      setNewSectionName('');
    } catch (err: any) {
      showToast(err?.message || 'Error al crear la sección.', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Edit/Update Section Name
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;
    setIsUpdating(true);
    try {
      await onUpdateCategory(editingCategory.id, editName.trim());
      showToast(`Sección actualizada a "${editName.trim()}".`);
      setEditingCategory(null);
      setEditName('');
    } catch (err: any) {
      showToast(err?.message || 'Error al actualizar la sección.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Delete Section
  const handleDelete = async (cat: CategoryItem) => {
    const count = productCounts[cat.id] || 0;
    const warning = count > 0 
      ? `Hay ${count} platillo(s) asignados a la sección "${cat.nombre}". Si la eliminas, esos platillos continuarán existiendo en Firestore. ¿Deseas eliminar la sección?`
      : `¿Estás seguro de eliminar la sección "${cat.nombre}"?`;

    if (!window.confirm(warning)) return;

    setDeletingId(cat.id);
    try {
      await onRemoveCategory(cat.id);
      showToast(`Sección "${cat.nombre}" eliminada de Firestore.`);
    } catch (err: any) {
      showToast(err?.message || 'Error al eliminar la sección.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Products belonging to the selected section filter for quick reassignment
  const displayProducts = selectedSectionFilter === 'all'
    ? products
    : products.filter((p) => p.category === selectedSectionFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast */}
      {notification && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200 max-w-sm">
          <div
            className={`p-3.5 rounded-sm shadow-lg border flex items-center space-x-3 ${
              notification.type === 'success'
                ? 'bg-emerald-800 text-white border-emerald-900'
                : 'bg-red-800 text-white border-red-900'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-300 shrink-0" />
            )}
            <p className="text-xs font-medium flex-1">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-title text-2xl font-bold text-stone-900">
              Administración de Secciones
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {categories.length} categorías
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Organiza la estructura de la carta: crea nuevas secciones (Heladería, Dulcería, Cafetería), renómbralas o reasigna platillos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & Category List */}
        <div className="space-y-6">
          {/* Create Section Form */}
          <div className="bg-white p-5 rounded-sm border border-stone-200 shadow-xs space-y-3">
            <h3 className="font-serif-title text-base font-bold text-stone-900 flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-[#a83b24]" />
              <span>Crear Nueva Sección</span>
            </h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Ej. Heladería, Cafetería, Cócteles..."
                disabled={isAdding}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xs text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#a83b24] focus:border-[#a83b24]"
              />
              <button
                type="submit"
                disabled={isAdding || !newSectionName.trim()}
                className="w-full py-2 bg-[#a83b24] hover:bg-[#91321d] text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Guardar Sección</span>
              </button>
            </form>
          </div>

          {/* List of Current Categories */}
          <div className="bg-white rounded-sm border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-stone-100 bg-stone-50/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Secciones Actuales ({categories.length})
              </h3>
            </div>
            <div className="divide-y divide-stone-100 max-h-[500px] overflow-y-auto">
              {categories.map((cat) => {
                const count = productCounts[cat.id] || 0;
                const isDeleting = deletingId === cat.id;
                const isCurrentEditing = editingCategory?.id === cat.id;

                if (isCurrentEditing) {
                  return (
                    <form 
                      key={cat.id} 
                      onSubmit={handleUpdate}
                      className="p-3 bg-amber-50/50 border-l-2 border-amber-500 space-y-2"
                    >
                      <span className="text-[10px] font-bold uppercase text-stone-500">
                        Editando nombre de: {cat.id}
                      </span>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-xs text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#a83b24]"
                        autoFocus
                      />
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isUpdating || !editName.trim()}
                          className="px-3 py-1 bg-stone-900 text-white rounded-xs text-xs font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                        >
                          {isUpdating ? 'Guardando...' : 'Actualizar'}
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={cat.id}
                    className="p-3.5 flex items-center justify-between hover:bg-stone-50/70 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-stone-900 text-sm truncate">
                        {cat.nombre}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-semibold text-stone-500">
                          {count} {count === 1 ? 'platillo' : 'platillos'}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-[10px] font-mono text-stone-400">
                          id: {cat.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {/* Edit Name */}
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setEditName(cat.nombre);
                        }}
                        className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xs transition-colors cursor-pointer hover:bg-stone-100"
                        title="Editar nombre de la sección"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={isDeleting}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded-xs transition-colors cursor-pointer hover:bg-red-50"
                        title="Eliminar sección"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Asignación de Platillos a Secciones */}
        <div className="lg:col-span-2 bg-white rounded-sm border border-stone-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-serif-title text-lg font-bold text-stone-900">
                Asignación & Reubicación de Platillos
              </h3>
              <p className="text-xs text-stone-400">
                Cambia fácilmente un platillo de sección o categoría sin tener que editarlo completamente
              </p>
            </div>

            {/* Filter by Category */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Filtrar:</span>
              <select
                value={selectedSectionFilter}
                onChange={(e) => setSelectedSectionFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-xs text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#a83b24]"
              >
                <option value="all">Todas las secciones ({products.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({productCounts[c.id] || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table of products with category select dropdown */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  <th className="py-2.5 px-3">Platillo</th>
                  <th className="py-2.5 px-3">Precio</th>
                  <th className="py-2.5 px-3">Sección Actual</th>
                  <th className="py-2.5 px-3">Reasignar a Sección</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {displayProducts.map((product) => {
                  const isReassigning = reassigningProductId === product.id;
                  return (
                    <tr key={product.id} className="hover:bg-stone-50/60">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2.5">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-8 h-8 rounded-xs object-cover border border-stone-200 shrink-0 bg-stone-100"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-xs bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                              <Package className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <span className="font-bold text-stone-900 truncate max-w-[200px]">
                            {product.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 font-semibold text-[#a83b24] whitespace-nowrap">
                        ${product.price.toFixed(2)} USD
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                          {categories.find((c) => c.id === product.category)?.nombre || product.category}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <select
                            disabled={isReassigning}
                            value={product.category}
                            onChange={async (e) => {
                              const newCat = e.target.value;
                              if (newCat === product.category) return;
                              setReassigningProductId(product.id);
                              try {
                                await onQuickReassign(product.id, newCat);
                                showToast(`"${product.name}" reasignado a "${categories.find(c => c.id === newCat)?.nombre || newCat}".`);
                              } catch (err: any) {
                                showToast(err?.message || 'Error al reasignar platillo.', 'error');
                              } finally {
                                setReassigningProductId(null);
                              }
                            }}
                            className="px-2.5 py-1 bg-stone-50 border border-stone-300 rounded-xs text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#a83b24]"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.nombre}
                              </option>
                            ))}
                          </select>
                          {isReassigning && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#a83b24]" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
