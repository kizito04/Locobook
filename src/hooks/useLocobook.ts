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
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  Transaction,
  Business,
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

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I am your Locobook AI assistant. How can I help you today?' }
  ]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const recognitionRef = useRef<any>(null);
  const hasFetchedPrefs = useRef(false);

  // --- Auth & Connection Test ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        setCurrentView('dashboard');
        testConnection(user);
        // Reset fetch flag for new user
        hasFetchedPrefs.current = false;
      } else {
        // Reset to default for guest
        setCurrency('UGX');
        hasFetchedPrefs.current = false;
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Only save to localStorage/Firestore if we've successfully loaded the user's existing prefs
    // or if the user is a guest (no user object)
    if (!user) {
      localStorage.setItem('locobook-currency-guest', currency);
      return;
    }

    if (!hasFetchedPrefs.current) return;

    localStorage.setItem(`locobook-currency-${user.uid}`, currency);
    
    const saveCurrency = async () => {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          currency: currency
        }, { merge: true });
      } catch (err) {
        console.error('Failed to save currency to Firestore:', err);
      }
    };
    saveCurrency();
  }, [currency, user]);

  // Fetch currency from Firestore on login
  useEffect(() => {
    const fetchUserPrefs = async () => {
      if (user) {
        try {
          // First check local storage for this specific user for speed
          const localPref = localStorage.getItem(`locobook-currency-${user.uid}`);
          if (localPref) {
            setCurrency(localPref);
          }

          // Then sync with Firestore (source of truth)
          const userDoc = await getDocFromServer(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.currency) {
              setCurrency(data.currency);
              localStorage.setItem(`locobook-currency-${user.uid}`, data.currency);
            }
          }
        } catch (err) {
          console.error('Failed to fetch user preferences:', err);
        } finally {
          hasFetchedPrefs.current = true;
        }
      }
    };
    fetchUserPrefs();
  }, [user]);

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
      setBusinesses([]);
      return;
    }

    // Transactions listener
    const qTxs = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribeTxs = onSnapshot(qTxs, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(txs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });

    // Businesses listener
    const qBiz = query(
      collection(db, 'businesses'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeBiz = onSnapshot(qBiz, (snapshot) => {
      const biz = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Business[];
      setBusinesses(biz);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'businesses');
    });

    return () => {
      unsubscribeTxs();
      unsubscribeBiz();
    };
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
        businessId: activeBusinessId,
        date: Timestamp.now()
      });

      setInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to process transaction.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddBusiness = async (name: string, description: string) => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'businesses'), {
        name,
        description,
        ownerId: user.uid,
        createdAt: Timestamp.now()
      });
      setActiveBusinessId(docRef.id);
      setCurrentView('dashboard');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'businesses');
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
    if (!assistantInput.trim() || !user) return;

    const userMsg = assistantInput;
    setAssistantInput('');
    setAssistantMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAssistantTyping(true);

    // Placeholder for the streaming assistant message
    setAssistantMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const context = `
Summary:
Total Income: ${totalIncome}
Total Expenses: ${totalExpenses}
Current Balance: ${balance}

Recent Transactions:
${transactions.slice(0, 10).map(t =>
        `${t.type === 'income' ? 'Received' : 'Spent'} ${t.amount} for ${t.description} on ${t.date.toDate().toLocaleDateString()}`
      ).join('\n')}`;

      // Function calling implementation
      const tools = {
        searchTransactions: async (filters: any) => {
          return transactions.filter(t => {
            const txDate = t.date.toDate().toISOString().split('T')[0];
            const matchesCategory = !filters.category || t.category?.toLowerCase() === filters.category.toLowerCase();
            const matchesType = !filters.type || t.type === filters.type;
            const matchesQuery = !filters.query || t.description.toLowerCase().includes(filters.query.toLowerCase());
            const matchesStart = !filters.startDate || txDate >= filters.startDate;
            const matchesEnd = !filters.endDate || txDate <= filters.endDate;
            return matchesCategory && matchesType && matchesQuery && matchesStart && matchesEnd;
          }).map(t => ({
            description: t.description,
            amount: t.amount,
            type: t.type,
            date: t.date.toDate().toLocaleDateString(),
            category: t.category
          }));
        }
      };

      await askAssistant(
        userMsg, 
        context, 
        (chunk) => {
          setAssistantMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = chunk;
            return newMessages;
          });
        },
        tools
      );
    } catch (err) {
      setAssistantMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = "I'm sorry, I encountered an error. Please try again.";
        return newMessages;
      });
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

    // Filter by business context first (Strict Separation)
    const matchesBusiness = activeBusinessId === null 
      ? !t.businessId 
      : t.businessId === activeBusinessId;

    if (!matchesBusiness) return false;

    const matchesMonth = isWithinRange(txDate, selectedMonthStart, selectedMonthEnd);
    const matchesDate = isWithinRange(txDate, selectedDateStart, selectedDateEnd);
    const matchesType = filter === 'all' ? true : t.type === filter;
    const matchesSearch = searchTerm.trim()
      ? t.description.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        t.category?.toLowerCase().includes(searchTerm.trim().toLowerCase())
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
    toggleSearch: () => {
      if (isSearchVisible) setSearchTerm('');
      setIsSearchVisible(prev => !prev);
    },
    currency,
    setCurrency,
    businesses,
    activeBusinessId,
    setActiveBusinessId,
    handleAddBusiness,
    activeBusiness: businesses.find(b => b.id === activeBusinessId) || null
  };
};
