import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Loader2, X, ShieldAlert, Lock } from 'lucide-react';
import { Sale } from '../../types/finance';
import { deleteSale } from '../../services/adminFinance';

interface DeleteSaleModalProps {
  sale: Sale | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onSaleDeleted?: (saleId: string) => void;
}

export const DeleteSaleModal: React.FC<DeleteSaleModalProps> = ({
  sale,
  onClose,
  onSuccess,
  onSaleDeleted,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sale) {
      setCode('');
      setError(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [sale]);

  if (!sale) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code.trim() !== '0000') {
      setError('Código de seguridad incorrecto. Debe ingresar el código 0000 para eliminar la venta.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSale(sale.id);
      if (onSaleDeleted) {
        onSaleDeleted(sale.id);
      }
      onSuccess(`Venta #${sale.id.substring(0, 8)} eliminada correctamente.`);
      onClose();
    } catch (err: any) {
      console.error('Error al eliminar venta de Firestore:', err);
      setError(err?.message || 'Error al eliminar la venta de Firestore.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-md rounded-sm border border-stone-300 shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Close icon */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex items-start space-x-3.5 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 font-serif-title">
              Confirmar eliminación de venta
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Esta acción eliminará el registro de la colección <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px] font-mono">ventas</code> de forma permanente.
            </p>
          </div>
        </div>

        {/* Sale Summary Box */}
        <div className="bg-stone-50 rounded-xs border border-stone-200 p-3 mb-4 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-stone-500 font-medium">Venta ID:</span>
            <span className="font-mono font-bold text-stone-800">#{sale.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-medium">Total:</span>
            <span className="font-bold text-[#a83b24] text-sm font-serif-title">${sale.total.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-medium">Cliente / Mesa:</span>
            <span className="text-stone-800">{sale.clienteNombre || 'Comensal'} {sale.mesa ? `(${sale.mesa})` : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-medium">Fecha:</span>
            <span className="text-stone-700">{sale.fecha}</span>
          </div>
        </div>

        {/* Form with security code */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              <span>Código de seguridad</span>
            </label>
            <p className="text-[11px] text-stone-500 mb-2">
              Ingrese el código de 4 dígitos para autorizar la eliminación:
            </p>
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError(null);
              }}
              placeholder="0000"
              disabled={isDeleting}
              className="w-full text-center tracking-[0.4em] font-mono text-lg font-bold py-2.5 px-3 bg-white border border-stone-300 rounded-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all disabled:bg-stone-100"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-xs border border-stone-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isDeleting || code.length === 0}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded-xs transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <span>Eliminar venta</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
