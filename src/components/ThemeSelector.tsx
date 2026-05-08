import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, Sun, Moon, Laptop } from 'lucide-react';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onSelect: (theme: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelect
}) => {
  const options = [
    { id: 'System default', label: 'System default', icon: <Laptop className="w-4 h-4" /> },
    { id: 'Light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { id: 'Dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[60] bg-slate-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold text-slate-900">App Theme</h2>
            <div className="w-10" /> {/* Spacer */}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            <div className="space-y-3">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onSelect(opt.id);
                    onClose();
                  }}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 transition-all ${currentTheme === opt.id
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${currentTheme === opt.id ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-amber-100 text-amber-600'
                      }`}>
                      {React.cloneElement(opt.icon as React.ReactElement<{ className?: string }>, { className: 'w-3 h-3' })}
                    </div>
                    <span className={`text-xs font-bold ${currentTheme === opt.id ? 'text-amber-700' : 'text-slate-700'}`}>
                      {opt.label}
                    </span>
                  </div>
                  {currentTheme === opt.id && (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
