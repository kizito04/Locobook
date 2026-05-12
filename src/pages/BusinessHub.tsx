import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  ChevronLeft, 
  Plus, 
  User as UserIcon,
  ChevronRight,
  Briefcase,
  ArrowRightLeft
} from 'lucide-react';
import { Business, ViewType } from '../types';

interface BusinessHubProps {
  businesses: Business[];
  activeBusinessId: string | null;
  setActiveBusinessId: (id: string | null) => void;
  setCurrentView: (view: ViewType) => void;
}

export const BusinessHub: React.FC<BusinessHubProps> = ({
  businesses,
  activeBusinessId,
  setActiveBusinessId,
  setCurrentView
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manage Your Businesses</h2>
          <p className="text-xs text-slate-500 font-medium">You can switch between your active contexts</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Personal Mode Option */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Personal</h3>
          <button
            onClick={() => {
              setActiveBusinessId(null);
              setCurrentView('dashboard');
            }}
            className={`w-full p-5 rounded-[2rem] border transition-all flex items-center justify-between group ${
              activeBusinessId === null 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-white border-slate-100 text-slate-900 hover:border-indigo-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                activeBusinessId === null ? 'bg-white/20' : 'bg-slate-50 text-indigo-600'
              }`}>
                <UserIcon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm">Personal Finances</h4>
                <p className={`text-[10px] font-medium ${activeBusinessId === null ? 'text-white/70' : 'text-slate-400'}`}>
                  Your daily income and expenses
                </p>
              </div>
            </div>
            <ArrowRightLeft className={`w-5 h-5 transition-transform group-hover:scale-110 ${
              activeBusinessId === null ? 'text-white/50' : 'text-slate-300'
            }`} />
          </button>
        </div>

        {/* Businesses List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Businesses</h3>
            <button
              onClick={() => setCurrentView('businessRegistration')}
              className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-wider"
            >
              + Register New
            </button>
          </div>

          {businesses.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
              <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-medium px-8">
                You haven't registered any businesses yet.
              </p>
              <button
                onClick={() => setCurrentView('businessRegistration')}
                className="mt-4 px-6 py-2.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Register First Business
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {businesses.map((biz) => (
                <button
                  key={biz.id}
                  onClick={() => {
                    setActiveBusinessId(biz.id);
                    setCurrentView('dashboard');
                  }}
                  className={`w-full p-5 rounded-[2rem] border transition-all flex items-center justify-between group ${
                    activeBusinessId === biz.id 
                      ? 'bg-amber-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : 'bg-white border-slate-100 text-slate-900 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      activeBusinessId === biz.id ? 'bg-white/20' : 'bg-slate-50 text-indigo-600'
                    }`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="text-left min-w-0">
                      <h4 className="font-bold text-sm truncate">{biz.name}</h4>
                      <p className={`text-[10px] font-medium truncate ${activeBusinessId === biz.id ? 'text-white/70' : 'text-slate-400'}`}>
                        {biz.description || 'Business account'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                    activeBusinessId === biz.id ? 'text-white/50' : 'text-slate-300'
                  }`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

    </motion.div>
  );
};
