import React from 'react';
import { User } from 'firebase/auth';
import { UserCircle, Search } from 'lucide-react';

interface HeaderProps {
  user: User;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="bg-white border-b border-slate-50 sticky top-0 z-10 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
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
        <button className="p-2 text-slate-900 hover:bg-slate-50 rounded-full transition-colors">
          <Search className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

