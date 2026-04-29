import React from 'react';
import { motion } from 'motion/react';
import { Category } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';
import { Sparkles, PlusCircle, ChevronRight } from 'lucide-react';

interface CategoriesViewProps {
  categories: Category[];
  setIsAddCategoryModalOpen: (isOpen: boolean) => void;
  setIsAssistantOpen: (isOpen: boolean) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  setIsAddCategoryModalOpen,
  setIsAssistantOpen
}) => {
  return (
    <motion.div
      key="categories-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 sm:space-y-6 pb-20"
    >
      {/* Smart Categorization Banner */}
      <div className="bg-indigo-50/50 p-4 sm:p-5 rounded-[1.5rem] border border-indigo-100 flex gap-4 shadow-sm items-start">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm sm:text-base font-medium text-slate-800 mb-1">Smart Categorization Active</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            I've categorized 24 new transactions today based on your history. Review them in the History tab.
          </p>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-3 sm:space-y-4">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="bg-white p-4 sm:p-5 rounded-[1.25rem] border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1.25rem] bg-orange-50 text-orange-500 flex items-center justify-center">
                <CategoryIcon iconName={category.icon} className="w-6 h-6" />
              </div>
              <span className="text-sm sm:text-base font-medium text-slate-800">{category.name}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        ))}
      </div>

      {/* Refine Categories Bottom Card */}
      <div className="bg-indigo-50/30 p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm mt-8 relative flex flex-col items-center text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-md -mt-16 sm:-mt-20 mb-4 bg-slate-200">
          <img 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150" 
            alt="AI Avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <h3 className="text-lg sm:text-xl font-medium text-slate-800 mb-2">Want to refine your categories?</h3>
        <p className="text-sm text-slate-500 mb-6">
          "I can help you merge similar categories or suggest tags based on your habits."
        </p>

        <div className="w-full space-y-3 relative z-10">
          <button 
            onClick={() => setIsAddCategoryModalOpen(true)}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <PlusCircle className="w-5 h-5" />
            Add New Category
          </button>
          <button 
            onClick={() => setIsAssistantOpen(true)}
            className="w-full py-4 bg-black text-white rounded-2xl font-medium flex items-center justify-center hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 relative -mt-4 z-[-1]"
          >
            Chat With AI
          </button>
        </div>
      </div>
      
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-24 sm:bottom-28 right-4 sm:right-6 w-14 h-14 bg-white border border-slate-200 rounded-full flex items-center justify-center text-blue-600 shadow-lg hover:bg-slate-50 transition-colors z-30"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    </motion.div>
  );
};
