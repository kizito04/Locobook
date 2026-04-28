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
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <div className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm">
          <SettingsIcon className="w-6 h-6 text-indigo-600" />
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden border-4 border-slate-50 shadow-sm">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserCircle className="w-full h-full text-slate-300" />
            )}
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900">{user.displayName}</h4>
            <p className="text-sm text-slate-400 font-medium">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      {/* Category Management */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <Tags className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Categories</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <CategoryIcon iconName={cat.icon} className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-slate-700">{cat.name}</span>
              </div>
              <button 
                onClick={() => handleDeleteCategory(cat.id)}
                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance & Preferences */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Currency</p>
          <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100" defaultValue="UGX">
            <option value="UGX">UGX (Shs)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Appearance</p>
          <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl">
            <button className="flex-1 bg-white border border-slate-100 text-indigo-600 rounded-xl py-3 text-xs font-bold shadow-sm">Light</button>
            <button className="flex-1 text-slate-400 rounded-xl py-3 text-xs font-bold opacity-50 cursor-not-allowed">Dark</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
