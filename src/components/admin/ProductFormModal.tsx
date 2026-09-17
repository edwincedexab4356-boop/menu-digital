import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Loader2, 
  Image as ImageIcon, 
  UploadCloud, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { MenuItem } from '../../types';
import { ProductFormData, createProduct, updateProduct } from '../../services/adminProducts';
import { CategoryItem } from '../../services/adminCategories';
import { uploadProductImage } from '../../services/imageUpload';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: MenuItem | null;
  onSuccess: (message: string) => void;
  availableCategories: CategoryItem[];
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSuccess,
  availableCategories,
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

  // File Upload states
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize form when opening or changing productToEdit
  useEffect(() => {
    if (productToEdit) {
      setNombre(productToEdit.name || '');
      setPrecio(productToEdit.price !== undefined ? String(productToEdit.price) : '');
      
      const matched = availableCategories.some((c) => c.id === productToEdit.category);
      if (matched) {
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
      setUploadMode('upload');
    } else {
      // Clear form
      setNombre('');
      setPrecio('');
      const firstCat = availableCategories[0]?.id || 'entradas';
      setCategoria(firstCat);
      setIsCustomCategory(false);
      setCustomCategoria('');
      setDescripcion('');
      setImagen('');
      setDisponible(true);
      setUploadMode('upload');
    }
    setFormError(null);
    setUploadMessage(null);
    setUploadProgress(0);
  }, [productToEdit, isOpen, availableCategories]);

  if (!isOpen) return null;

  // Process a selected or dropped file
  const processFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP, etc.).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setFormError('La imagen es demasiado grande. Selecciona una menor a 15MB.');
      return;
    }

    setFormError(null);
    setIsUploading(true);
    setUploadProgress(20);
    setUploadMessage('Optimizando y cargando imagen...');

    try {
      const result = await uploadProductImage(file, (progress) => {
        setUploadProgress(progress);
      });

      setImagen(result.url);
      setUploadMessage('¡Foto cargada exitosamente!');
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setFormError(err?.message || 'Error al procesar la imagen seleccionada.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

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
        precio: numericPrice,
        categoria: finalCategory,
        descripcion: descripcion.trim(),
        imagen: imagen.trim(),
        disponible: Boolean(disponible),
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
                ? 'Modifica los detalles, fotos y sección del platillo en tiempo real'
                : 'Añade un nuevo platillo con foto desde tus archivos o URL'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving || isUploading}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xs transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
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
                placeholder="Ej. Helado Belga de Avellanas"
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
                  placeholder="6.50"
                  className="w-full pl-7 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xs text-sm text-stone-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#a83b24] focus:border-[#a83b24]"
                />
              </div>
            </div>
          </div>

          {/* Categoría / Sección */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Sección / Categoría del Menú <span className="text-red-500">*</span>
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
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
                <option value="otra">+ Otra sección nueva...</option>
              </select>

              {isCustomCategory && (
                <input
                  type="text"
                  required={isCustomCategory}
                  value={customCategoria}
                  onChange={(e) => setCustomCategoria(e.target.value)}
                  placeholder="Nombre de la nueva sección"
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
              placeholder="Describe los ingredientes, sabores, texturas y preparación..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xs text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#a83b24] focus:border-[#a83b24] resize-none"
            />
          </div>

          {/* Fotografía: Subir archivo o Enlace */}
          <div className="p-4 bg-stone-50/80 border border-stone-200 rounded-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Fotografía del Producto
              </label>

              {/* Selector de modo: Subir archivo vs URL */}
              <div className="flex bg-stone-200 p-0.5 rounded-xs text-xs">
                <button
                  type="button"
                  onClick={() => setUploadMode('upload')}
                  className={`px-2.5 py-1 rounded-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    uploadMode === 'upload'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Subir desde mis archivos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`px-2.5 py-1 rounded-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    uploadMode === 'url'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Enlace URL</span>
                </button>
              </div>
            </div>

            {uploadMode === 'upload' ? (
              /* Subir desde archivos locales con Drag & Drop y Botón visible */
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="product-photo-file-input"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-xs p-5 text-center cursor-pointer transition-all group ${
                    isDragging 
                      ? 'border-[#a83b24] bg-orange-50/50 scale-[0.99]' 
                      : 'border-stone-300 hover:border-[#a83b24] bg-white'
                  }`}
                >
                  <UploadCloud className="w-8 h-8 text-stone-400 group-hover:text-[#a83b24] mx-auto mb-2 transition-colors" />
                  <p className="text-xs font-semibold text-stone-800">
                    Arrastra aquí tu foto o{' '}
                    <span className="text-[#a83b24] underline underline-offset-2">haz clic para examinar tus archivos</span>
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Compatible con JPG, PNG, WEBP o HEIC (fotos tomadas con celular o cámara)
                  </p>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-xs text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-stone-500" />
                      <span>Elegir foto de mi equipo</span>
                    </button>
                  </div>
                </div>

                {isUploading && (
                  <div className="p-3 bg-stone-100 rounded-xs border border-stone-200 space-y-1.5 animate-pulse">
                    <div className="flex items-center justify-between text-xs text-stone-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#a83b24]" />
                        {uploadMessage || 'Subiendo imagen...'}
                      </span>
                      <span className="font-bold">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#a83b24] h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* URL directa */
              <div>
                <input
                  type="url"
                  value={imagen}
                  onChange={(e) => setImagen(e.target.value)}
                  placeholder="https://ejemplo.com/foto-platillo.jpg"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xs text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#a83b24] focus:border-[#a83b24]"
                />
              </div>
            )}

            {/* Preview de la foto actual */}
            {imagen && (
              <div className="flex items-center gap-3 pt-2 border-t border-stone-200">
                <div className="w-16 h-16 rounded-xs border border-stone-300 overflow-hidden shrink-0 bg-stone-100">
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
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-stone-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Foto cargada correctamente
                  </span>
                  <p className="text-[11px] text-stone-400 truncate max-w-md">
                    {imagen.startsWith('data:') ? 'Imagen procesada y lista para guardar' : imagen}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setImagen('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-[11px] text-red-600 hover:text-red-700 font-medium underline mt-0.5 cursor-pointer"
                  >
                    Quitar foto
                  </button>
                </div>
              </div>
            )}
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
                    : 'Agotado: se mostrará como no disponible'}
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
              disabled={isSaving || isUploading}
              className="px-4 py-2 border border-stone-300 rounded-xs text-xs font-semibold uppercase tracking-wider text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving || isUploading}
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
