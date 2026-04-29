import React from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, UserCircle, LogOut, Tags, Trash2 } from 'lucide-react';
import { User } from 'firebase/auth';
import { Category } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';

interface SettingsProps {
  user: User;
  onLogout: () => void;
  categories: Category[];
  handleDeleteCategory: (id: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  user,
  onLogout,
  categories,
  handleDeleteCategory
}) => {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 sm:space-y-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Settings</h2>
        <div className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm">
          <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
        </div>
      </div>



      {/* Category Management */}
      <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <Tags className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">Categories</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <CategoryIcon iconName={cat.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-700">{cat.name}</span>
              </div>
              <button 
                onClick={() => handleDeleteCategory(cat.id)}
                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-100 rounded-lg transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance & Preferences */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-3 sm:space-y-4">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Currency</p>
          <select className="w-full bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100" defaultValue="UGX">
            <option value="UGX">UGX (Shs)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-3 sm:space-y-4">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Appearance</p>
          <div className="flex gap-2 p-1 bg-slate-50 rounded-xl sm:rounded-2xl">
            <button className="flex-1 bg-white border border-slate-100 text-indigo-600 rounded-lg sm:rounded-xl py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold shadow-sm">Light</button>
            <button className="flex-1 text-slate-400 rounded-lg sm:rounded-xl py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold opacity-50 cursor-not-allowed">Dark</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
