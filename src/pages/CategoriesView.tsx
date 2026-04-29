import React from 'react';
import { motion } from 'motion/react';
import { PlusCircle, Edit2 } from 'lucide-react';
import { Category } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';

interface CategoriesViewProps {
  categories: Category[];
  setIsAddCategoryModalOpen: (isOpen: boolean) => void;
  setEditingCategory: (category: Category) => void;
  setIsEditCategoryModalOpen: (isOpen: boolean) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  setIsAddCategoryModalOpen,
  setEditingCategory,
  setIsEditCategoryModalOpen
}) => {
  return (
    <motion.div
      key="categories-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 pb-20"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-slate-900">Your Categories</h2>
        <span className="text-sm font-medium text-slate-500">{categories.length} Total</span>
      </div>

      <button 
        onClick={() => setIsAddCategoryModalOpen(true)}
        className="w-full py-4 bg-white border-2 border-dashed border-slate-300 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
      >
        <PlusCircle className="w-5 h-5" />
        Add New Category
      </button>

      <div className="space-y-3">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="bg-white p-4 rounded-[1.25rem] border border-slate-100 shadow-sm flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ 
                  backgroundColor: category.colorFill || '#E2E8F0', 
                  color: category.iconColor || '#64748B' 
                }}
              >
                <CategoryIcon iconName={category.icon} className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{category.name}</h3>
                <p className="text-xs text-slate-500 font-medium">Custom Category</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setEditingCategory(category);
                setIsEditCategoryModalOpen(true);
              }}
              className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg hover:text-blue-600 transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
