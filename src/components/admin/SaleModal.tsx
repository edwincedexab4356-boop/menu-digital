import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  DollarSign, 
  ShoppingBag, 
  CreditCard, 
  Banknote, 
  ArrowRight, 
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  User,
  UtensilsCrossed
} from 'lucide-react';
import { MenuItem } from '../../types';
import { Sale, SaleItem, MetodoPago } from '../../types/finance';
import { createSale, updateSale } from '../../services/adminFinance';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: MenuItem[];
  saleToEdit?: Sale | null;
  onSuccess: (msg: string) => void;
  userEmail?: string | null;
}

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  products,
  saleToEdit,
  onSuccess,
  userEmail,
}) => {
  const isEditing = Boolean(saleToEdit);
  const [items, setItems] = useState<SaleItem[]>(() => {
    if (saleToEdit && saleToEdit.items.length > 0) {
      return [...saleToEdit.items];
    }
    return [];
  });

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [fecha, setFecha] = useState<string>(() => {
    if (saleToEdit?.fecha) return saleToEdit.fecha;
    return new Date().toISOString().split('T')[0];
  });
  const [clienteNombre, setClienteNombre] = useState<string>('');
  const [mesa, setMesa] = useState<string>('');
  const [notas, setNotas] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state on open/edit
  React.useEffect(() => {
    if (saleToEdit) {
      setItems([...saleToEdit.items]);
      setMetodoPago(saleToEdit.metodoPago || 'efectivo');
      setFecha(saleToEdit.fecha || new Date().toISOString().split('T')[0]);
      setClienteNombre(saleToEdit.clienteNombre || '');
      setMesa(saleToEdit.mesa || '');
      setNotas(saleToEdit.notas || '');
    } else {
      setItems([]);
      setMetodoPago('efectivo');
      setFecha(new Date().toISOString().split('T')[0]);
      setClienteNombre('');
      setMesa('');
      setNotas('');
      setSelectedProductId('');
      setQuantity(1);
      setCustomPrice('');
    }
    setError(null);
  }, [saleToEdit, isOpen]);

  // When product selected, auto set its price
  React.useEffect(() => {
    if (selectedProductId) {
      const prod = products.find((p) => p.id === selectedProductId);
      if (prod) {
        setCustomPrice(String(prod.price));
      }
    }
  }, [selectedProductId, products]);

  if (!isOpen) return null;

  const totalVenta = items.reduce((acc, item) => acc + (item.subtotal || 0), 0);

  const handleAddItem = () => {
    setError(null);
    if (!selectedProductId) {
      setError('Selecciona un producto de la carta');
      return;
    }
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const unitPrice = parseFloat(customPrice);
    if (isNaN(unitPrice) || unitPrice < 0) {
      setError('Ingresa un precio válido mayor o igual a 0');
      return;
    }

    if (quantity <= 0) {
      setError('La cantidad debe ser al menos 1');
      return;
    }

    // Check if already in items
    const existingIndex = items.findIndex((i) => i.productId === product.id && i.precioUnitario === unitPrice);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].cantidad += quantity;
      updated[existingIndex].subtotal = Number((updated[existingIndex].cantidad * unitPrice).toFixed(2));
      setItems(updated);
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        nombre: product.name,
        cantidad: quantity,
        precioUnitario: unitPrice,
        subtotal: Number((quantity * unitPrice).toFixed(2)),
        categoria: product.category,
      };
      setItems([...items, newItem]);
    }

    // Reset picker
    setSelectedProductId('');
    setQuantity(1);
    setCustomPrice('');
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleQuantityChange = (index: number, newQty: number) => {
    if (newQty <= 0) return;
    const updated = [...items];
    updated[index].cantidad = newQty;
    updated[index].subtotal = Number((newQty * updated[index].precioUnitario).toFixed(2));
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Agrega al menos un producto a la venta');
      return;
    }

    if (totalVenta <= 0) {
      setError('El total de la venta debe ser mayor a 0');
      return;
    }

    setIsSaving(true);
    try {
      const salePayload = {
        items,
        total: Number(totalVenta.toFixed(2)),
        metodoPago,
        fecha: fecha || new Date().toISOString().split('T')[0],
        clienteNombre: clienteNombre.trim(),
        mesa: mesa.trim(),
        notas: notas.trim(),
        creadoPor: userEmail || 'admin',
      };

      if (isEditing && saleToEdit) {
        await updateSale(saleToEdit.id, salePayload);
        onSuccess('Venta actualizada exitosamente.');
      } else {
        await createSale(salePayload);
        onSuccess('Venta registrada exitosamente en Firestore.');
      }
      onClose();
    } catch (err: any) {
      console.error('Error al guardar venta:', err);
      setError(err?.message || 'Error al guardar la venta en Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-sm border border-stone-300 shadow-xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xs bg-[#a83b24] text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-title text-xl font-bold text-stone-900">
                {isEditing ? 'Editar Venta' : 'Registrar Venta Manual'}
              </h2>
              <p className="text-xs text-stone-500">
                Registra órdenes de consumo, métodos de pago y productos vendidos
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Metadata Row: Fecha, Método de Pago, Mesa */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-stone-50 rounded-xs border border-stone-200">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                Fecha
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-xs text-xs text-stone-900 focus:ring-1 focus:ring-[#a83b24]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                Método de Pago
              </label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-xs text-xs text-stone-900 focus:ring-1 focus:ring-[#a83b24]"
              >
                <option value="efectivo">💵 Efectivo</option>
                <option value="tarjeta">💳 Tarjeta (Débito/Crédito)</option>
                <option value="transferencia">📱 Transferencia / Zelle / Pago Móvil</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                Mesa / Ubicación (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Mesa 4, Barra, Para Llevar"
                value={mesa}
                onChange={(e) => setMesa(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-xs text-xs text-stone-900 focus:ring-1 focus:ring-[#a83b24]"
              />
            </div>
          </div>

          {/* Add Product Items Row */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-[#a83b24]" />
                <span>Agregar Platillos a la Venta</span>
              </label>
              <span className="text-[11px] text-stone-400">
                Selecciona de los productos existentes en Firestore
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-stone-50/70 border border-stone-200 rounded-xs">
              <div className="sm:col-span-6">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-xs text-xs text-stone-900 focus:ring-1 focus:ring-[#a83b24]"
                >
                  <option value="">-- Seleccionar producto --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${p.price.toFixed(2)} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Cant."
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded-xs text-xs text-center text-stone-900 focus:ring-1 focus:ring-[#a83b24]"
                  title="Cantidad"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-stone-400 text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Precio"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full pl-5 pr-2 py-1.5 bg-white border border-stone-300 rounded-xs text-xs text-stone-900 focus:ring-1 focus:ring-[#a83b24]"
                    title="Precio unitario"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-1.5 bg-[#a83b24] hover:bg-[#91321d] text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </button>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-stone-200 rounded-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100/80 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  <th className="py-2 px-3">Producto</th>
                  <th className="py-2 px-3 text-center">Cant.</th>
                  <th className="py-2 px-3 text-right">Precio Unit.</th>
                  <th className="py-2 px-3 text-right">Subtotal</th>
                  <th className="py-2 px-2 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-stone-400 text-xs">
                      No hay productos añadidos a esta venta aún.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="py-2 px-3 font-semibold text-stone-900">
                        {item.nombre}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                          className="w-14 px-1.5 py-0.5 border border-stone-300 rounded text-center text-xs"
                        />
                      </td>
                      <td className="py-2 px-3 text-right text-stone-600 font-mono">
                        ${item.precioUnitario.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-stone-900 font-mono">
                        ${item.subtotal.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-stone-400 hover:text-red-600 cursor-pointer transition-colors"
                          title="Quitar ítem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {items.length > 0 && (
                <tfoot>
                  <tr className="bg-stone-50 border-t border-stone-200 font-bold text-stone-900">
                    <td colSpan={3} className="py-2.5 px-3 text-right text-xs uppercase tracking-wider">
                      Total a Cobrar:
                    </td>
                    <td className="py-2.5 px-3 text-right text-sm font-serif-title text-[#a83b24]">
                      ${totalVenta.toFixed(2)} USD
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Optional notes & client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                Cliente (Opcional)
              </label>
              <input
                type="text"
                placeholder="Nombre del cliente o comensal"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-xs text-xs text-stone-900 focus:ring-1 focus:ring-[#a83b24]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                Notas / Observaciones
              </label>
              <input
                type="text"
                placeholder="Ej. Descuento aplicado, propina en efectivo..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-xs text-xs text-stone-900 focus:ring-1 focus:ring-[#a83b24]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-stone-200">
            <div className="text-xs text-stone-500">
              Total: <span className="font-bold text-stone-900 text-sm">${totalVenta.toFixed(2)} USD</span>
            </div>

            <div className="flex items-center space-x-2">
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
                disabled={isSaving || items.length === 0}
                className="px-5 py-2 bg-[#a83b24] hover:bg-[#91321d] text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Guardando en Firestore...</span>
                  </>
                ) : (
                  <span>{isEditing ? 'Actualizar Venta' : 'Guardar Venta'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
