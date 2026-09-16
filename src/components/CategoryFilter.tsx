import React from 'react';
import { 
  Search, 
  X, 
  LayoutGrid, 
  List, 
  Utensils, 
  Salad, 
  Flame, 
  CakeSlice, 
  Star, 
  TrendingUp, 
  Leaf, 
  Wheat, 
  Fish,
  SlidersHorizontal
} from 'lucide-react';
import { MenuCategory, DietaryTag } from '../types';

interface CategoryFilterProps {
  activeCategory: MenuCategory;
  onSelectCategory: (category: MenuCategory) => void;
  categoryCounts: {
    todas: number;
    entradas: number;
    platos_fuertes: number;
    postres: number;
    [key: string]: number;
  };
  extraCategories?: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: DietaryTag | 'todos';
  onSelectTag: (tag: DietaryTag | 'todos') => void;
  viewMode: 'grid' | 'list';
  onToggleViewMode: (mode: 'grid' | 'list') => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts,
  extraCategories = [],
  searchQuery,
  onSearchChange,
  selectedTag,
  onSelectTag,
  viewMode,
  onToggleViewMode,
}) => {
  const baseCategories: { id: MenuCategory; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'todas', label: 'Toda la Carta', count: categoryCounts.todas || 0, icon: <Utensils className="w-4 h-4" /> },
    { id: 'entradas', label: 'Entradas', count: categoryCounts.entradas || 0, icon: <Salad className="w-4 h-4" /> },
    { id: 'platos_fuertes', label: 'Platos Fuertes', count: categoryCounts.platos_fuertes || 0, icon: <Flame className="w-4 h-4" /> },
    { id: 'postres', label: 'Postres', count: categoryCounts.postres || 0, icon: <CakeSlice className="w-4 h-4" /> },
  ];

  const additionalCats = extraCategories
    .filter((cat) => !['todas', 'entradas', 'platos_fuertes', 'postres'].includes(cat))
    .map((cat) => ({
      id: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' '),
      count: categoryCounts[cat] || 0,
      icon: <Utensils className="w-4 h-4" />,
    }));

  const categories = [...baseCategories, ...additionalCats];

  const dietaryTags: { id: DietaryTag | 'todos'; label: string; icon: React.ReactNode }[] = [
    { id: 'todos', label: 'Todos', icon: <SlidersHorizontal className="w-3 h-3" /> },
    { id: 'Chef', label: 'Sugerencia Chef', icon: <Star className="w-3 h-3" /> },
    { id: 'Popular', label: 'Favoritos', icon: <TrendingUp className="w-3 h-3" /> },
    { id: 'Vegetariano', label: 'Vegetariano', icon: <Leaf className="w-3 h-3" /> },
    { id: 'Sin Gluten', label: 'Sin Gluten', icon: <Wheat className="w-3 h-3" /> },
    { id: 'Pescado Fresco', label: 'Pescado Fresco', icon: <Fish className="w-3 h-3" /> },
  ];

  return (
    <div className="sticky top-16 sm:top-20 z-30 bg-[#f7f6f2]/95 backdrop-blur-md border-b border-stone-300/80 shadow-xs py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Top Row: Search and View Mode */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar platillo, ingrediente, sabor..."
              className="w-full pl-10 pr-9 py-2 rounded-sm bg-white border border-stone-300 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-[#a83b24] focus:ring-1 focus:ring-[#a83b24] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Toggle (Grid / List) */}
          <div className="flex items-center justify-end space-x-2">
            <div className="flex items-center bg-white p-0.5 rounded-sm border border-stone-300">
              <button
                id="view-grid-btn"
                onClick={() => onToggleViewMode('grid')}
                className={`px-2.5 py-1.5 rounded-xs text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#1c1917] text-white font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Vista en mosaico fotográfico"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden xs:inline uppercase tracking-wider text-[11px]">Mosaico</span>
              </button>
              <button
                id="view-list-btn"
                onClick={() => onToggleViewMode('list')}
                className={`px-2.5 py-1.5 rounded-xs text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#1c1917] text-white font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Vista en lista detallada"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden xs:inline uppercase tracking-wider text-[11px]">Lista</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Navigation Pills -> Crisp Geometric Rectangular Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar pt-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`category-tab-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-sm text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer border ${
                  isActive
                    ? 'bg-[#a83b24] text-white border-[#a83b24] shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-50 hover:text-stone-900 border-stone-300'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-[#a83b24]'}>{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-xs font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Dietary Preferences & Badges -> Geometric Micro Badges */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {dietaryTags.map((tag) => {
            const isSelected = selectedTag === tag.id;
            return (
              <button
                key={tag.id}
                id={`tag-filter-${tag.id}`}
                onClick={() => onSelectTag(tag.id)}
                className={`px-3 py-1 rounded-sm whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0 text-xs font-medium cursor-pointer border ${
                  isSelected
                    ? 'bg-[#1c1917] text-white border-[#1c1917] font-semibold shadow-xs'
                    : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 border-stone-300/80'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-stone-400'}>{tag.icon}</span>
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
