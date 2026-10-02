import React from 'react';
import { FilterState } from '../types';
import { SlidersHorizontal, ArrowUpDown, Check } from 'lucide-react';

interface CategoryFilterBarProps {
  filter: FilterState;
  onFilterChange: React.Dispatch<React.SetStateAction<FilterState>>;
  totalProductsCount: number;
  filteredCount: number;
  availableCategories: string[];
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  filter,
  onFilterChange,
  filteredCount,
  availableCategories,
}) => {
  return (
    <div className="bg-[#121522] border border-[#23273a] rounded-2xl p-4 mb-8 space-y-4 shadow-xl">
      
      {/* Top Bar: Horizontal Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {availableCategories.map((cat) => {
          const isSelected = filter.category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() =>
                onFilterChange(prev => ({ ...prev, category: cat }))
              }
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-gold-gradient text-black shadow-lg shadow-[#d4af37]/20 scale-105'
                  : 'bg-[#181c2c] text-[#a1a8bd] hover:text-white hover:bg-[#20253b]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Controls: Price, Sort, Stock Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#1d2133]">
        
        {/* Count Indicator */}
        <div className="text-xs text-[#8e95ab] font-medium flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Mostrando <strong className="text-white">{filteredCount}</strong> artículos</span>
        </div>

        {/* Right Filter Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Stock Toggle */}
          <button
            type="button"
            onClick={() =>
              onFilterChange(prev => ({ ...prev, inStockOnly: !prev.inStockOnly }))
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
              filter.inStockOnly
                ? 'bg-[#201c0d] border-[#d4af37] text-[#f5e3a9]'
                : 'bg-[#181c2c] border-[#252a3f] text-[#8e95ab] hover:text-white'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
              filter.inStockOnly ? 'bg-[#d4af37] border-[#d4af37]' : 'border-[#4a5168]'
            }`}>
              {filter.inStockOnly && <Check className="w-3 h-3 text-black stroke-[3]" />}
            </div>
            <span>Solo en Stock</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-[#181c2c] border border-[#252a3f] rounded-xl px-3 py-1.5 text-xs text-[#a0a8be]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#d4af37]" />
            <select
              value={filter.sortBy}
              onChange={(e) =>
                onFilterChange(prev => ({
                  ...prev,
                  sortBy: e.target.value as FilterState['sortBy'],
                }))
              }
              className="bg-transparent text-white font-semibold outline-none cursor-pointer text-xs"
            >
              <option value="featured" className="bg-[#121522] text-white">Destacados</option>
              <option value="price-asc" className="bg-[#121522] text-white">Menor Precio</option>
              <option value="price-desc" className="bg-[#121522] text-white">Mayor Precio</option>
              <option value="rating" className="bg-[#121522] text-white">Mejor Valorados</option>
            </select>
          </div>

        </div>

      </div>

    </div>
  );
};
