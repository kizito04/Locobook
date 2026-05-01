import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { ArrowLeft, UserCircle, Search, X, LogOut, ChevronRight, MessageCircle, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from '../types';

interface HeaderProps {
  user: User;
  transactions: Transaction[];
  onLogout: () => void;
  isSearchVisible: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  toggleSearch: () => void;
  setIsAssistantOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  transactions,
  onLogout,
  isSearchVisible, 
  searchTerm, 
  setSearchTerm, 
  toggleSearch,
  setIsAssistantOpen
}) => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [exportPeriod, setExportPeriod] = useState<'7d' | '30d' | 'all'>('all');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');

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
              className="fixed inset-0 bg-white p-6 sm:p-8 z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-between gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setIsAccountOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Close</span>
                </button>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Signed in as</p>
                  <p className="font-semibold text-slate-900 truncate max-w-[180px]">{user.displayName || user.email}</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[1.5rem] border border-slate-100 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
                      ) : (
                        <UserCircle className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Your account</p>
                      <p className="font-semibold text-slate-900">{user.displayName || 'Profile'}</p>
                    </div>
                  </div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                  >
                    {['USD', 'EUR', 'GBP', 'KES', 'NGN', 'ZAR'].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="rounded-[1.5rem] border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Export data</p>
                        <p className="text-xs text-slate-500">Choose period and format</p>
                      </div>
                      <Download className="w-5 h-5 text-indigo-600" />
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        {[
                          { value: '7d', label: 'Last 7 days' },
                          { value: '30d', label: 'Last 30 days' },
                          { value: 'all', label: 'All time' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setExportPeriod(option.value as '7d' | '30d' | 'all')}
                            className={`rounded-full px-3 py-2 text-xs font-semibold transition ${exportPeriod === option.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {['csv', 'pdf'].map((format) => (
                          <button
                            key={format}
                            type="button"
                            onClick={() => setExportFormat(format as 'csv' | 'pdf')}
                            className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${exportFormat === format ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          >
                            {format.toUpperCase()}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleExport}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Export {exportFormat.toUpperCase()}
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setIsAccountOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-3xl bg-rose-50 text-rose-600 font-semibold hover:bg-rose-100 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
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



