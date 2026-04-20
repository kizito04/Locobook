import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Mic, 
  MicOff, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  AlertCircle,
  Loader2,
  Trash2,
  ChevronRight,
  User as UserIcon,
  MessageSquare,
  Settings as SettingsIcon,
  X,
  Send,
  Sparkles,
  LayoutDashboard,
  Tags,
  BarChart3,
  UserCircle,
  LogOut,
  Utensils,
  Car,
  Zap,
  Briefcase,
  Film,
  ShoppingBag,
  HeartPulse,
  Book,
  CircleDollarSign,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc,
  Timestamp,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { parseTransaction, ParsedTransaction, askAssistant } from './services/geminiService';

// --- Types ---
interface Category {
  id: string;
  name: string;
  icon: string;
  userId: string;
}

interface Transaction extends ParsedTransaction {
  id: string;
  date: Timestamp;
  userId: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

// --- Error Handler ---
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const ICON_MAP: Record<string, any> = {
  Utensils,
  Car,
  Zap,
  Briefcase,
  Film,
  ShoppingBag,
  HeartPulse,
  Book,
  CircleDollarSign
};

const CategoryIcon = ({ iconName, className = "w-5 h-5" }: { iconName: string, className?: string }) => {
  const Icon = ICON_MAP[iconName] || CircleDollarSign;
  return <Icon className={className} />;
};

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'categories' | 'analytics' | 'settings'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [input, setInput] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Utensils');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // AI Assistant State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I am your Locobook AI assistant. How can I help you today?' }
  ]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Auth & Connection Test ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        testConnection();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [assistantMessages]);

  async function testConnection() {
    if (!user) return;
    try {
      await getDocFromServer(doc(db, 'users', user.uid));
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

  // --- Category Listener ---
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
    if (!newCategoryName.trim() || !user) return;

    try {
      const iconToSave = selectedIcon || 'CircleDollarSign';
      await addDoc(collection(db, 'categories'), {
        name: newCategoryName.trim(),
        icon: iconToSave,
        userId: user.uid
      });
      setSuccessMessage('Category added successfully!');
      
      setNewCategoryName('');
      setSelectedIcon('Utensils');
      setIsAddCategoryModalOpen(false);
      setCurrentView('categories');
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount).replace('UGX', 'Shs');
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const filteredTransactions = transactions.filter(t => {
    const txDate = t.date.toDate().toISOString().split('T')[0];
    const matchesDate = selectedDate ? txDate === selectedDate : true;
    const matchesType = filter === 'all' ? true : t.type === filter;
    return matchesDate && matchesType;
  });

  // --- Render Helpers ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-slate-100"
        >
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-200">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Locobook AI</h1>
          <p className="text-slate-500 mb-10 text-lg leading-relaxed">
            Your personal AI accounting assistant. Track income and expenses using natural language.
          </p>
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 px-6 rounded-2xl font-semibold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <UserCircle className="w-5 h-5" />
            Continue with Google
          </button>
        </motion.div>
      </div>
    );
  }

  const NavItem = ({ id, icon: Icon, label }: { id: typeof currentView, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(id)}
      className={`flex flex-col items-center gap-1 p-2 transition-all ${
        currentView === id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <Icon className={`w-6 h-6 ${currentView === id ? 'fill-indigo-50' : ''}`} />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      {currentView === id && (
        <motion.div layoutId="nav-indicator" className="w-1 h-1 bg-indigo-600 rounded-full mt-1" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 sm:pb-8">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Locobook AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-900">{user.displayName}</span>
              <span className="text-xs text-slate-500">{user.email}</span>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-100 shadow-sm">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserCircle className="w-full h-full text-slate-300" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Dashboard Cards - Static Grid on Mobile */}
              <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-10">
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-4 gap-1">
                    <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg w-fit">
                      <Wallet className="w-4 h-4 sm:w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Balance</span>
                  </div>
                  <h2 className="text-sm sm:text-3xl font-bold text-slate-900 truncate">
                    {formatCurrency(balance)}
                  </h2>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-4 gap-1">
                    <div className="p-1.5 sm:p-2 bg-emerald-50 rounded-lg w-fit">
                      <TrendingUp className="w-4 h-4 sm:w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Income</span>
                  </div>
                  <h2 className="text-sm sm:text-3xl font-bold text-emerald-600 truncate">
                    {formatCurrency(totalIncome)}
                  </h2>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-4 gap-1">
                    <div className="p-1.5 sm:p-2 bg-rose-50 rounded-lg w-fit">
                      <TrendingDown className="w-4 h-4 sm:w-5 h-5 text-rose-600" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Expenses</span>
                  </div>
                  <h2 className="text-sm sm:text-3xl font-bold text-rose-600 truncate">
                    {formatCurrency(totalExpenses)}
                  </h2>
                </motion.div>
              </div>

              {/* AI Input - Sticky on mobile */}
              <div className={`sticky top-[73px] sm:static z-20 transition-all duration-300 ${isInputFocused ? 'bg-white shadow-lg' : 'bg-slate-50/95 backdrop-blur-sm'} sm:bg-transparent -mx-6 px-6 py-4 sm:p-0 mb-6 sm:mb-12 border-b border-slate-100 sm:border-none`}>
                <h3 className={`text-sm sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 transition-colors ${isInputFocused ? 'text-indigo-600' : 'text-slate-500 sm:text-slate-900'}`}>
                  <Mic className="w-4 h-4 sm:w-5 h-5" />
                  Quick Add
                </h3>
                <form onSubmit={handleAddTransaction} className="relative">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder='Try "Spent 10k on lunch"'
                    className={`w-full bg-white border-2 rounded-2xl py-3.5 sm:py-5 pl-4 sm:pl-6 pr-24 sm:pr-32 text-sm sm:text-lg focus:outline-none transition-all shadow-sm ${isInputFocused ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100'}`}
                    disabled={isProcessing}
                  />
                  <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-2">
                    <button 
                      type="button"
                      onClick={toggleListening}
                      className={`p-2.5 sm:p-3 rounded-xl transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {isListening ? <MicOff className="w-4 h-4 sm:w-5 h-5" /> : <Mic className="w-4 h-4 sm:w-5 h-5" />}
                    </button>
                    <button 
                      type="submit"
                      disabled={!input.trim() || isProcessing}
                      className="bg-indigo-600 text-white p-2.5 sm:p-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 sm:w-5 h-5 animate-spin" /> : <Plus className="w-4 h-4 sm:w-5 h-5" />}
                    </button>
                  </div>
                </form>
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-xs"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Transactions List */}
              <div>
                <div className="flex items-center justify-between mb-6 gap-2">
                  <h3 className="text-lg font-bold hidden sm:block">Transactions</h3>
                  <div className="flex items-center gap-2 w-full sm:w-auto py-1">
                    <div className="flex-1 sm:flex-none flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-xl border border-slate-100 shadow-sm min-w-0">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="text-[10px] font-bold text-slate-600 focus:outline-none bg-transparent w-full min-w-0"
                      />
                      {selectedDate && (
                        <button onClick={() => setSelectedDate('')} className="text-slate-300 hover:text-slate-500 flex-shrink-0">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 sm:flex-none flex items-center gap-0.5 bg-white p-0.5 rounded-xl border border-slate-100 shadow-sm">
                      {(['all', 'income', 'expense'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilter(type)}
                          className={`flex-1 px-1.5 py-1 rounded-lg text-[9px] font-bold transition-all ${filter === type ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {filteredTransactions.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200"
                      >
                        <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">No transactions found</p>
                      </motion.div>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <motion.div 
                          key={tx.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-indigo-100 transition-all"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {(() => {
                                const cat = categories.find(c => c.name.toLowerCase() === tx.category?.toLowerCase());
                                return cat ? <CategoryIcon iconName={cat.icon} className="w-5 h-5 sm:w-6 sm:h-6" /> : (tx.type === 'income' ? <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" /> : <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />);
                              })()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 truncate">{tx.description}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] sm:text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md uppercase tracking-wider truncate max-w-[80px] sm:max-w-none">
                                  {tx.category || 'Uncategorized'}
                                </span>
                                <span className="text-[10px] sm:text-xs text-slate-400 whitespace-nowrap">
                                  {tx.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:gap-6 ml-2">
                            <span className={`text-base sm:text-lg font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </span>
                            <button 
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">All Categories ({categories.length})</h2>
                <button 
                  onClick={() => {
                    setNewCategoryName('');
                    setSelectedIcon('Utensils');
                    setIsAddCategoryModalOpen(true);
                  }}
                  className="bg-indigo-600 text-white py-2 px-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>

              <AnimatePresence>
                {successMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-medium"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                {categories.map(cat => (
                  <motion.div 
                    key={cat.id} 
                    layout
                    className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 group hover:border-indigo-100 transition-all"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <CategoryIcon iconName={cat.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-base sm:text-lg font-bold text-slate-700">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)} 
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {currentView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-indigo-50 rounded-2xl">
                    <BarChart3 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Spending Analytics</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Donut Chart: Income vs Expenses */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold mb-6">Income vs Expenses</h3>
                    <div className="h-[250px]">
                      {totalIncome + totalExpenses > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Income', value: totalIncome },
                                { name: 'Expenses', value: totalExpenses }
                              ]}
                              innerRadius={70}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                              cornerRadius={10}
                            >
                              <Cell fill="#10b981" />
                              <Cell fill="#f43f5e" />
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                          No transactions yet
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-sm font-medium text-slate-600">Income</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        <span className="text-sm font-medium text-slate-600">Expenses</span>
                      </div>
                    </div>
                  </div>

                  {/* Bar Chart: Expenses by Category */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold mb-6">Expenses by Category</h3>
                    <div className="h-[250px]">
                      {transactions.filter(t => t.type === 'expense').length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={categories.map((cat, index) => ({
                            name: cat.name,
                            amount: transactions
                              .filter(t => t.category?.toLowerCase() === cat.name.toLowerCase() && t.type === 'expense')
                              .reduce((sum, t) => sum + t.amount, 0),
                            fill: ['#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]
                          })).filter(d => d.amount > 0)}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              formatter={(value: number) => formatCurrency(value)}
                            />
                            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                              {categories.map((cat, index) => (
                                <Cell key={`cell-${index}`} fill={['#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                          No expenses yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Separate Donut Charts for Income and Expenses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {['Income', 'Expenses'].map((type) => {
                    const data = categories.map((cat, index) => ({
                      name: cat.name,
                      value: transactions
                        .filter(t => t.category?.toLowerCase() === cat.name.toLowerCase() && t.type === type.toLowerCase())
                        .reduce((sum, t) => sum + t.amount, 0),
                      color: ['#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]
                    }));

                    const total = data.reduce((sum, d) => sum + d.value, 0);

                    return (
                      <div key={type} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h3 className={`text-lg font-bold mb-6 ${type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>{type} by Category</h3>
                        <div className="h-[250px]">
                          {total > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={data.filter(d => d.value > 0)}
                                  innerRadius={70}
                                  outerRadius={100}
                                  paddingAngle={5}
                                  dataKey="value"
                                  cornerRadius={10}
                                >
                                  {data.filter(d => d.value > 0).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                              No {type.toLowerCase()} yet
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          {data.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className="text-sm font-medium text-slate-600 truncate">
                                {entry.name} ({total > 0 ? Math.round((entry.value / total) * 100) : 0}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold mb-6">Top Categories</h3>
                  <div className="space-y-4">
                    {categories
                      .map(cat => ({
                        ...cat,
                        amount: transactions
                          .filter(t => t.category?.toLowerCase() === cat.name.toLowerCase() && t.type === 'expense')
                          .reduce((sum, t) => sum + t.amount, 0)
                      }))
                      .filter(c => c.amount > 0)
                      .sort((a, b) => b.amount - a.amount)
                      .slice(0, 3)
                      .map(cat => (
                        <div key={cat.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                              <CategoryIcon iconName={cat.icon} className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                          </div>
                          <span className="text-sm font-bold text-rose-600">{formatCurrency(cat.amount)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-50 rounded-2xl">
                  <SettingsIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold">Settings</h2>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-sm">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserCircle className="w-full h-full text-slate-300" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{user.displayName}</h4>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl">
                    <p className="text-sm font-bold mb-3">Default Currency</p>
                    <select className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all shadow-sm" defaultValue="UGX">
                      <option value="UGX">UGX (Shs)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl">
                    <p className="text-sm font-bold mb-3">App Theme</p>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 rounded-2xl p-3 text-sm font-bold shadow-sm">Light</button>
                      <button className="flex-1 bg-white border border-slate-200 text-slate-400 rounded-2xl p-3 text-sm font-bold shadow-sm opacity-50 cursor-not-allowed">Dark</button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 bg-rose-50 text-rose-600 py-4 px-6 rounded-2xl font-bold hover:bg-rose-100 transition-all active:scale-95"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 z-50 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Home" />
          <NavItem id="categories" icon={Tags} label="Categories" />
          <NavItem id="analytics" icon={BarChart3} label="Analytics" />
          <NavItem id="settings" icon={SettingsIcon} label="Settings" />
        </div>
      </nav>

      {/* Floating AI Assistant Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAssistantOpen(true)}
          className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center shadow-indigo-300 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Sparkles className="w-8 h-8 relative z-10" />
        </motion.button>
      </div>

      {/* AI Assistant Chat Modal */}
      <AnimatePresence>
        {isAssistantOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssistantOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] sm:h-[600px]"
            >
              {/* Chat Header */}
              <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Locobook Assistant</h3>
                    <p className="text-xs text-indigo-100">AI Powered Financial Help</p>
                  </div>
                </div>
                <button onClick={() => setIsAssistantOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {assistantMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                        : 'bg-white text-slate-700 rounded-tl-none shadow-sm border border-slate-100'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isAssistantTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleAssistantSubmit} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                <input 
                  type="text"
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  placeholder="Ask me anything about your finances..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!assistantInput.trim() || isAssistantTyping}
                  className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Category Modal */}
      <AnimatePresence>
        {isAddCategoryModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddCategoryModalOpen(false);
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Add New Category
                </h3>
                <button 
                  onClick={() => {
                    setIsAddCategoryModalOpen(false);
                  }} 
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <p className="text-sm text-slate-500 mb-8">
                Create a new category for organizing your transactions.
              </p>

              <form onSubmit={handleAddCategory} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Category Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Travel"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Select Icon</label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.keys(ICON_MAP).map(iconName => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setSelectedIcon(iconName)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          selectedIcon === iconName 
                            ? 'bg-indigo-50 border-2 border-indigo-600 text-indigo-600' 
                            : 'bg-white border border-slate-100 text-slate-400 hover:border-indigo-200'
                        }`}
                      >
                        <CategoryIcon iconName={iconName} className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-4"
                >
                  Add Category
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
