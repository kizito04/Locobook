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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-50 px-4 sm:px-6 py-2 z-50 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.05)]">

      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <NavItem id="dashboard" icon={LayoutGrid} label="Home" currentView={currentView} setCurrentView={setCurrentView} />
        <NavItem id="history" icon={ClipboardList} label="History" currentView={currentView} setCurrentView={setCurrentView} />
        <NavItem id="analytics" icon={BarChart3} label="Analytics" currentView={currentView} setCurrentView={setCurrentView} />
        <NavItem id="settings" icon={SettingsIcon} label="Settings" currentView={currentView} setCurrentView={setCurrentView} />
      </div>
    </nav>
  );
};



