import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, 
  Package, 
  Layers, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu as MenuIcon, 
  X, 
  Utensils, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  Image as ImageIcon,
  DollarSign,
  Receipt,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { MenuItem } from '../../types';
import { Sale, Gasto } from '../../types/finance';
import { ProductFormModal } from './ProductFormModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { DashboardHomeView } from './DashboardHomeView';
import { SectionsManagementView } from './SectionsManagementView';
import { OrdersModulePlaceholderView } from './OrdersModulePlaceholderView';
import { SettingsView } from './SettingsView';
import { SalesView } from './SalesView';
import { ExpensesView } from './ExpensesView';
import { FinanceAnalyticsView } from './FinanceAnalyticsView';
import { SaleModal } from './SaleModal';
import { GastoModal } from './GastoModal';
import { setProductAvailability, updateProduct } from '../../services/adminProducts';
import { useFirestoreCategories } from '../../services/adminCategories';
import { subscribeToSales, subscribeToExpenses } from '../../services/adminFinance';

export type AdminTab = 
  | 'inicio' 
  | 'ventas'
  | 'gastos'
  | 'ganancias'
  | 'productos' 
  | 'secciones' 
  | 'pedidos' 
  | 'configuracion';

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
  // Navigation tab
  const [activeTab, setActiveTab] = useState<AdminTab>('inicio');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Financial Real-time state from Firestore
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Gasto[]>([]);
  const [loadingFinance, setLoadingFinance] = useState<boolean>(true);

  // Subscribe to 'ventas' and 'gastos' collections in Firestore
  useEffect(() => {
    setLoadingFinance(true);
    const unsubSales = subscribeToSales(
      (newSales) => {
        setSales(newSales);
        setLoadingFinance(false);
      },
      (err) => {
        console.error('Error listening to sales in Firestore:', err);
        setLoadingFinance(false);
      }
    );

    const unsubExpenses = subscribeToExpenses(
      (newExpenses) => {
        setExpenses(newExpenses);
      },
      (err) => {
        console.error('Error listening to expenses in Firestore:', err);
      }
    );

    return () => {
      unsubSales();
      unsubExpenses();
    };
  }, []);

  // Products filtering & search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');

  // Modals state: Products
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<MenuItem | null>(null);
  const [productToDelete, setProductToDelete] = useState<MenuItem | null>(null);

  // Modals state: Finance (Venta / Gasto)
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Gasto | null>(null);

  // Notifications & toggles
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Load Firestore Categories & Sections
  const existingProductCategories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  const {
    categories: dynamicCategories,
    addCategory,
    updateCategory,
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
        `"${product.name}" ahora está ${newStatus ? 'Disponible' : 'Agotado'}.`,
        'success'
      );
    } catch (err: any) {
      console.error('Error toggling availability:', err);
      showToast(err?.message || 'Error al cambiar la disponibilidad en Firestore.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Quick reassign category directly from Sections tab
  const handleQuickReassign = async (productId: string, newCategory: string) => {
    await updateProduct(productId, { categoria: newCategory });
  };

  // Distinct filter categories
  const filterCategories = useMemo(() => {
    const ids = new Set<string>();
    dynamicCategories.forEach((c) => ids.add(c.id));
    products.forEach((p) => ids.add(p.category));
    return ['todas', ...Array.from(ids)];
  }, [dynamicCategories, products]);

  // Filtered products for the Products tab
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (selectedCategory !== 'todas' && item.category !== selectedCategory) {
        return false;
      }
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

  const formatCategory = (catId: string) => {
    if (catId === 'todas') return 'Todas';
    const found = dynamicCategories.find((c) => c.id === catId);
    if (found) return found.nombre;
    if (catId === 'entradas') return 'Entrada';
    if (catId === 'platos_fuertes') return 'Plato Fuerte';
    if (catId === 'postres') return 'Postre';
    return catId.charAt(0).toUpperCase() + catId.slice(1).replace('_', ' ');
  };

  // Navigation Items
  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: number | string; badgeColor?: string }[] = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'ventas', label: 'Ventas', icon: DollarSign, badge: sales.length, badgeColor: 'bg-[#a83b24] text-white' },
    { id: 'gastos', label: 'Gastos', icon: Receipt, badge: expenses.length, badgeColor: 'bg-amber-600 text-white' },
    { id: 'ganancias', label: 'Ganancias & Gráficos', icon: TrendingUp },
    { id: 'productos', label: 'Productos', icon: Package, badge: products.length },
    { id: 'secciones', label: 'Secciones', icon: Layers, badge: dynamicCategories.length },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f2] font-sans flex text-stone-900">
      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-5 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200 max-w-sm">
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

      {/* Desktop Sidebar (Left Navigation) */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1c1917] text-stone-300 border-r border-stone-800 shrink-0 select-none">
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-stone-800/80 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-sm bg-gradient-to-br from-stone-800 to-stone-900 border border-stone-700 flex items-center justify-center text-[#d97706] shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif-title text-base font-bold text-white tracking-wide truncate">
              Delicias Belgi
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-[#d97706] font-bold">
              Panel Administrativo
            </p>
          </div>
        </div>

        {/* User Badge Info */}
        <div className="px-5 py-3 border-b border-stone-800/50 bg-stone-900/40">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-xs font-medium text-stone-400 truncate">
              {userEmail || 'admin@deliciasbelgi.com'}
            </p>
          </div>
          <span className="text-[10px] text-stone-500 block mt-0.5">
            Rol: Administrador verificado
          </span>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Main sections label */}
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
            Navegación
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xs text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#a83b24] text-white font-bold shadow-xs'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-black/20 text-white'
                        : item.badgeColor || 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Actions: Ver Menú & Cerrar Sesión */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <button
            onClick={onNavigateToPublicMenu}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xs text-xs font-medium text-stone-300 hover:text-white hover:bg-stone-800/80 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-stone-400" />
            <span>Ver Menú Público</span>
          </button>

          <button
            id="admin-sidebar-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xs text-xs font-semibold uppercase tracking-wider text-red-400 hover:text-white hover:bg-red-950/40 border border-red-900/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" 
            onClick={() => setMobileSidebarOpen(false)} 
          />
          <div className="relative w-64 max-w-[80vw] bg-[#1c1917] text-stone-300 flex flex-col z-10">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Utensils className="w-5 h-5 text-[#d97706]" />
                <span className="font-serif-title font-bold text-white text-base">
                  Delicias Belgi
                </span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-semibold uppercase tracking-wider ${
                      isActive
                        ? 'bg-[#a83b24] text-white font-bold'
                        : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-800 text-stone-400">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-3 border-t border-stone-800 space-y-2">
              <button
                onClick={() => {
                  setMobileSidebarOpen(false);
                  onNavigateToPublicMenu();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xs text-xs text-stone-300 hover:bg-stone-800"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ver Menú Público</span>
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xs text-xs text-red-400 hover:bg-red-950/40"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-stone-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            {/* Current Section Title */}
            <div>
              <h2 className="font-serif-title text-base sm:text-lg font-bold text-stone-900 capitalize leading-tight">
                {activeTab === 'inicio' && 'Inicio · Panel Financiero y Operativo'}
                {activeTab === 'ventas' && 'Módulo de Ventas'}
                {activeTab === 'gastos' && 'Control de Gastos Operativos'}
                {activeTab === 'ganancias' && 'Ganancias, Gráficos y Análisis'}
                {activeTab === 'productos' && 'Administración de Productos'}
                {activeTab === 'secciones' && 'Secciones del Menú'}
                {activeTab === 'pedidos' && 'Monitor de Pedidos'}
                {activeTab === 'configuracion' && 'Configuración del Sistema'}
              </h2>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                Colecciones activas: 'productos', 'categorias', 'ventas', 'gastos'
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Public Menu shortcut */}
            <button
              onClick={onNavigateToPublicMenu}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xs border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ver Menú Público</span>
              <span className="md:hidden">Menú</span>
            </button>

            {/* Top Logout Button */}
            <button
              onClick={onLogout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xs bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </header>

        {/* Tab View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* TAB 1: INICIO */}
          {activeTab === 'inicio' && (
            <DashboardHomeView
              products={products}
              categories={dynamicCategories}
              sales={sales}
              expenses={expenses}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onAddProduct={() => {
                setProductToEdit(null);
                setIsFormModalOpen(true);
              }}
              onEditProduct={(p) => {
                setProductToEdit(p);
                setIsFormModalOpen(true);
              }}
              onNewSale={() => {
                setSaleToEdit(null);
                setIsSaleModalOpen(true);
              }}
              onNewExpense={() => {
                setExpenseToEdit(null);
                setIsExpenseModalOpen(true);
              }}
            />
          )}

          {/* TAB 2: VENTAS */}
          {activeTab === 'ventas' && (
            <SalesView
              sales={sales}
              products={products}
              onOpenNewSale={() => {
                setSaleToEdit(null);
                setIsSaleModalOpen(true);
              }}
              onEditSale={(sale) => {
                setSaleToEdit(sale);
                setIsSaleModalOpen(true);
              }}
              onShowToast={showToast}
              onSaleDeleted={(saleId) => {
                setSales((prev) => prev.filter((s) => s.id !== saleId));
              }}
            />
          )}

          {/* TAB 3: GASTOS */}
          {activeTab === 'gastos' && (
            <ExpensesView
              expenses={expenses}
              onOpenNewExpense={() => {
                setExpenseToEdit(null);
                setIsExpenseModalOpen(true);
              }}
              onEditExpense={(gasto) => {
                setExpenseToEdit(gasto);
                setIsExpenseModalOpen(true);
              }}
              onShowToast={showToast}
            />
          )}

          {/* TAB 4: GANANCIAS & GRÁFICOS */}
          {activeTab === 'ganancias' && (
            <FinanceAnalyticsView
              sales={sales}
              expenses={expenses}
              products={products}
            />
          )}

          {/* TAB 5: PRODUCTOS */}
          {activeTab === 'productos' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Product Controls Header */}
              <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif-title text-2xl font-bold text-stone-900">
                        Catálogo de Productos
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
                        {products.length} platillos
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Crea, edita, cambia precios, modifica fotos y administra la disponibilidad directamente en la colección 'productos'.
                    </p>
                  </div>

                  {/* + Crear Producto */}
                  <button
                    id="admin-add-product-btn"
                    onClick={() => {
                      setProductToEdit(null);
                      setIsFormModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#a83b24] hover:bg-[#91321d] text-white rounded-xs text-xs font-bold uppercase tracking-widest transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>+ Crear Producto</span>
                  </button>
                </div>

                {/* Filters & Search */}
                <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-4 h-4 text-stone-400 my-auto" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por nombre, ingrediente o sección..."
                      className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xs text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#a83b24] focus:border-[#a83b24]"
                    />
                  </div>

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

              {/* Products Table or Loading */}
              {loadingProducts ? (
                <div className="bg-white p-12 text-center rounded-sm border border-stone-200 shadow-xs">
                  <Loader2 className="w-8 h-8 animate-spin text-[#a83b24] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-stone-700">Cargando productos desde Firestore...</p>
                  <p className="text-xs text-stone-400 mt-1">Conectando en tiempo real con la colección 'productos'</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-sm border border-stone-200 shadow-xs">
                  <Utensils className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <h3 className="font-serif-title text-lg font-bold text-stone-800">
                    No se encontraron productos
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                    {products.length === 0
                      ? "La colección 'productos' en Firestore está vacía. Comienza añadiendo el primer platillo."
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
                      <span>+ Crear primer platillo</span>
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
                              <td className="py-3.5 px-4">
                                <div className="flex items-center space-x-3">
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="w-12 h-12 rounded-xs object-cover border border-stone-200 shrink-0 bg-stone-100"
                                      referrerPolicy="no-referrer"
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

                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-semibold tracking-wide uppercase bg-stone-100 text-stone-700 border border-stone-200">
                                  {formatCategory(product.category)}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-stone-900">
                                <span className="text-sm text-[#a83b24] font-bold">
                                  ${product.price.toFixed(2)}
                                </span>{' '}
                                <span className="text-[10px] text-stone-400 font-normal">USD</span>
                              </td>

                              <td className="py-3.5 px-4 max-w-xs">
                                <p className="text-stone-600 line-clamp-2 leading-relaxed">
                                  {product.description || 'Sin descripción'}
                                </p>
                              </td>

                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                <button
                                  onClick={() => handleToggleAvailability(product)}
                                  disabled={isToggling}
                                  className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                                    product.available
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                      : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                                  }`}
                                  title="Haz clic para activar o desactivar platillo"
                                >
                                  {isToggling ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : product.available ? (
                                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                                  )}
                                  <span>{product.available ? 'Activo' : 'Agotado'}</span>
                                </button>
                              </td>

                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex items-center space-x-1.5">
                                  <button
                                    onClick={() => {
                                      setProductToEdit(product);
                                      setIsFormModalOpen(true);
                                    }}
                                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xs border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                                    <span>Editar</span>
                                  </button>

                                  <button
                                    onClick={() => setProductToDelete(product)}
                                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xs border border-red-200 hover:border-red-300 bg-red-50/50 hover:bg-red-50 text-red-700 font-semibold text-xs transition-colors cursor-pointer"
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

                  {/* Mobile Cards */}
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
                              <span>{product.available ? 'Activo' : 'Agotado'}</span>
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
            </div>
          )}

          {/* TAB 6: SECCIONES */}
          {activeTab === 'secciones' && (
            <SectionsManagementView
              categories={dynamicCategories}
              products={products}
              onAddCategory={addCategory}
              onUpdateCategory={updateCategory}
              onRemoveCategory={removeCategory}
              onNavigateToProductsWithCategory={(catId) => {
                setSelectedCategory(catId);
                setActiveTab('productos');
              }}
              onQuickReassign={handleQuickReassign}
            />
          )}

          {/* TAB 7: PEDIDOS */}
          {activeTab === 'pedidos' && (
            <OrdersModulePlaceholderView />
          )}

          {/* TAB 8: CONFIGURACIÓN */}
          {activeTab === 'configuracion' && (
            <SettingsView userEmail={userEmail} />
          )}
        </main>
      </div>

      {/* Product Form Modal (Crear / Editar) */}
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

      {/* Delete Product Confirmation Modal */}
      <DeleteConfirmModal
        product={productToDelete}
        onClose={() => setProductToDelete(null)}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      {/* Sale Modal (Registrar / Editar Venta) */}
      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false);
          setSaleToEdit(null);
        }}
        products={products}
        saleToEdit={saleToEdit}
        onSuccess={(msg) => showToast(msg, 'success')}
        userEmail={userEmail}
      />

      {/* Expense Modal (Registrar / Editar Gasto) */}
      <GastoModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        gastoToEdit={expenseToEdit}
        onSuccess={(msg) => showToast(msg, 'success')}
        userEmail={userEmail}
      />
    </div>
  );
};
