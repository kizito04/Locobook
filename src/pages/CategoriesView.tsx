import React from 'react';
import { motion } from 'motion/react';
import { PlusCircle } from 'lucide-react';

interface CategoriesViewProps {
  setIsAddCategoryModalOpen: (isOpen: boolean) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  setIsAddCategoryModalOpen,
}) => {
  return (
    <motion.div
      key="categories-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center min-h-[60vh]"
    >
      <button 
        onClick={() => setIsAddCategoryModalOpen(true)}
        className="w-full max-w-xs py-4 bg-blue-600 text-white rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
      >
        <PlusCircle className="w-5 h-5" />
        Add New Category
      </button>
    </motion.div>
  );
};
