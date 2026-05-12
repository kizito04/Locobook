import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { ArrowLeft, UserCircle, Search, X, LogOut, ChevronRight, MessageCircle, Download, RefreshCcw, Layers, DollarSign, MessageSquare, Star, Sparkles, Settings as SettingsIcon, Briefcase, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction, ViewType } from '../types';
import { CurrencySelector } from './CurrencySelector';
import { DataExport } from './DataExport';

interface HeaderProps {
  user: User;
  transactions: Transaction[];
  onLogout: () => void;
  isSearchVisible: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  toggleSearch: () => void;
  setIsAssistantOpen: (open: boolean) => void;
  setCurrentView: (view: ViewType) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  activeBusinessName: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  transactions,
  onLogout,
  isSearchVisible,
  searchTerm,
  setSearchTerm,
  toggleSearch,
  setIsAssistantOpen,
  setCurrentView,
  isProfileOpen,
  setIsProfileOpen,
  currency,
  setCurrency,
  activeBusinessName
}) => {
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-50 sticky top-0 z-40 w-full shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {isSearchVisible ? (
            <motion.div
              key="search-bar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex items-center gap-3"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search transactions..."
                  className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>
              <button onClick={toggleSearch} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="header-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 shadow-sm active:scale-95 transition-transform shrink-0"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserCircle className="w-full h-full text-slate-300" />
                  )}
                </button>
                
                <button 
                  onClick={() => setCurrentView('businessHub')}
                  className="flex items-center gap-2 px-1.5 py-1 rounded-xl hover:bg-slate-50 transition-colors text-left min-w-0"
                >
                  <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate max-w-[120px] sm:max-w-[200px]">
                    {activeBusinessName ? activeBusinessName : 'Locobook'}
                  </h1>
                  {activeBusinessName ? (
                    <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-bold rounded-md uppercase tracking-wider shrink-0">
                      Biz
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-bold rounded-md uppercase tracking-wider shrink-0">
                      Me
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleSearch}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <Search className="w-4.5 h-4.5" />
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    <MoreVertical className="w-4.5 h-4.5" />
                  </button>
                  
                  {/* Simple Dropdown */}
                  <AnimatePresence>
                    {isMoreMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsMoreMenuOpen(false)}
                        />
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
                        >
                          <button
                            onClick={() => {
                              setIsAssistantOpen(true);
                              setIsMoreMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Sparkles className="w-4 h-4 fill-blue-500" />
                            AI Assistant
                          </button>
                          <button
                            onClick={() => {
                              setCurrentView('businessHub');
                              setIsMoreMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <Briefcase className="w-4 h-4" />
                            Manage Business
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isProfileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed inset-0 z-50 overflow-y-auto bg-slate-100"
            >
              <div className="min-h-screen px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCurrencyOpen(false);
                      setIsExportOpen(false);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
                  >
                    <RefreshCcw className="w-3 h-3" />
                  </button>
                </div>

                <div className="mt-4 flex flex-col items-center gap-2 text-center">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-500 shadow-sm">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserCircle className="w-10 h-10" />
                    )}
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-slate-900">{user.displayName || 'Locobook User'}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCurrencyOpen(true);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left shadow-sm transition hover:border-slate-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        <DollarSign className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">Currency</p>
                        <p className="text-[10px] text-slate-500 leading-none">Current: {currency}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsExportOpen(true);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left shadow-sm transition hover:border-slate-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        <Download className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">Export / Import data</p>
                        <p className="text-[10px] text-slate-500 leading-none">Download transactions</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => window.open('mailto:kizitoahaisibwe04@gmail.com', '_blank')}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left shadow-sm transition hover:border-slate-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        <MessageSquare className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">Contact Center</p>
                        <p className="text-[10px] text-slate-500 leading-none">Get help or request</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => window.open('https://example.com/rate', '_blank')}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left shadow-sm transition hover:border-slate-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        <Star className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">Rate app</p>
                        <p className="text-[10px] text-slate-500 leading-none">Leave feedback</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('settings');
                      setIsProfileOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left shadow-sm transition hover:border-slate-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        <SettingsIcon className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">Settings</p>
                        <p className="text-[10px] text-slate-500 leading-none">App preferences</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-100"
                >
                  <LogOut className="w-2.5 h-2.5" />
                  Log out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CurrencySelector
        isOpen={isCurrencyOpen}
        onClose={() => setIsCurrencyOpen(false)}
        currentCurrency={currency}
        onSelect={(code) => setCurrency(code)}
        onSelectComplete={() => {
          setIsProfileOpen(false);
          setCurrentView('dashboard');
        }}
      />

      <DataExport
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        transactions={transactions}
        currency={currency}
      />
    </header>
  );
};

