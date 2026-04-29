import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Sparkles, Info, Edit2, Palette, Lightbulb, Plus } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  selectedIcon: string;
  setSelectedIcon: (icon: string) => void;
  colorFill: string;
  setColorFill: (color: string) => void;
  iconColor: string;
  setIconColor: (color: string) => void;
}

const AVAILABLE_ICONS = [
  'Receipt', 'ShoppingCart', 'Utensils', 'Shapes', 'Car', 
  'Coffee', 'Music', 'Globe', 'Heart', 'Monitor', 'Phone', 'Camera', 'Gift', 
  'MapPin', 'Anchor', 'Award', 'Activity', 'Box', 'Compass', 'Cpu', 
  'CreditCard', 'Droplet', 'Feather', 'Flag', 'Gamepad2', 'GraduationCap', 
  'Headphones', 'Key', 'Laptop', 'Lightbulb', 'Map', 'Mic', 'Moon', 
  'Package', 'PenTool', 'PieChart', 'Printer', 'Radio', 'Scissors', 
  'Shield', 'Smartphone', 'Star', 'Sun', 'Target', 'Ticket', 'Trash2', 
  'TrendingUp', 'Truck', 'Tv', 'Umbrella', 'Video', 'Watch', 'Wifi'
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newCategoryName,
  setNewCategoryName,
  selectedIcon,
  setSelectedIcon,
  colorFill,
  setColorFill,
  iconColor,
  setIconColor
}) => {
  const [showAllIcons, setShowAllIcons] = useState(false);

  const displayedIcons = showAllIcons ? AVAILABLE_ICONS : AVAILABLE_ICONS.slice(0, 9);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col h-full w-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border-b border-slate-100">
            <button onClick={onClose} className="p-2 text-slate-900">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-slate-900">Add Category</h2>
            <button className="p-2 text-slate-900">
              <Search className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-32">
            
            {/* Preview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: colorFill, color: iconColor }}
              >
                <CategoryIcon iconName={selectedIcon} className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">PREVIEW</p>
                <h3 className="text-xl font-bold text-slate-900 truncate">{newCategoryName || 'New Category'}</h3>
                <p className="text-xs text-slate-500 truncate">Intelligent categorization ready</p>
              </div>
            </div>

            <form id="add-category-form" onSubmit={onSubmit} className="space-y-6">
              
              {/* Category Name */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">
                  CATEGORY NAME
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Travel, Office Supplies..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-4 pr-10 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-800 placeholder-slate-400"
                    required
                  />
                  <Sparkles className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                </div>
                <div className="flex items-center gap-1.5 ml-1 mt-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-500" />
                  <p className="text-[11px] text-emerald-600 font-medium">AI will automatically suggest this for similar entries.</p>
                </div>
              </div>

              {/* Choose Icon */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">
                  CHOOSE ICON
                </label>
                <div className="bg-slate-100/50 border border-slate-200 rounded-xl p-3">
                  <div className="grid grid-cols-5 gap-2">
                    {displayedIcons.map(iconName => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setSelectedIcon(iconName)}
                        className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                          selectedIcon === iconName 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-[#E2E8F0]/50 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <CategoryIcon iconName={iconName} className="w-6 h-6" />
                      </button>
                    ))}
                    {!showAllIcons && (
                      <button
                        type="button"
                        onClick={() => setShowAllIcons(true)}
                        className="aspect-square rounded-xl flex items-center justify-center transition-all bg-[#E2E8F0]/50 text-slate-700 hover:bg-slate-200 font-medium text-[10px] uppercase tracking-wider"
                      >
                        More
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">
                    COLOR FILL
                  </label>
                  <div className="relative bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={colorFill}
                        onChange={(e) => setColorFill(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                      <div 
                        className="w-6 h-8 rounded-md flex-shrink-0" 
                        style={{ backgroundColor: colorFill }}
                      />
                      <span className="text-sm font-medium text-slate-900 uppercase">{colorFill}</span>
                    </div>
                    <Edit2 className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">
                    ICON COLOR
                  </label>
                  <div className="relative bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={iconColor}
                        onChange={(e) => setIconColor(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                      <div 
                        className="w-6 h-8 rounded-md border border-slate-200 flex-shrink-0" 
                        style={{ backgroundColor: iconColor }}
                      />
                      <span className="text-sm font-medium text-slate-900 uppercase">{iconColor}</span>
                    </div>
                    <Palette className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Bottom Fixed Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 flex flex-col gap-2 z-10 pb-6 sm:pb-4">
            <button 
              type="submit"
              form="add-category-form"
              className="w-full py-3.5 bg-black text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full py-3.5 bg-[#E2E8F0]/70 text-slate-700 rounded-full font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};
