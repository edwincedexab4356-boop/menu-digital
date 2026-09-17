import React, { useState, useEffect } from 'react';
import { X, Loader2, Image as ImageIcon, DollarSign, Tag, FileText, CheckCircle2 } from 'lucide-react';
import { MenuItem } from '../../types';
import { ProductFormData, createProduct, updateProduct } from '../../services/adminProducts';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: MenuItem | null;
  onSuccess: (message: string) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSuccess,
}) => {
  const isEditing = Boolean(productToEdit);

  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState<string>('');
  const [categoria, setCategoria] = useState('entradas');
  const [customCategoria, setCustomCategoria] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize form when opening or changing productToEdit
  useEffect(() => {
    if (productToEdit) {
      setNombre(productToEdit.name || '');
      setPrecio(productToEdit.price !== undefined ? String(productToEdit.price) : '');
      
      const standardCategories = ['entradas', 'platos_fuertes', 'postres'];
      if (standardCategories.includes(productToEdit.category)) {
        setCategoria(productToEdit.category);
        setIsCustomCategory(false);
        setCustomCategoria('');
      } else {
        setCategoria('otra');
        setIsCustomCategory(true);
        setCustomCategoria(productToEdit.category || '');
      }

      setDescripcion(productToEdit.description || '');
      setImagen(productToEdit.image || '');
      setDisponible(productToEdit.available ?? true);
    } else {
      // Clear form
      setNombre('');
      setPrecio('');
      setCategoria('entradas');
      setIsCustomCategory(false);
      setCustomCategoria('');
      setDescripcion('');
      setImagen('');
      setDisponible(true);
    }
    setFormError(null);
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!nombre.trim()) {
      setFormError('El nombre del platillo es obligatorio.');
      return;
    }

    const numericPrice = parseFloat(precio);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setFormError('El precio debe ser un número válido mayor o igual a 0.');
      return;
    }

    const finalCategory = isCustomCategory ? customCategoria.trim().toLowerCase() : categoria;
    if (!finalCategory) {
      setFormError('Debes seleccionar o especificar una categoría.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: ProductFormData = {
        nombre: nombre.trim(),
        precio: numericPrice, // Stored explicitly as NUMBER
        categoria: finalCategory,
        descripcion: descripcion.trim(),
        imagen: imagen.trim(),
        disponible: Boolean(disponible), // Stored explicitly as BOOLEAN
      };

      if (isEditing && productToEdit) {
        await updateProduct(productToEdit.id, payload);
        onSuccess('Producto actualizado correctamente.');
      } else {
        await createProduct(payload);
        onSuccess('Producto agregado correctamente.');
      }

      onClose();
    } catch (err: any) {
      console.error('Error saving product to Firestore:', err);
      setFormError(err?.message || 'Error al guardar el producto en Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-sm border border-stone-300 shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/70">
          <div>
            <h2 className="font-serif-title text-xl font-bold text-stone-900">
              {isEditing ? 'Editar Producto' : '+ Agregar Producto'}
            </h2>
            <p className="text-xs text-stone-500">
              {isEditing
                ? 'Modifica los detalles del producto en la carta en tiempo real'
                : 'Completa los campos para añadir un nuevo platillo a Firestore'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xs transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs">
              {formError}
            </div>
          )}

          {/* Grid 2 cols: Nombre y Precio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Nombre */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Nombre del Producto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Salmón Glaseado al Romero"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xs text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#a83b24] focus:border-[#a83b24]"
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Precio (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400 text-sm font-semibold">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="24.50"
                  className="w-full pl-7 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xs text-sm text-stone-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#a83b24] focus:border-[#a83b24]"
                />
              </div>
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={isCustomCategory ? 'otra' : categoria}
                onChange={(e) => {
                  if (e.target.value === 'otra') {
                    setIsCustomCategory(true);
                  } else {
                    setIsCustomCategory(false);
                    setCategoria(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xs text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#a83b24] focus:border-[#a83b24]"
              >
                <option value="entradas">Entradas</option>
                <option value="platos_fuertes">Platos Fuertes</option>
                <option value="postres">Postres</option>
                <option value="otra">Otra categoría personalizada...</option>
              </select>

              {isCustomCategory && (
                <input
                  type="text"
                  required={isCustomCategory}
                  value={customCategoria}
                  onChange={(e) => setCustomCategoria(e.target.value)}
                  placeholder="Nombre de la nueva categoría"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xs text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#a83b24] focus:border-[#a83b24]"
                />
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Descripción del Platillo
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe los ingredientes principales, aromas, texturas y preparación..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xs text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#a83b24] focus:border-[#a83b24] resize-none"
            />
          </div>

          {/* Imagen URL & Preview */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              URL de la Imagen
            </label>
            <div className="flex gap-3 items-start">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={imagen}
                  onChange={(e) => setImagen(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xs text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#a83b24] focus:border-[#a83b24]"
                />
              </div>
              {imagen && (
                <div className="w-12 h-12 rounded-xs border border-stone-300 overflow-hidden shrink-0 bg-stone-100 flex items-center justify-center">
                  <img
                    src={imagen}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <p className="mt-1 text-[11px] text-stone-400">
              Puedes pegar un enlace directo a una fotografía (Unsplash, Firebase Storage, CDN, etc.).
            </p>
          </div>

          {/* Interruptor de Disponibilidad */}
          <div className="pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between p-3 rounded-xs bg-stone-50 border border-stone-200">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-stone-800">
                  Estado de Disponibilidad
                </span>
                <span className="block text-xs text-stone-500">
                  {disponible
                    ? 'El platillo está disponible para ordenar en el menú público'
                    : 'Agotado: se mostrará como no disponible y no se podrá ordenar'}
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={disponible}
                  onChange={(e) => setDisponible(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-3 text-xs font-bold uppercase tracking-wider text-stone-700 min-w-[90px]">
                  {disponible ? (
                    <span className="text-emerald-700">Disponible</span>
                  ) : (
                    <span className="text-stone-500">No disponible</span>
                  )}
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-stone-200">
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
              className="flex items-center space-x-2 px-5 py-2 bg-[#a83b24] hover:bg-[#91321d] text-white rounded-xs text-xs font-semibold uppercase tracking-wider shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando en Firestore...</span>
                </>
              ) : (
                <span>{isEditing ? 'Actualizar Producto' : 'Guardar Producto'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
