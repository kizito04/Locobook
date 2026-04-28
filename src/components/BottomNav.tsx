import React from 'react';
import { motion } from 'motion/react';
import { LayoutGrid, ClipboardList, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { ViewType } from '../types';

interface NavItemProps {
  id: ViewType;
  icon: any;
  label: string;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

const NavItem: React.FC<NavItemProps> = ({ id, icon: Icon, label, currentView, setCurrentView }) => (
  <button
    onClick={() => setCurrentView(id)}
    className={`flex flex-col items-center gap-1.5 p-2 transition-all ${
      currentView === id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-500'
    }`}
  >
    <div className={`p-1.5 rounded-xl transition-all ${currentView === id ? 'bg-indigo-50' : ''}`}>
      <Icon className={`w-6 h-6 ${currentView === id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
    </div>
    <span className={`text-[10px] font-bold tracking-wide ${currentView === id ? 'text-indigo-600' : 'text-slate-400'}`}>
      {label}
    </span>
  </button>
);

interface BottomNavProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-slate-200/50 px-4 py-2 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2rem] flex items-center gap-1 min-w-[320px] sm:min-w-[400px]">
      <div className="flex-1 flex items-center justify-between">
        <NavItem id="dashboard" icon={LayoutGrid} label="Home" currentView={currentView} setCurrentView={setCurrentView} />
        <NavItem id="history" icon={ClipboardList} label="History" currentView={currentView} setCurrentView={setCurrentView} />
        <NavItem id="analytics" icon={BarChart3} label="Analytics" currentView={currentView} setCurrentView={setCurrentView} />
        <NavItem id="settings" icon={SettingsIcon} label="Settings" currentView={currentView} setCurrentView={setCurrentView} />
      </div>
    </nav>
  );
};


