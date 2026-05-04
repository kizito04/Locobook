import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, CheckCircle2, Trash2 } from 'lucide-react';
import { Category } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';

interface CategoriesProps {
  categories: Category[];
  onAddClick: () => void;
  onDelete: (id: string) => void;
  successMessage: string | null;
}

export const Categories: React.FC<CategoriesProps> = ({
  categories,
  onAddClick,
  onDelete,
  successMessage
}) => {
  return (
    <motion.div
      key="categories"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">All Categories ({categories.length})</h2>
        <button 
          onClick={onAddClick}
          className="bg-indigo-600 text-white py-2 px-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-medium"
          >
            <CheckCircle2 className="w-5 h-5" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {categories.map(cat => (
          <motion.div 
            key={cat.id} 
            layout
            className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 group hover:border-indigo-100 transition-all"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <CategoryIcon iconName={cat.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-base sm:text-lg font-bold text-slate-700">{cat.name}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={() => onDelete(cat.id)} 
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4 sm:w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
