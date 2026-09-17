import React, { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { MenuItem } from '../../types';
import { deleteProduct } from '../../services/adminProducts';

interface DeleteConfirmModalProps {
  product: MenuItem | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  product,
  onClose,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteProduct(product.id);
      onSuccess(`El producto "${product.name}" ha sido eliminado de la carta.`);
      onClose();
    } catch (err: any) {
      console.error('Error deleting product from Firestore:', err);
      setError(err?.message || 'Error al eliminar el producto de Firestore.');
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
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 font-serif-title">
              ¿Seguro que deseas eliminar este producto?
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Esta acción eliminará el platillo de la colección <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px] font-mono">productos</code> de Firestore de forma permanente.
            </p>
          </div>
        </div>

        {/* Product preview banner */}
        <div className="p-3 bg-stone-50 rounded-xs border border-stone-200 mb-5 flex items-center space-x-3">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-12 h-12 rounded-xs object-cover border border-stone-300 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-xs bg-stone-200 border border-stone-300 shrink-0 flex items-center justify-center text-xs text-stone-500 font-bold">
              {product.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-stone-900 truncate">{product.name}</p>
            <p className="text-xs text-[#a83b24] font-semibold">${product.price.toFixed(2)} USD</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-stone-300 rounded-xs text-xs font-semibold uppercase tracking-wider text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xs text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <span>Eliminar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
