import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { MenuItemCard } from './components/MenuItemCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { OrderDrawer } from './components/OrderDrawer';
import { RestaurantInfoModal } from './components/RestaurantInfoModal';
import { TableSelectorModal } from './components/TableSelectorModal';
import { menuItems, restaurantInfo } from './data/menuData';
import { MenuCategory, MenuItem, CartItem, DietaryTag } from './types';
import { ShoppingBag, ArrowRight, Salad, Flame, CakeSlice, Utensils, Sparkles } from 'lucide-react';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<DietaryTag | 'todos'>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  
  // Cart / Order state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tableNumber, setTableNumber] = useState<string>(() => {
    try {
      return localStorage.getItem('aura_table') || 'Mesa 04';
    } catch {
      return 'Mesa 04';
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aura_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Sync table to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aura_table', tableNumber);
    } catch {
      // ignore
    }
  }, [tableNumber]);

  // Counts for each category
  const categoryCounts = useMemo(() => {
    return {
      todas: menuItems.length,
      entradas: menuItems.filter((i) => i.category === 'entradas').length,
      platos_fuertes: menuItems.filter((i) => i.category === 'platos_fuertes').length,
      postres: menuItems.filter((i) => i.category === 'postres').length,
    };
  }, []);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
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
        const matchesIngredient = item.ingredients.some((ing) =>
          ing.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesDesc && !matchesIngredient) {
          return false;
        }
      }

      return true;
    });
  }, [activeCategory, selectedTag, searchQuery]);

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
        {filteredItems.length === 0 ? (
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
                    {entradasItems.length} platillos elaborados al momento
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
                    {platosFuertesItems.length} creaciones exclusivas
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
                    {postresItems.length} delicias dulces
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
          </div>
        ) : (
          /* Single Category or Filtered View */
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-300">
              <div className="flex items-center gap-2.5">
                {activeCategory === 'entradas' && <Salad className="w-6 h-6 text-[#a83b24]" />}
                {activeCategory === 'platos_fuertes' && <Flame className="w-6 h-6 text-[#a83b24]" />}
                {activeCategory === 'postres' && <CakeSlice className="w-6 h-6 text-[#a83b24]" />}
                <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900">
                  {activeCategory === 'entradas' && 'Entradas de Autor'}
                  {activeCategory === 'platos_fuertes' && 'Platos Fuertes & Brasas'}
                  {activeCategory === 'postres' && 'Postres Artesanales'}
                  {activeCategory === 'todas' && 'Resultados de Búsqueda'}
                </h2>
              </div>
              <span className="text-xs sm:text-sm text-stone-500 font-medium">
                {filteredItems.length} platillos encontrados
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
              <span className="text-[#a83b24]">{restaurantInfo.currency}{totalCartPrice.toFixed(2)}</span>
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
            <span className="text-stone-700 font-medium">
              Tel: {restaurantInfo.phone}
            </span>
          </div>

          <div className="text-xs text-stone-400">
            <p>© {new Date().getFullYear()} {restaurantInfo.name}. Menú digital de alta gastronomía.</p>
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
