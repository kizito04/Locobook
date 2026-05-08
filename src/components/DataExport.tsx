import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Calendar, Download, FileText, Check } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface DataExportProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currency: string;
}

type Period = 'current_month' | 'last_30' | 'last_90' | 'last_365' | 'custom';
type Format = 'csv' | 'pdf';

export const DataExport: React.FC<DataExportProps> = ({
  isOpen,
  onClose,
  transactions,
  currency
}) => {
  const [period, setPeriod] = useState<Period>('current_month');
  const [format, setFormat] = useState<Format>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filterTransactions = () => {
    const now = new Date();
    const cutoff = new Date();

    if (period === 'current_month') {
      cutoff.setDate(1);
      cutoff.setHours(0, 0, 0, 0);
    } else if (period === 'last_30') {
      cutoff.setDate(now.getDate() - 30);
    } else if (period === 'last_90') {
      cutoff.setDate(now.getDate() - 90);
    } else if (period === 'last_365') {
      cutoff.setFullYear(now.getFullYear() - 1);
    } else if (period === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return transactions.filter(tx => {
        const d = tx.date.toDate();
        return d >= start && d <= end;
      });
    } else {
      return transactions; // Fallback
    }

    return transactions.filter(tx => tx.date.toDate() >= cutoff);
  };

  const downloadFile = (content: BlobPart, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const generateCsv = (filtered: Transaction[]) => {
    const headers = ['Date', 'Type', 'Description', 'Category', `Amount (${currency})`];
    const rows = filtered.map(tx => [
      tx.date.toDate().toLocaleDateString(),
      tx.type.toUpperCase(),
      tx.description,
      tx.category || 'Uncategorized',
      tx.amount.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
  };

  const escapePdf = (text: string) => text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  const generatePdf = (filtered: Transaction[]) => {
    const title = `Locobook Export - ${period.replace('_', ' ').toUpperCase()}`;
    const dateStr = new Date().toLocaleDateString();
    
    // Simple PDF table simulation
    const lines = [
      `BT /F1 16 Tf 72 750 Td (${escapePdf(title)}) Tj ET`,
      `BT /F1 10 Tf 72 735 Td (Date: ${escapePdf(dateStr)} | Currency: ${currency}) Tj ET`,
      `BT /F1 10 Tf 72 710 Td (DATE           TYPE      DESCRIPTION           CATEGORY          AMOUNT) Tj ET`,
      `72 705 m 540 705 l S` // Horizontal line
    ];

    let y = 690;
    filtered.forEach(tx => {
      if (y < 50) return; // Simple page break prevention (one page only for this basic generator)
      const date = tx.date.toDate().toLocaleDateString();
      const type = tx.type.toUpperCase();
      const desc = tx.description.substring(0, 20);
      const cat = (tx.category || 'Uncat').substring(0, 15);
      const amt = tx.amount.toFixed(2);
      
      lines.push(`BT /F1 9 Tf 72 ${y} Td (${escapePdf(date.padEnd(15))} ${escapePdf(type.padEnd(10))} ${escapePdf(desc.padEnd(22))} ${escapePdf(cat.padEnd(18))} ${escapePdf(amt)}) Tj ET`);
      y -= 15;
    });

    const stream = lines.join('\n');
    const length = stream.length;

    return `
%PDF-1.3
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length ${length} >> stream
${stream}
endstream endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000111 00000 n 
0000000221 00000 n 
0000000290 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
${312 + length}
%%EOF`;
  };

  const handleExport = () => {
    const filtered = filterTransactions();
    if (format === 'csv') {
      const csv = generateCsv(filtered);
      downloadFile(csv, `locobook-export-${new Date().getTime()}.csv`, 'text/csv');
    } else {
      const pdf = generatePdf(filtered);
      downloadFile(pdf, `locobook-export-${new Date().getTime()}.pdf`, 'application/pdf');
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[60] bg-slate-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold text-slate-900">Export Data</h2>
            <div className="w-10" /> {/* Spacer */}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
            {/* Period Section */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider">Select Period</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'current_month', label: 'Current Month' },
                  { id: 'last_30', label: 'Last 30 Days' },
                  { id: 'last_90', label: 'Last 90 Days' },
                  { id: 'last_365', label: 'Last 365 Days' },
                  { id: 'custom', label: 'Custom Range', icon: <Calendar className="w-3.5 h-3.5" /> }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setPeriod(opt.id as Period)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all ${
                      period === opt.id
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className={`text-sm font-bold ${period === opt.id ? 'text-amber-700' : 'text-slate-600'}`}>
                      {opt.label}
                    </span>
                    {period === opt.id ? (
                       <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />
                    ) : (
                      opt.icon && <div className="text-slate-400">{opt.icon}</div>
                    )}
                  </button>
                ))}
              </div>

              {period === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase ml-1">Start Date</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase ml-1">End Date</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Format Section */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider">Select Format</label>
              <div className="flex gap-3">
                {[
                  { id: 'csv', label: 'CSV', icon: <FileText className="w-4 h-4" /> },
                  { id: 'pdf', label: 'PDF', icon: <FileText className="w-4 h-4" /> }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFormat(opt.id as Format)}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 transition-all ${
                      format === opt.id
                        ? 'border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-100'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {opt.icon}
                    <span className="text-sm font-bold">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Export Button */}
          <div className="border-t border-slate-200 bg-white p-5">
            <button
              onClick={handleExport}
              disabled={period === 'custom' && (!startDate || !endDate)}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 text-base font-bold text-white shadow-xl transition hover:bg-slate-800 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              Export Now
            </button>
            <p className="mt-3 text-center text-[10px] text-slate-400 font-medium px-6">
              Your data will be generated and downloaded to your device as a {format.toUpperCase()} file.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
