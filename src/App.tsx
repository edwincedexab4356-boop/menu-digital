import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { MenuItemCard } from './components/MenuItemCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { OrderDrawer } from './components/OrderDrawer';
import { RestaurantInfoModal } from './components/RestaurantInfoModal';
import { TableSelectorModal } from './components/TableSelectorModal';
import { restaurantInfo } from './data/menuData';
import { useFirestoreProducts } from './services/firestoreMenu';
import { AdminPage } from './components/admin/AdminPage';
import { MenuCategory, MenuItem, CartItem, DietaryTag } from './types';
import { ShoppingBag, ArrowRight, Salad, Flame, CakeSlice, Utensils, Sparkles, Database, Loader2, RefreshCw, Lock } from 'lucide-react';

export default function App() {
  // Routing: detect if user is on /admin or standard public menu
  const [currentRoute, setCurrentRoute] = useState<'menu' | 'admin'>(() => {
    if (typeof window === 'undefined') return 'menu';
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (path === '/admin' || path.startsWith('/admin') || hash === '#admin' || search.includes('admin')) {
      return 'admin';
    }
    return 'menu';
  });

  // Sync route with browser history (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin') || hash === '#admin') {
        setCurrentRoute('admin');
      } else {
        setCurrentRoute('menu');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToAdmin = () => {
    setCurrentRoute('admin');
    if (window.location.pathname !== '/admin') {
      window.history.pushState(null, '', '/admin');
    }
  };

  const navigateToMenu = () => {
    setCurrentRoute('menu');
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
  };

  const [activeCategory, setActiveCategory] = useState<MenuCategory>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<DietaryTag | 'todos'>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Firestore real-time data - exclusively from Firestore as requested
  const {
    products: firestoreProducts,
    loading: isFirestoreLoading,
    error: firestoreError,
    firestoreCount,
    isFirestoreConnected,
    seedSampleProducts,
  } = useFirestoreProducts();

  // Products come exclusively from Firestore; NO hardcoded fallback in menu
  const currentMenuItems = firestoreProducts;
  const isUsingRealFirestoreDocs = firestoreProducts.length > 0;
  
  // Cart / Order state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('delicias_belgi_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tableNumber, setTableNumber] = useState<string>(() => {
    try {
      return localStorage.getItem('delicias_belgi_table') || 'Mesa 04';
    } catch {
      return 'Mesa 04';
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('delicias_belgi_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Sync table to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('delicias_belgi_table', tableNumber);
    } catch {
      // ignore
    }
  }, [tableNumber]);

  // Handle seeding sample dishes into Firestore
  const handleSeedProducts = async () => {
    setIsSeeding(true);
    await seedSampleProducts();
    setIsSeeding(false);
  };

  // Find all distinct categories present in menu items
  const extraCategories = useMemo(() => {
    const standard: string[] = ['entradas', 'platos_fuertes', 'postres'];
    const allCategories: string[] = currentMenuItems.map((i) => i.category);
    return Array.from(new Set<string>(allCategories)).filter(
      (c: string) => !standard.includes(c)
    );
  }, [currentMenuItems]);

  // Counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      todas: currentMenuItems.length,
      entradas: 0,
      platos_fuertes: 0,
      postres: 0,
    };
    for (const item of currentMenuItems) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts as {
      todas: number;
      entradas: number;
      platos_fuertes: number;
      postres: number;
      [key: string]: number;
    };
  }, [currentMenuItems]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return currentMenuItems.filter((item) => {
      // Category filter
      if (activeCategory !== 'todas' && item.category !== activeCategory) {
        return false;
      }

      // Dietary tag filter
      if (selectedTag !== 'todos' && !item.tags.includes(selectedTag)) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesIngredient = item.ingredients?.some((ing) =>
          ing.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesDesc && !matchesIngredient) {
          return false;
        }
      }

      return true;
    });
  }, [currentMenuItems, activeCategory, selectedTag, searchQuery]);

  // Grouped items when 'todas' is selected
  const entradasItems = useMemo(
    () => filteredItems.filter((i) => i.category === 'entradas'),
    [filteredItems]
  );
  const platosFuertesItems = useMemo(
    () => filteredItems.filter((i) => i.category === 'platos_fuertes'),
    [filteredItems]
  );
  const postresItems = useMemo(
    () => filteredItems.filter((i) => i.category === 'postres'),
    [filteredItems]
  );

  // Add to cart handler
  const handleAddToCart = (item: MenuItem, quantity = 1, instructions?: string) => {
    if (!item.available) return;
    setCart((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.item.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (instructions) {
          updated[existingIndex].specialInstructions = instructions;
        }
        return updated;
      } else {
        return [...prev, { item, quantity, specialInstructions: instructions }];
      }
    });
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((ci) => (ci.item.id === itemId ? { ...ci, quantity: newQty } : ci))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((acc, ci) => acc + ci.quantity, 0);
  const totalCartPrice = cart.reduce(
    (acc, ci) => acc + ci.item.price * ci.quantity,
    0
  );

  // If user is accessing /admin, render Admin Portal
  if (currentRoute === 'admin') {
    return <AdminPage onNavigateHome={navigateToMenu} />;
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col font-sans selection:bg-[#a83b24] selection:text-white">
      {/* Navigation Header */}
      <Navbar
        restaurant={restaurantInfo}
        cartCount={totalCartCount}
        tableNumber={tableNumber}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
        onChangeTable={() => setIsTableModalOpen(true)}
        onNavigateToAdmin={navigateToAdmin}
      />

      {/* Hero Atmosphere Banner */}
      <HeroBanner
        restaurant={restaurantInfo}
        onExploreCategory={(cat) => {
          setActiveCategory(cat);
          const el = document.getElementById('menu-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Sticky Categories & Dietary Filter Navigation */}
      <div id="menu-section">
        <CategoryFilter
          activeCategory={activeCategory}
          onSelectCategory={(cat) => setActiveCategory(cat)}
          categoryCounts={categoryCounts}
          extraCategories={extraCategories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
        />
      </div>

      {/* Main Menu Feed */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Firestore Sync Indicator Bar (Subtle & Elegant) */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 p-3 sm:px-4 rounded-sm bg-white border border-stone-200 shadow-xs text-xs">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isFirestoreConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isFirestoreConnected ? 'bg-emerald-600' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-semibold text-stone-800">
              {isFirestoreLoading
                ? 'Conectando a Cloud Firestore...'
                : isUsingRealFirestoreDocs
                ? `Cloud Firestore Conectado · ${firestoreProducts.length} productos en vivo desde 'productos'`
                : `Cloud Firestore Conectado · Colección 'productos' lista`}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-stone-500">
            {firestoreProducts.length === 0 && !isFirestoreLoading && (
              <button
                onClick={handleSeedProducts}
                disabled={isSeeding}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xs bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium transition-colors cursor-pointer border border-stone-300"
                title="Cargar los platillos de muestra directamente en Firestore"
              >
                {isSeeding ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Database className="w-3.5 h-3.5 text-[#a83b24]" />
                )}
                <span>{isSeeding ? 'Sincronizando...' : 'Cargar platillos muestra a Firestore'}</span>
              </button>
            )}
            <span className="text-[11px] text-stone-400">Precios en USD</span>
          </div>
        </div>

        {isFirestoreLoading && currentMenuItems.length === 0 ? (
          /* Loading Skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 bg-stone-200/60 rounded-sm border border-stone-200" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty Results State */
          <div className="text-center py-16 px-4 bg-white rounded-sm border border-stone-200 my-8 shadow-xs">
            <div className="w-16 h-16 rounded-xs bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400 border border-stone-200">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="font-serif-title text-xl font-bold text-stone-900">No encontramos platillos</h3>
            <p className="text-sm text-stone-600 max-w-md mx-auto mt-2 leading-relaxed">
              No hay coincidencias para "{searchQuery}" con los filtros seleccionados. Intente limpiar la búsqueda o cambiar la categoría.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('todos');
                setActiveCategory('todas');
              }}
              className="mt-5 px-5 py-2.5 rounded-sm bg-[#a83b24] hover:bg-[#91321d] text-white font-semibold uppercase tracking-wider text-xs transition-all cursor-pointer shadow-xs"
            >
              Restablecer todos los filtros
            </button>
          </div>
        ) : activeCategory === 'todas' && !searchQuery ? (
          /* Structured View by Categories when 'todas' is selected */
          <div className="space-y-16">
            {/* 1. SECCIÓN ENTRADAS */}
            {entradasItems.length > 0 && (
              <section id="section-entradas" className="scroll-mt-40">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-stone-300 gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Salad className="w-4 h-4 text-[#a83b24]" />
                      <span className="text-[11px] uppercase tracking-widest text-[#a83b24] font-bold">
                        Apertura del Menú
                      </span>
                    </div>
                    <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900">
                      Entradas & Bocados de Autor
                    </h2>
                  </div>
                  <span className="text-xs sm:text-sm text-stone-500 font-medium">
                    {entradasItems.length} {entradasItems.length === 1 ? 'platillo' : 'platillos'}
                  </span>
                </div>

                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {entradasItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      currency={restaurantInfo.currency}
                      onSelect={(dish) => setSelectedItem(dish)}
                      onAddToCart={(dish) => handleAddToCart(dish, 1)}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 2. SECCIÓN PLATOS FUERTES */}
            {platosFuertesItems.length > 0 && (
              <section id="section-platos-fuertes" className="scroll-mt-40">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-stone-300 gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-4 h-4 text-[#a83b24]" />
                      <span className="text-[11px] uppercase tracking-widest text-[#a83b24] font-bold">
                        Especialidades de la Cocina & Brasa
                      </span>
                    </div>
                    <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900">
                      Platos Fuertes Principales
                    </h2>
                  </div>
                  <span className="text-xs sm:text-sm text-stone-500 font-medium">
                    {platosFuertesItems.length} {platosFuertesItems.length === 1 ? 'creación' : 'creaciones'}
                  </span>
                </div>

                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {platosFuertesItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      currency={restaurantInfo.currency}
                      onSelect={(dish) => setSelectedItem(dish)}
                      onAddToCart={(dish) => handleAddToCart(dish, 1)}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 3. SECCIÓN POSTRES */}
            {postresItems.length > 0 && (
              <section id="section-postres" className="scroll-mt-40">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-stone-300 gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CakeSlice className="w-4 h-4 text-[#a83b24]" />
                      <span className="text-[11px] uppercase tracking-widest text-[#a83b24] font-bold">
                        Dulce Cierre Artesanal
                      </span>
                    </div>
                    <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900">
                      Postres & Pastelería de Autor
                    </h2>
                  </div>
                  <span className="text-xs sm:text-sm text-stone-500 font-medium">
                    {postresItems.length} {postresItems.length === 1 ? 'delicia dulce' : 'delicias dulces'}
                  </span>
                </div>

                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {postresItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      currency={restaurantInfo.currency}
                      onSelect={(dish) => setSelectedItem(dish)}
                      onAddToCart={(dish) => handleAddToCart(dish, 1)}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 4. SECCIONES ADICIONALES (Categorías personalizadas desde Firestore) */}
            {extraCategories.map((cat) => {
              const catItems = filteredItems.filter((i) => i.category === cat);
              if (catItems.length === 0) return null;
              return (
                <section key={cat} id={`section-${cat}`} className="scroll-mt-40">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-stone-300 gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Utensils className="w-4 h-4 text-[#a83b24]" />
                        <span className="text-[11px] uppercase tracking-widest text-[#a83b24] font-bold">
                          Colección Delicias Belgi
                        </span>
                      </div>
                      <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900">
                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                      </h2>
                    </div>
                    <span className="text-xs sm:text-sm text-stone-500 font-medium">
                      {catItems.length} {catItems.length === 1 ? 'producto' : 'productos'}
                    </span>
                  </div>

                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-4'
                    }
                  >
                    {catItems.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        currency={restaurantInfo.currency}
                        onSelect={(dish) => setSelectedItem(dish)}
                        onAddToCart={(dish) => handleAddToCart(dish, 1)}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          /* Single Category or Filtered View */
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-300">
              <div className="flex items-center gap-2.5">
                {activeCategory === 'entradas' && <Salad className="w-6 h-6 text-[#a83b24]" />}
                {activeCategory === 'platos_fuertes' && <Flame className="w-6 h-6 text-[#a83b24]" />}
                {activeCategory === 'postres' && <CakeSlice className="w-6 h-6 text-[#a83b24]" />}
                {activeCategory !== 'entradas' && activeCategory !== 'platos_fuertes' && activeCategory !== 'postres' && (
                  <Utensils className="w-6 h-6 text-[#a83b24]" />
                )}
                <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900">
                  {activeCategory === 'entradas' && 'Entradas de Autor'}
                  {activeCategory === 'platos_fuertes' && 'Platos Fuertes & Brasas'}
                  {activeCategory === 'postres' && 'Postres Artesanales'}
                  {activeCategory === 'todas' && 'Resultados de Búsqueda'}
                  {!['entradas', 'platos_fuertes', 'postres', 'todas'].includes(activeCategory) &&
                    activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1).replace('_', ' ')}
                </h2>
              </div>
              <span className="text-xs sm:text-sm text-stone-500 font-medium">
                {filteredItems.length} {filteredItems.length === 1 ? 'platillo encontrado' : 'platillos encontrados'}
              </span>
            </div>

            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  currency={restaurantInfo.currency}
                  onSelect={(dish) => setSelectedItem(dish)}
                  onAddToCart={(dish) => handleAddToCart(dish, 1)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar (if items present) */}
      {totalCartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in slide-in-from-bottom-4 duration-200">
          <div 
            onClick={() => setIsCartOpen(true)}
            className="flex items-center justify-between p-3.5 sm:p-4 rounded-sm bg-[#1c1917] hover:bg-stone-900 text-white shadow-2xl border border-stone-700 cursor-pointer transition-all duration-150 active:scale-98"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xs bg-[#a83b24] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {totalCartCount}
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#fca5a5] font-bold block">
                  {tableNumber} · Comanda lista
                </span>
                <span className="text-sm font-semibold">
                  Ver pedido ({totalCartCount} {totalCartCount === 1 ? 'platillo' : 'platillos'})
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 font-bold text-base">
              <span className="text-[#a83b24]">{restaurantInfo.currency}{totalCartPrice.toFixed(2)} USD</span>
              <ArrowRight className="w-4 h-4 text-stone-400" />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 border-t border-stone-200 bg-white text-stone-600 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <span className="font-serif-title text-xl font-bold text-stone-900 block">
              {restaurantInfo.name}
            </span>
            <p className="text-xs text-stone-500 mt-1">
              {restaurantInfo.subtitle} • {restaurantInfo.address}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs">
            <button
              onClick={() => setIsInfoOpen(true)}
              className="hover:text-[#a83b24] transition-colors cursor-pointer"
            >
              Horarios & Ubicación
            </button>
            <button
              onClick={() => setIsTableModalOpen(true)}
              className="hover:text-[#a83b24] transition-colors cursor-pointer"
            >
              Cambiar Mesa ({tableNumber})
            </button>
            <button
              onClick={navigateToAdmin}
              className="text-stone-500 hover:text-[#a83b24] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Acceso Administrador (/admin)</span>
            </button>
            <span className="text-stone-700 font-medium">
              Tel: {restaurantInfo.phone}
            </span>
          </div>

          <div className="text-xs text-stone-400">
            <p>© {new Date().getFullYear()} {restaurantInfo.name}. Menú digital conectado a Cloud Firestore.</p>
          </div>
        </div>
      </footer>

      {/* Dish Detailed View Modal */}
      <ItemDetailModal
        item={selectedItem}
        currency={restaurantInfo.currency}
        onClose={() => setSelectedItem(null)}
        onAddToCart={(item, qty, notes) => handleAddToCart(item, qty, notes)}
      />

      {/* Interactive Order Drawer */}
      <OrderDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        currency={restaurantInfo.currency}
        tableNumber={tableNumber}
        onChangeTable={setTableNumber}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        restaurant={restaurantInfo}
      />

      {/* Restaurant Info Modal */}
      <RestaurantInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        restaurant={restaurantInfo}
      />

      {/* Table Selector Modal */}
      <TableSelectorModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        currentTable={tableNumber}
        onSelectTable={setTableNumber}
      />
    </div>
  );
}
