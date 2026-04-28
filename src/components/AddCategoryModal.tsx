import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { CategoryIcon, ICON_MAP } from './CategoryIcon';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  selectedIcon: string;
  setSelectedIcon: (icon: string) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newCategoryName,
  setNewCategoryName,
  selectedIcon,
  setSelectedIcon
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Add New Category
              </h3>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <p className="text-sm text-slate-500 mb-8">
              Create a new category for organizing your transactions.
            </p>

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Travel"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Select Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.keys(ICON_MAP).map(iconName => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setSelectedIcon(iconName)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        selectedIcon === iconName 
                          ? 'bg-indigo-50 border-2 border-indigo-600 text-indigo-600' 
                          : 'bg-white border border-slate-100 text-slate-400 hover:border-indigo-200'
                      }`}
                    >
                      <CategoryIcon iconName={iconName} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-4"
              >
                Add Category
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
