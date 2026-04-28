import React from 'react';
import { User } from 'firebase/auth';
import { UserCircle, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  user: User;
  isSearchVisible: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  toggleSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  isSearchVisible, 
  searchTerm, 
  setSearchTerm, 
  toggleSearch 
}) => {
  return (
    <header className="bg-white border-b border-slate-50 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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
                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 shadow-sm">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserCircle className="w-full h-full text-slate-300" />
                  )}
                </div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">Locobook AI</h1>
              </div>
              <button 
                onClick={toggleSearch}
                className="p-2 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
              >
                <Search className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};


