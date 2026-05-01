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
  Timestamp, 
  getDocFromServer, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { 
  Category, 
  Transaction, 
  ChatMessage, 
  OperationType, 
  ViewType 
} from '../types';
import { handleFirestoreError } from '../utils/errorHandlers';
import { parseTransaction, askAssistant } from '../services/geminiService';
import { formatCurrency } from '../utils/formatters';

export const useLocobook = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [input, setInput] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Utensils');
  const [colorFill, setColorFill] = useState('#2170E4');
  const [iconColor, setIconColor] = useState('#FFFFFF');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // AI Assistant State
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

  useEffect(() => {
    if (editingCategory) {
      setNewCategoryName(editingCategory.name);
      setSelectedIcon(editingCategory.icon);
      setColorFill(editingCategory.colorFill || '#2170E4');
      setIconColor(editingCategory.iconColor || '#FFFFFF');
    }
  }, [editingCategory]);

  // --- Auth & Connection Test ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        testConnection(user);
      }
    });
    return () => unsubscribe();
  }, []);

  async function testConnection(currentUser: User) {
    try {
      await getDocFromServer(doc(db, 'users', currentUser.uid));
      console.log("Firestore connection successful.");
    } catch (error: any) {
      console.error("Firestore connection test failed:", error);
      if (error?.code === 'unavailable') {
        setError("Could not reach the database. This might be a temporary network issue or a firewall blocking the connection. Try refreshing the page.");
      } else if (error?.message?.includes('the client is offline')) {
        setError("The app is running in offline mode. Please check your internet connection.");
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

  useEffect(() => {
    if (!user) {
      setCategories([]);
      return;
    }

    const q = query(
      collection(db, 'categories'),
      where('userId', '==', user.uid),
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(cats);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
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

  // --- Category Actions ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[AddCategory] Form submitted');
    console.log('[AddCategory] user:', user?.uid ?? 'NO USER');
    console.log('[AddCategory] newCategoryName:', newCategoryName);
    console.log('[AddCategory] selectedIcon:', selectedIcon);
    console.log('[AddCategory] colorFill:', colorFill);
    
    if (!newCategoryName.trim()) {
      console.warn('[AddCategory] BLOCKED: category name is empty');
      return;
    }
    if (!user) {
      console.warn('[AddCategory] BLOCKED: no authenticated user');
      return;
    }

    try {
      const iconToSave = selectedIcon || 'CircleDollarSign';
      console.log('[AddCategory] Writing to Firestore...');
      await addDoc(collection(db, 'categories'), {
        name: newCategoryName.trim(),
        icon: iconToSave,
        userId: user.uid,
        colorFill,
        iconColor
      });
      console.log('[AddCategory] SUCCESS — navigating to categories');
      setSuccessMessage('Category added successfully!');
      
      setNewCategoryName('');
      setSelectedIcon('Utensils');
      setColorFill('#2170E4');
      setIconColor('#FFFFFF');
      setIsAddCategoryModalOpen(false);
      setCurrentView('categories'); 

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('[AddCategory] Firestore ERROR:', err?.code, err?.message);
      handleFirestoreError(err, OperationType.WRITE, 'categories');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !newCategoryName.trim() || !user) return;

    try {
      const iconToSave = selectedIcon || 'CircleDollarSign';
      // updateDoc needs doc ref
      const { updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'categories', editingCategory.id), {
        name: newCategoryName.trim(),
        icon: iconToSave,
        colorFill,
        iconColor
      });
      setSuccessMessage('Category updated successfully!');
      
      setNewCategoryName('');
      setSelectedIcon('Utensils');
      setColorFill('#2170E4');
      setIconColor('#FFFFFF');
      setIsEditCategoryModalOpen(false);
      setEditingCategory(null);
      setCurrentView('categories');

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `categories/${editingCategory.id}`);
    }
  };

  // --- Transaction Actions ---
  const handleAddTransaction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !user) return;

    setIsProcessing(true);
    setError(null);

    try {
      const parsed = await parseTransaction(input);
      
      await addDoc(collection(db, 'transactions'), {
        ...parsed,
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

  const handleEditTransactionSelection = (tx: Transaction) => {
    setEditingTransaction(tx);
    setCurrentView('editTransaction');
  };

  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'transactions', updatedTransaction.id), {
        amount: updatedTransaction.amount,
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
Total Income: ${formatCurrency(totalIncome)}
Total Expenses: ${formatCurrency(totalExpenses)}
Current Balance: ${formatCurrency(balance)}

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
  const filteredTransactions = transactions.filter(t => {
    const txDate = t.date.toDate().toISOString().split('T')[0];
    const txMonth = txDate.slice(0, 7);
    
    // If a month is selected, filter by that month. 
    // If a specific date is also selected and it's NOT today (meaning the user intentionally picked a day), 
    // maybe we prioritize the day? Actually, the UI image shows month selection as the primary navigation.
    // Let's make them work together: if both are set, the date must be within the month.
    
    const matchesMonth = selectedMonth ? txMonth === selectedMonth : true;
    const matchesDate = selectedDate ? txDate === selectedDate : true;
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
    categories,
    input,
    setInput,
    newCategoryName,
    setNewCategoryName,
    selectedIcon,
    setSelectedIcon,
    colorFill,
    setColorFill,
    iconColor,
    setIconColor,
    isAddCategoryModalOpen,
    setIsAddCategoryModalOpen,
    isEditCategoryModalOpen,
    setIsEditCategoryModalOpen,
    editingCategory,
    setEditingCategory,
    successMessage,
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
    handleAddCategory,
    handleDeleteCategory,
    handleEditCategory,
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
    toggleSearch: () => setIsSearchVisible(prev => !prev)
  };

};
