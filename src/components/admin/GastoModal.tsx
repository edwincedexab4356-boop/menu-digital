import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  Receipt, 
  Calendar, 
  Tag, 
  FileText, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { Gasto, GastoCategoria } from '../../types/finance';
import { createExpense, updateExpense } from '../../services/adminFinance';

const CATEGORIAS_GASTO: GastoCategoria[] = [
  'Ingredientes',
  'Empaques',
  'Servicios',
  'Transporte',
  'Publicidad',
  'Personal',
  'Otros',
];

interface GastoModalProps {
  isOpen: boolean;
  onClose: () => void;
  gastoToEdit?: Gasto | null;
  onSuccess: (msg: string) => void;
  userEmail?: string | null;
}

export const GastoModal: React.FC<GastoModalProps> = ({
  isOpen,
  onClose,
  gastoToEdit,
  onSuccess,
  userEmail,
}) => {
  const isEditing = Boolean(gastoToEdit);

  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<string>('Ingredientes');
  const [monto, setMonto] = useState<string>('');
  const [fecha, setFecha] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [nota, setNota] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (gastoToEdit) {
      setDescripcion(gastoToEdit.descripcion || '');
      setCategoria(gastoToEdit.categoria || 'Ingredientes');
      setMonto(String(gastoToEdit.monto || ''));
      setFecha(gastoToEdit.fecha || new Date().toISOString().split('T')[0]);
      setNota(gastoToEdit.nota || '');
    } else {
      setDescripcion('');
      setCategoria('Ingredientes');
      setMonto('');
      setFecha(new Date().toISOString().split('T')[0]);
      setNota('');
    }
    setError(null);
  }, [gastoToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedMonto = parseFloat(monto);
    if (isNaN(parsedMonto) || parsedMonto <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }

    if (!descripcion.trim()) {
      setError('La descripción del gasto es obligatoria');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        descripcion: descripcion.trim(),
        categoria,
        monto: parsedMonto,
        fecha: fecha || new Date().toISOString().split('T')[0],
        nota: nota.trim(),
        creadoPor: userEmail || 'admin',
      };

      if (isEditing && gastoToEdit) {
        await updateExpense(gastoToEdit.id, payload);
        onSuccess('Gasto actualizado exitosamente.');
      } else {
        await createExpense(payload);
        onSuccess('Gasto registrado exitosamente en Firestore.');
      }
      onClose();
    } catch (err: any) {
      console.error('Error al guardar gasto:', err);
      setError(err?.message || 'Error al guardar el gasto en Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-lg rounded-sm border border-stone-300 shadow-xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xs bg-amber-600 text-white flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-title text-xl font-bold text-stone-900">
                {isEditing ? 'Editar Gasto Operativo' : 'Registrar Nuevo Gasto'}
              </h2>
              <p className="text-xs text-stone-500">
                Lleva el control de costos, insumos y egresos del negocio
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xs transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
              Descripción del Gasto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Compra de harina, fresas y chocolate belga"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xs text-xs text-stone-900 focus:ring-1 focus:ring-[#a83b24]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xs text-xs text-stone-900 focus:ring-1 focus:ring-[#a83b24]"
              >
                {CATEGORIAS_GASTO.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Monto (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400 text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xs text-xs text-stone-900 focus:ring-1 focus:ring-[#a83b24]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
              Fecha del Gasto <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xs text-xs text-stone-900 focus:ring-1 focus:ring-[#a83b24]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
              Nota / Proveedor / Factura (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Factura #4492, proveedor Distribuidora Central..."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xs text-xs text-stone-900 focus:ring-1 focus:ring-[#a83b24]"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 flex items-center justify-end space-x-2 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border border-stone-300 rounded-xs text-xs font-semibold uppercase tracking-wider text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{isEditing ? 'Actualizar Gasto' : 'Guardar Gasto'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
