import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { ArrowLeft, UserCircle, Search, X, LogOut, ChevronRight, MessageCircle, Download, RefreshCcw, Layers, DollarSign, MessageSquare, Star, Settings as SettingsIcon, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction, ViewType } from '../types';

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
  setIsProfileOpen
}) => {
  const [currency, setCurrency] = useState('UGX');
  const [exportPeriod, setExportPeriod] = useState<'7d' | '30d' | 'all'>('all');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const exportTransactions = transactions.filter((tx) => {
    if (exportPeriod === 'all') return true;
    const txDate = tx.date.toDate();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (exportPeriod === '7d' ? 7 : 30));
    return txDate >= cutoff;
  });

  const downloadFile = (content: BlobPart, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const generateCsv = () => {
    const rows = [
      ['Date', 'Description', 'Type', 'Amount', 'Category', 'Currency'],
      ...exportTransactions.map((tx) => [
        tx.date.toDate().toISOString().split('T')[0],
        tx.description,
        tx.type,
        tx.amount.toString(),
        tx.category || '',
        currency
      ])
    ];
    return rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
  };

  const escapePdf = (text: string) => text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  const generatePdf = () => {
    const lines = [
      `Locobook Export (${exportPeriod === '7d' ? 'Last 7 days' : exportPeriod === '30d' ? 'Last 30 days' : 'All time'})`,
      `Currency: ${currency}`,
      ' ',
      ...exportTransactions.map((tx) => `${tx.date.toDate().toISOString().split('T')[0]} | ${tx.type} | ${tx.description} | ${tx.amount} ${currency} | ${tx.category || 'Uncategorized'}`)
    ];

    const streamLines = [`BT`, `/F1 10 Tf`, `72 760 Td`, `(${escapePdf(lines[0])}) Tj`];
    let lineY = 14;
    for (let i = 1; i < lines.length; i += 1) {
      streamLines.push(`0 -${lineY} Td`, `(${escapePdf(lines[i])}) Tj`);
    }
    streamLines.push('ET');
    const stream = streamLines.join('\n');
    const length = stream.length;

    return `
%PDF-1.3
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${length} >>
stream
${stream}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000111 00000 n 
0000000221 00000 n 
0000000290 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${312 + length}
%%EOF
`;
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      const csv = generateCsv();
      downloadFile(csv, `locobook-export-${exportPeriod}.csv`, 'text/csv');
    } else {
      const pdf = generatePdf();
      downloadFile(pdf, `locobook-export-${exportPeriod}.pdf`, 'application/pdf');
    }
  };

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
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
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
                  aria-label="Open AI chat"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
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
              className="fixed inset-0 z-50 overflow-y-auto bg-amber-50"
            >
              <div className="min-h-screen px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
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
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
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
                      setIsCurrencyOpen(prev => !prev);
                      setIsExportOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-left shadow-sm transition hover:border-slate-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                        <DollarSign className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Currency</p>
                        <p className="text-[11px] text-slate-500">Current: {currency}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsExportOpen(prev => !prev);
                      setIsCurrencyOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-left shadow-sm transition hover:border-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                        <Download className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Export / Import data</p>
                        <p className="text-[11px] text-slate-500">Download your transaction history</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => window.open('mailto:support@locobook.example', '_blank')}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-left shadow-sm transition hover:border-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                        <MessageSquare className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Contact Center</p>
                        <p className="text-[11px] text-slate-500">Get help or submit a request</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => window.open('https://example.com/rate', '_blank')}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-left shadow-sm transition hover:border-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                        <Star className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Rate app</p>
                        <p className="text-[11px] text-slate-500">Leave feedback in the app store</p>
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
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-left shadow-sm transition hover:border-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                        <SettingsIcon className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Settings</p>
                        <p className="text-[11px] text-slate-500">App preferences and account actions</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>

                    
                </div>

              {/*  {isCurrencyOpen && (
                  <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900 mb-3">Choose currency</p>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      {['USD', 'EUR', 'GBP', 'KES', 'NGN', 'ZAR'].map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                )}

                {isExportOpen && (
                  <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900 mb-3">Export data</p>
                    <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                      {[
                        { value: '7d', label: 'Last 7 days' },
                        { value: '30d', label: 'Last 30 days' },
                        { value: 'all', label: 'All time' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setExportPeriod(option.value as '7d' | '30d' | 'all')}
                          className={`rounded-full px-3 py-2 font-semibold transition ${exportPeriod === option.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      {['csv', 'pdf'].map((format) => (
                        <button
                          key={format}
                          type="button"
                          onClick={() => setExportFormat(format as 'csv' | 'pdf')}
                          className={`flex-1 rounded-2xl px-3 py-2 text-sm font-semibold transition ${exportFormat === format ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          {format.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleExport}
                      className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                    >
                      Export {exportFormat.toUpperCase()}
                    </button>
                  </div>
                )}

               */}

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-100"
                >
                  <LogOut className="w-2.5 h-2.5" />
                  Log out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};



