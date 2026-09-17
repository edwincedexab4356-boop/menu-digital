import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  LogOut, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Utensils, 
  DollarSign, 
  Layers, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  FolderPlus,
  Settings
} from 'lucide-react';
import { MenuItem } from '../../types';
import { ProductFormModal } from './ProductFormModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ManageSectionsModal } from './ManageSectionsModal';
import { setProductAvailability } from '../../services/adminProducts';
import { useFirestoreCategories } from '../../services/adminCategories';

interface AdminDashboardProps {
  userEmail: string | null;
  products: MenuItem[];
  loadingProducts: boolean;
  onLogout: () => void;
  onNavigateToPublicMenu: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  userEmail,
  products,
  loadingProducts,
  onLogout,
  onNavigateToPublicMenu,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSectionsModalOpen, setIsSectionsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<MenuItem | null>(null);
  const [productToDelete, setProductToDelete] = useState<MenuItem | null>(null);
  
  // Toast notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Load Firestore Categories & Sections
  const existingProductCategories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  const {
    categories: dynamicCategories,
    addCategory,
    removeCategory,
  } = useFirestoreCategories(existingProductCategories);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Availability toggle
  const handleToggleAvailability = async (product: MenuItem) => {
    setTogglingId(product.id);
    try {
      const newStatus = !product.available;
      await setProductAvailability(product.id, newStatus);
      showToast(
        `"${product.name}" ahora está ${newStatus ? 'Disponible' : 'No disponible'}.`,
        'success'
      );
    } catch (err: any) {
      console.error('Error toggling availability:', err);
      showToast(err?.message || 'Error al cambiar la disponibilidad en Firestore.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Product counts per category
  const productCountsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Distinct filter categories
  const filterCategories = useMemo(() => {
    const ids = new Set<string>();
    dynamicCategories.forEach((c) => ids.add(c.id));
    products.forEach((p) => ids.add(p.category));
    return ['todas', ...Array.from(ids)];
  }, [dynamicCategories, products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category filter
      if (selectedCategory !== 'todas' && item.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Category label formatter
  const formatCategory = (catId: string) => {
    if (catId === 'todas') return 'Todas';
    const found = dynamicCategories.find((c) => c.id === catId);
    if (found) return found.nombre;
    if (catId === 'entradas') return 'Entrada';
    if (catId === 'platos_fuertes') return 'Plato Fuerte';
    if (catId === 'postres') return 'Postre';
    return catId.charAt(0).toUpperCase() + catId.slice(1).replace('_', ' ');
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] font-sans selection:bg-[#a83b24] selection:text-white">
      {/* Top Admin Navbar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-sm bg-[#1c1917] flex items-center justify-center text-white border border-stone-800">
              <Utensils className="w-5 h-5 text-[#d97706]" />
            </div>
            <div>
              <h1 className="font-serif-title text-base sm:text-lg font-bold text-stone-900 leading-tight">
                Panel de Administración
              </h1>
              <p className="text-[11px] text-[#a83b24] font-semibold tracking-wider uppercase">
                Delicias Belgi
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* View Public Menu Button */}
            <button
              onClick={onNavigateToPublicMenu}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xs border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              title="Ir al menú de comensales"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Menú Público</span>
              <span className="sm:hidden">Menú</span>
            </button>

            {/* Logout Button */}
            <button
              id="admin-logout-btn"
              onClick={onLogout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xs bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Notification Toast */}
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

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Header: Productos y Secciones */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-title text-2xl font-bold text-stone-900">
                  Carta & Secciones
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
                  {products.length} {products.length === 1 ? 'platillo' : 'platillos'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {dynamicCategories.length} secciones
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Sube fotos desde tu dispositivo, modifica precios, añade o quita secciones del menú en tiempo real
              </p>
            </div>

            {/* Action Buttons: Gestionar Secciones y + Agregar producto */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              {/* Botón Gestionar Secciones */}
              <button
                id="admin-manage-sections-btn"
                onClick={() => setIsSectionsModalOpen(true)}
                className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xs text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-98"
                title="Añade, edita o quita secciones del menú (heladería, dulcería, repostería, etc.)"
              >
                <Layers className="w-4 h-4 text-[#a83b24]" />
                <span>Gestionar Secciones</span>
              </button>

              {/* + Agregar producto Button */}
              <button
                id="admin-add-product-btn"
                onClick={() => {
                  setProductToEdit(null);
                  setIsFormModalOpen(true);
                }}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#a83b24] hover:bg-[#91321d] text-white rounded-xs text-xs font-bold uppercase tracking-widest transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Agregar producto</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-4 h-4 text-stone-400 my-auto" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, ingrediente o categoría..."
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xs text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#a83b24] focus:border-[#a83b24]"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {filterCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xs text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {formatCategory(cat)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loadingProducts ? (
          <div className="bg-white p-12 text-center rounded-sm border border-stone-200 shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#a83b24] mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-700">Cargando productos desde Firestore...</p>
            <p className="text-xs text-stone-400 mt-1">Conectando en tiempo real con la colección 'productos'</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="bg-white p-12 text-center rounded-sm border border-stone-200 shadow-xs">
            <Utensils className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif-title text-lg font-bold text-stone-800">
              No se encontraron productos
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              {products.length === 0
                ? "La colección 'productos' en Firestore está vacía. Comienza añadiendo el primer platillo de la carta."
                : "No hay productos que coincidan con la búsqueda o filtro aplicado."}
            </p>
            {products.length === 0 && (
              <button
                onClick={() => {
                  setProductToEdit(null);
                  setIsFormModalOpen(true);
                }}
                className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-[#a83b24] hover:bg-[#91321d] text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Agregar primer producto</span>
              </button>
            )}
          </div>
        ) : (
          /* Products List Table / Cards */
          <div className="bg-white rounded-sm border border-stone-200 shadow-xs overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    <th className="py-3.5 px-4">Producto</th>
                    <th className="py-3.5 px-4">Sección / Categoría</th>
                    <th className="py-3.5 px-4">Precio (USD)</th>
                    <th className="py-3.5 px-4">Descripción</th>
                    <th className="py-3.5 px-4 text-center">Disponibilidad</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {filteredProducts.map((product) => {
                    const isToggling = togglingId === product.id;
                    return (
                      <tr 
                        key={product.id}
                        className={`hover:bg-stone-50/60 transition-colors ${
                          !product.available ? 'bg-stone-50/40 opacity-80' : ''
                        }`}
                      >
                        {/* Producto (Imagen + Nombre) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 rounded-xs object-cover border border-stone-200 shrink-0 bg-stone-100"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xs bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-stone-900 text-sm truncate max-w-[200px]">
                                {product.name}
                              </p>
                              <span className="text-[11px] text-stone-400 font-mono">
                                ID: {product.id.substring(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Categoría */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-semibold tracking-wide uppercase bg-stone-100 text-stone-700 border border-stone-200">
                            {formatCategory(product.category)}
                          </span>
                        </td>

                        {/* Precio en USD */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-stone-900">
                          <span className="text-sm text-[#a83b24] font-bold">
                            ${product.price.toFixed(2)}
                          </span>{' '}
                          <span className="text-[10px] text-stone-400 font-normal">USD</span>
                        </td>

                        {/* Descripción */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-stone-600 line-clamp-2 leading-relaxed">
                            {product.description || 'Sin descripción'}
                          </p>
                        </td>

                        {/* Disponibilidad Switch */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleAvailability(product)}
                            disabled={isToggling}
                            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                              product.available
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                            }`}
                            title="Haz clic para cambiar disponibilidad"
                          >
                            {isToggling ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : product.available ? (
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                            )}
                            <span>{product.available ? 'Disponible' : 'No disponible'}</span>
                          </button>
                        </td>

                        {/* Acciones: Editar / Eliminar */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center space-x-1.5">
                            {/* Editar */}
                            <button
                              onClick={() => {
                                setProductToEdit(product);
                                setIsFormModalOpen(true);
                              }}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xs border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
                              title="Editar producto o cambiar foto"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                              <span>Editar</span>
                            </button>

                            {/* Eliminar */}
                            <button
                              onClick={() => setProductToDelete(product)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xs border border-red-200 hover:border-red-300 bg-red-50/50 hover:bg-red-50 text-red-700 font-semibold text-xs transition-colors cursor-pointer"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Small Screen Card View */}
            <div className="md:hidden divide-y divide-stone-200">
              {filteredProducts.map((product) => {
                const isToggling = togglingId === product.id;
                return (
                  <div key={product.id} className="p-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-xs object-cover border border-stone-200 shrink-0 bg-stone-100"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xs bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-stone-900 text-sm truncate">
                            {product.name}
                          </h4>
                          <span className="font-bold text-[#a83b24] text-sm whitespace-nowrap">
                            ${product.price.toFixed(2)} USD
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="inline-block px-2 py-0.5 rounded-xs text-[10px] font-semibold uppercase bg-stone-100 text-stone-600 border border-stone-200">
                            {formatCategory(product.category)}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {product.description || 'Sin descripción'}
                        </p>
                      </div>
                    </div>

                    {/* Mobile Card Bottom Controls */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleAvailability(product)}
                        disabled={isToggling}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                          product.available
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-stone-100 text-stone-500 border-stone-300'
                        }`}
                      >
                        {isToggling ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : product.available ? (
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                        )}
                        <span>{product.available ? 'Disponible' : 'Agotado'}</span>
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setProductToEdit(product);
                            setIsFormModalOpen(true);
                          }}
                          className="px-3 py-1 border border-stone-300 rounded-xs text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="px-3 py-1 border border-red-200 rounded-xs text-xs font-semibold text-red-600 bg-red-50/50 hover:bg-red-50 cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        onSuccess={(msg) => showToast(msg, 'success')}
        availableCategories={dynamicCategories}
      />

      {/* Manage Sections / Categories Modal */}
      <ManageSectionsModal
        isOpen={isSectionsModalOpen}
        onClose={() => setIsSectionsModalOpen(false)}
        categories={dynamicCategories}
        onAddCategory={addCategory}
        onRemoveCategory={removeCategory}
        productCountsByCategory={productCountsByCategory}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        product={productToDelete}
        onClose={() => setProductToDelete(null)}
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};
