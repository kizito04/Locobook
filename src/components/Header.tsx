import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { UserCircle, Search, X, LogOut, ChevronRight, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  isSearchVisible: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  toggleSearch: () => void;
  setIsAssistantOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  onLogout,
  isSearchVisible, 
  searchTerm, 
  setSearchTerm, 
  toggleSearch,
  setIsAssistantOpen
}) => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-50 sticky top-0 z-40">
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
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 shadow-sm active:scale-95 transition-transform"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserCircle className="w-full h-full text-slate-300" />
                  )}
                </button>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">Locobook</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssistantOpen(true)}
                  className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-indigo-600" />
                  AI chat
                </button>
                <button 
                  onClick={toggleSearch}
                  className="p-2 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
                >
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Account Info Dropdown */}
      <AnimatePresence>
        {isAccountOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAccountOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-16 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 z-50 overflow-hidden"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden border-4 border-slate-50 shadow-md">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserCircle className="w-full h-full text-slate-300" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{user.displayName}</h3>
                  <p className="text-sm text-slate-400 font-medium">{user.email}</p>
                </div>

                <div className="w-full pt-4 space-y-2">
                  <button 
                    onClick={() => {
                      setIsAccountOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-between p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};



