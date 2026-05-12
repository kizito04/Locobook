import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  ChevronLeft, 
  Plus, 
  User as UserIcon,
  ChevronRight,
  Briefcase,
  ArrowRightLeft,
  Pencil,
  Trash2,
  X,
  Save
} from 'lucide-react';
import { Business, ViewType } from '../types';

interface BusinessHubProps {
  businesses: Business[];
  activeBusinessId: string | null;
  setActiveBusinessId: (id: string | null) => void;
  setCurrentView: (view: ViewType) => void;
  handleUpdateBusiness: (id: string, name: string, description: string) => Promise<void>;
  handleDeleteBusiness: (id: string) => Promise<void>;
}

export const BusinessHub: React.FC<BusinessHubProps> = ({
  businesses,
  activeBusinessId,
  setActiveBusinessId,
  setCurrentView,
  handleUpdateBusiness,
  handleDeleteBusiness
}) => {
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const startEdit = (biz: Business) => {
    setEditingBusiness(biz);
    setEditName(biz.name);
    setEditDescription(biz.description || '');
  };

  const handleSave = async () => {
    if (editingBusiness && editName.trim()) {
      await handleUpdateBusiness(editingBusiness.id, editName.trim(), editDescription.trim());
      setEditingBusiness(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 pb-12"
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
          <h2 className="text-xl font-bold text-slate-900">Business Hub</h2>
          <p className="text-xs text-slate-500 font-medium">Switch between contexts</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Personal Mode Option */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Personal</h3>
          <button
            onClick={() => {
              setActiveBusinessId(null);
              setCurrentView('dashboard');
            }}
            className={`w-full p-4 rounded-3xl border transition-all flex items-center justify-between group ${
              activeBusinessId === null 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-white border-slate-100 text-slate-900 hover:border-indigo-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                activeBusinessId === null ? 'bg-white/20' : 'bg-slate-50 text-indigo-600'
              }`}>
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm">Personal Finances</h4>
                <p className={`text-[10px] font-medium ${activeBusinessId === null ? 'text-white/70' : 'text-slate-400'}`}>
                  Daily income & expenses
                </p>
              </div>
            </div>
            <ArrowRightLeft className={`w-4 h-4 transition-transform group-hover:scale-110 ${
              activeBusinessId === null ? 'text-white/50' : 'text-slate-300'
            }`} />
          </button>
        </div>

        {/* Businesses List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your Businesses</h3>
            <button
              onClick={() => setCurrentView('businessRegistration')}
              className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-wider"
            >
              + Register New
            </button>
          </div>

          {businesses.length === 0 ? (
            <div className="text-center py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <Briefcase className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-[10px] text-slate-400 font-medium px-8">
                No businesses registered yet.
              </p>
              <button
                onClick={() => setCurrentView('businessRegistration')}
                className="mt-3 px-5 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Register First Business
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              {businesses.map((biz) => (
                <div 
                  key={biz.id}
                  className={`relative group rounded-3xl border transition-all ${
                    activeBusinessId === biz.id 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                      : 'bg-blue-50/50 border-blue-100 text-slate-900 hover:border-blue-200'
                  }`}
                >
                  <button
                    onClick={() => {
                      setActiveBusinessId(biz.id);
                      setCurrentView('dashboard');
                    }}
                    className="w-full p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        activeBusinessId === biz.id ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="text-left min-w-0 pr-12">
                        <h4 className="font-bold text-sm truncate">{biz.name}</h4>
                        <p className={`text-[10px] font-medium truncate ${activeBusinessId === biz.id ? 'text-white/70' : 'text-slate-400'}`}>
                          {biz.description || 'Business account'}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Actions */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(biz);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        activeBusinessId === biz.id 
                          ? 'hover:bg-white/20 text-white/70 hover:text-white' 
                          : 'hover:bg-blue-100 text-blue-400 hover:text-blue-600'
                      }`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this business? All associated data will be lost.')) {
                          handleDeleteBusiness(biz.id);
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        activeBusinessId === biz.id 
                          ? 'hover:bg-red-500/20 text-white/70 hover:text-white' 
                          : 'hover:bg-red-50 text-red-300 hover:text-red-500'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingBusiness && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingBusiness(null)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 z-[60] shadow-2xl border border-slate-100 max-w-sm mx-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Edit Business</h3>
                <button 
                  onClick={() => setEditingBusiness(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={!editName.trim()}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
