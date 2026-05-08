import React, { useState, useEffect, useRef } from 'react';

import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  writeBatch,
  Timestamp,
  getDocFromServer,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  Transaction,
  ChatMessage,
  OperationType,
  ViewType
} from '../types';
import { handleFirestoreError } from '../utils/errorHandlers';
import { parseTransaction, askAssistant } from '../services/geminiService';
import { formatCurrency } from '../utils/formatters';
import { convertCurrency, BASE_CURRENCY } from '../utils/currencies';

const toLocalMonthKey = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
};

const parseLocalDateKey = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const parseLocalMonthKey = (value: string) => {
  const [year, month] = value.split('-').map(Number);
  if (!year || !month) return null;
  return new Date(year, month - 1, 1);
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const addMonths = (date: Date, months: number) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
};

const isWithinRange = (date: Date, start: Date | null, end: Date | null) => {
  if (!start || !end) return true;
  return date >= start && date < end;
};

export const useLocobook = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [input, setInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(toLocalMonthKey(new Date()));
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('locobook-currency') || 'UGX';
  });

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I am your Locobook AI assistant. How can I help you today?' }
  ]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Auth & Connection Test ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        setCurrentView('dashboard');
        testConnection(user);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('locobook-currency', currency);
  }, [currency]);

  async function testConnection(currentUser: User) {
    try {
      await getDocFromServer(doc(db, 'users', currentUser.uid));
      console.log('Firestore connection successful.');
    } catch (error: any) {
      console.error('Firestore connection test failed:', error);
      if (error?.code === 'unavailable') {
        setError('Could not reach the database. This might be a temporary network issue or a firewall blocking the connection. Try refreshing the page.');
      } else if (error?.message?.includes('the client is offline')) {
        setError('The app is running in offline mode. Please check your internet connection.');
      }
    }
  }

  // --- Firestore Listeners ---
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(txs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });

    return () => unsubscribe();
  }, [user]);

  // --- Auth Actions ---
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError('Failed to sign in. Please try again.');
    }
  };

  const handleLogout = () => signOut(auth);

  // --- Transaction Actions ---
  const handleAddTransaction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !user) return;

    setIsProcessing(true);
    setError(null);

    try {
      const parsed = await parseTransaction(input);
      // Convert the parsed amount from current currency to base currency before saving
      const baseAmount = convertCurrency(parsed.amount, currency, BASE_CURRENCY);

      await addDoc(collection(db, 'transactions'), {
        ...parsed,
        amount: baseAmount,
        category: parsed.category || 'Uncategorized',
        userId: user.uid,
        date: Timestamp.now()
      });

      setInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to process transaction.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `transactions/${id}`);
    }
  };

  const handleDeleteAccountData = async () => {
    if (!user || transactions.length === 0) return;

    const batch = writeBatch(db);
    transactions.forEach((tx) => {
      batch.delete(doc(db, 'transactions', tx.id));
    });

    try {
      await batch.commit();
      setTransactions([]);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'transactions');
    }
  };

  const handleEditTransactionSelection = (tx: Transaction) => {
    setEditingTransaction(tx);
    setCurrentView('editTransaction');
  };

  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
    if (!user) return;

    try {
      // Convert the updated amount from current currency to base currency before saving
      const baseAmount = convertCurrency(updatedTransaction.amount, currency, BASE_CURRENCY);

      await updateDoc(doc(db, 'transactions', updatedTransaction.id), {
        amount: baseAmount,
        type: updatedTransaction.type,
        description: updatedTransaction.description,
        category: updatedTransaction.category,
      });
      setEditingTransaction(null);
      setCurrentView('history');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `transactions/${updatedTransaction.id}`);
    }
  };

  // --- Voice Input ---
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError('Speech recognition is not supported in this browser.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  // --- AI Assistant Actions ---
  const handleAssistantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim()) return;

    const userMsg = assistantInput;
    setAssistantInput('');
    setAssistantMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAssistantTyping(true);

    try {
      const context = `
Summary:
Total Income: ${formatCurrency(totalIncome, currency)}
Total Expenses: ${formatCurrency(totalExpenses, currency)}
Current Balance: ${formatCurrency(balance, currency)}

Recent Transactions:
${transactions.slice(0, 10).map(t =>
        `${t.type === 'income' ? 'Received' : 'Spent'} ${t.amount} for ${t.description} on ${t.date.toDate().toLocaleDateString()}`
      ).join('\n')}`;

      const response = await askAssistant(userMsg, context);
      setAssistantMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setAssistantMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsAssistantTyping(false);
    }
  };

  // --- Calculations ---
  const selectedMonthStart = selectedMonth ? parseLocalMonthKey(selectedMonth) : null;
  const selectedMonthEnd = selectedMonthStart ? addMonths(selectedMonthStart, 1) : null;
  const selectedDateStart = selectedDate ? parseLocalDateKey(selectedDate) : null;
  const selectedDateEnd = selectedDateStart ? addDays(selectedDateStart, 1) : null;

  const filteredTransactions = transactions.filter(t => {
    const txDate = t.date.toDate();

    const matchesMonth = isWithinRange(txDate, selectedMonthStart, selectedMonthEnd);
    const matchesDate = isWithinRange(txDate, selectedDateStart, selectedDateEnd);
    const matchesType = filter === 'all' ? true : t.type === filter;
    const matchesSearch = searchTerm
      ? t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesMonth && matchesDate && matchesType && matchesSearch;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return {
    user,
    loading,
    currentView,
    setCurrentView,
    transactions,
    input,
    setInput,
    isInputFocused,
    setIsInputFocused,
    isListening,
    toggleListening,
    isProcessing,
    error,
    setError,
    filter,
    setFilter,
    selectedDate,
    setSelectedDate,
    selectedMonth,
    setSelectedMonth,
    isAssistantOpen,
    setIsAssistantOpen,
    assistantInput,
    setAssistantInput,
    assistantMessages,
    isAssistantTyping,
    chatEndRef,
    handleLogin,
    handleLogout,
    handleDeleteAccountData,
    handleAddTransaction,
    handleEditTransactionSelection,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleAssistantSubmit,
    editingTransaction,
    setEditingTransaction,
    totalIncome,
    totalExpenses,
    balance,
    filteredTransactions,
    searchTerm,
    setSearchTerm,
    isSearchVisible,
    setIsSearchVisible,
    toggleSearch: () => setIsSearchVisible(prev => !prev),
    currency,
    setCurrency
  };
};
