import React from 'react';
import { ChartPie, Home, ReceiptText } from 'lucide-react';
import { ViewType } from '../types';

interface NavItemProps {
  id: ViewType;
  icon: any;
  label: string;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

const NavItem: React.FC<NavItemProps> = ({ id, icon: Icon, label, currentView, setCurrentView }) => {
  const isActive = currentView === id;
  return (
    <button
      onClick={() => setCurrentView(id)}
      className="flex flex-col items-center gap-1 py-1 px-3 transition-all"
    >
      <div
        className={`p-2.5 rounded-2xl transition-all ${
          isActive ? 'bg-slate-100' : 'bg-transparent'
        }`}
      >
        <Icon
          className={`w-6 h-6 transition-all ${
            isActive ? 'text-slate-900 stroke-[2px]' : 'text-slate-400 stroke-[1.75px]'
          }`}
        />
      </div>
      <span
        className={`text-[10px] font-semibold tracking-wide transition-all ${
          isActive ? 'text-slate-900' : 'text-slate-400'
        }`}
      >
        {label}
      </span>
    </button>
  );
};

interface BottomNavProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 sm:px-6 py-1 z-50 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)]">
      <div className="max-w-4xl mx-auto flex items-center justify-around">
        <NavItem id="dashboard"  icon={Home}        label="Home"      currentView={currentView} setCurrentView={setCurrentView} />
        <NavItem id="history"    icon={ReceiptText} label="Transactions"   currentView={currentView} setCurrentView={setCurrentView} />
        <NavItem id="analytics"  icon={ChartPie}    label="Analytics" currentView={currentView} setCurrentView={setCurrentView} />
        {/* <NavItem id="settings"   icon={SettingsIcon} label="Settings" currentView={currentView} setCurrentView={setCurrentView} /> */}
      </div>
    </nav>
  );
};
