import React, { useState } from 'react';
import { X, Plus, Trash2, Layers, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { CategoryItem } from '../../services/adminCategories';

interface ManageSectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onAddCategory: (name: string) => Promise<string>;
  onRemoveCategory: (id: string) => Promise<void>;
  productCountsByCategory: Record<string, number>;
}

export const ManageSectionsModal: React.FC<ManageSectionsModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onRemoveCategory,
  productCountsByCategory,
}) => {
  const [newSectionName, setNewSectionName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!newSectionName.trim()) {
      setError('Escribe el nombre de la sección.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddCategory(newSectionName.trim());
      setSuccess(`Sección "${newSectionName.trim()}" agregada correctamente.`);
      setNewSectionName('');
    } catch (err: any) {
      setError(err?.message || 'Error al crear la sección.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (cat: CategoryItem) => {
    setError(null);
    setSuccess(null);
    const count = productCountsByCategory[cat.id] || 0;
    const warning = count > 0 
      ? `Hay ${count} producto(s) en esta sección. Si la eliminas, esos productos quedarán sin sección específica. ¿Deseas continuar?`
      : `¿Estás seguro de eliminar la sección "${cat.nombre}"?`;

    if (!window.confirm(warning)) {
      return;
    }

    setDeletingId(cat.id);
    try {
      await onRemoveCategory(cat.id);
      setSuccess(`Sección "${cat.nombre}" eliminada correctamente.`);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar la sección.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-lg rounded-sm border border-stone-300 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xs bg-[#1c1917] flex items-center justify-center text-white">
              <Layers className="w-4 h-4 text-[#d97706]" />
            </div>
            <div>
              <h3 className="font-serif-title text-lg font-bold text-stone-900">
                Gestionar Secciones del Menú
              </h3>
              <p className="text-xs text-stone-500">
                Agrega o quita secciones y categorías (ej. Heladería, Dulcería, Cafetería)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xs transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Form to Add Section */}
          <form onSubmit={handleAdd} className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Crear Nueva Sección
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Ej. Heladería, Bebidas Frías, Dulcería..."
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xs text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#a83b24] focus:border-[#a83b24]"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newSectionName.trim()}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#a83b24] hover:bg-[#91321d] text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Agregar</span>
              </button>
            </div>
          </form>

          {/* Current Sections List */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Secciones Actuales ({categories.length})
            </h4>

            <div className="divide-y divide-stone-100 border border-stone-200 rounded-xs bg-stone-50/50 max-h-60 overflow-y-auto">
              {categories.map((cat) => {
                const count = productCountsByCategory[cat.id] || 0;
                const isDeleting = deletingId === cat.id;
                return (
                  <div
                    key={cat.id}
                    className="p-3 flex items-center justify-between hover:bg-white transition-colors"
                  >
                    <div>
                      <span className="text-sm font-semibold text-stone-900 block">
                        {cat.nombre}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {count} {count === 1 ? 'platillo asignado' : 'platillos asignados'} • ID: {cat.id}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(cat)}
                      disabled={isDeleting}
                      className="text-stone-400 hover:text-red-600 p-1.5 rounded-xs transition-colors cursor-pointer hover:bg-red-50"
                      title={`Eliminar sección ${cat.nombre}`}
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xs text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
