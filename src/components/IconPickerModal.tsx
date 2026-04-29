import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search } from 'lucide-react';
import { CategoryIcon, ICON_MAP } from './CategoryIcon';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  initialIcon: string;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialIcon
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(initialIcon);

  const allIcons = Object.keys(ICON_MAP);
  const filteredIcons = allIcons.filter(icon => 
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = () => {
    onSelect(selectedIcon);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="relative w-full max-w-sm h-[80vh] flex flex-col bg-[#F8FAFC] rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header & Search */}
            <div className="p-4 bg-white border-b border-slate-100 flex-shrink-0">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Select icon</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search icons"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Icon Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                All Icons ({filteredIcons.length})
              </p>
              <div className="grid grid-cols-6 gap-2">
                {filteredIcons.map(iconName => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`aspect-square flex items-center justify-center rounded-xl transition-all ${
                      selectedIcon === iconName 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <CategoryIcon iconName={iconName} className="w-6 h-6" />
                  </button>
                ))}
              </div>
              {filteredIcons.length === 0 && (
                <p className="text-center text-slate-500 mt-8">No icons found.</p>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-white border-t border-slate-100 flex gap-3 flex-shrink-0">
              <button 
                onClick={onClose}
                className="flex-1 py-3 text-slate-700 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSelect}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors"
              >
                Select
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
