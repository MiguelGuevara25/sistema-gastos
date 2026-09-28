'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Transaction, Category, UserSettings, ActiveTab, TransactionType } from '../types/finance';
import { DEFAULT_CATEGORIES } from '../data/categories';
import { DEFAULT_SETTINGS, INITIAL_TRANSACTIONS } from '../data/initialData';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  settings: UserSettings;
  isLoaded: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (t: Transaction | null) => void;
  
  // Actions
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetToDefaultData: () => void;
  clearAllData: () => void;
  formatCurrency: (amount: number) => string;
  exportToCSV: () => void;
  exportToJSON: () => void;
  importFromJSON: (jsonData: string) => boolean;

  // Computed metrics
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
  budgetUsagePercent: number;
  categoryBreakdown: { category: Category; amount: number; percentage: number; count: number }[];
  monthlyExpenseTrend: { month: string; expenses: number; income: number }[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRANSACTIONS: 'finanza_transactions_v1',
  SETTINGS: 'finanza_settings_v1',
  CATEGORIES: 'finanza_categories_v1',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);

      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        setTransactions(INITIAL_TRANSACTIONS);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      }

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }

      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories(DEFAULT_CATEGORIES);
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
      setTransactions(INITIAL_TRANSACTIONS);
      setSettings(DEFAULT_SETTINGS);
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to theme html class
  useEffect(() => {
    if (!isLoaded) return;
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme, isLoaded]);

  // Save transactions to localStorage
  const saveTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTransactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  };

  // Add transaction
  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...data,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
    };
    const updated = [newTx, ...transactions];
    saveTransactions(updated);
  };

  // Update transaction
  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    const updated = transactions.map((tx) => (tx.id === id ? { ...tx, ...data } : tx));
    saveTransactions(updated);
  };

  // Delete transaction
  const deleteTransaction = (id: string) => {
    const updated = transactions.filter((tx) => tx.id !== id);
    saveTransactions(updated);
  };

  // Update settings
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  };

  // Reset to default sample data
  const resetToDefaultData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(DEFAULT_SETTINGS);
    setCategories(DEFAULT_CATEGORIES);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    } catch (e) {
      console.error('Failed to reset localStorage', e);
    }
  };

  // Clear all data
  const clearAllData = () => {
    setTransactions([]);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    } catch (e) {
      console.error('Failed to clear transactions', e);
    }
  };

  // Currency Formatter
  const formatCurrency = (amount: number): string => {
    const formatted = Math.abs(amount).toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${settings.currency} ${formatted}`;
  };

  // Export to CSV
  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Tipo', 'Concepto', 'Monto', 'Categoría', 'Método de Pago', 'Fecha', 'Notas'];
    const rows = transactions.map((tx) => {
      const cat = categories.find((c) => c.id === tx.categoryId)?.name || 'General';
      return [
        tx.id,
        tx.type === 'expense' ? 'Gasto' : 'Ingreso',
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount,
        `"${cat}"`,
        tx.paymentMethod,
        tx.date,
        `"${(tx.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gastos_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const exportToJSON = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      transactions,
      categories,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const importFromJSON = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed && Array.isArray(parsed.transactions)) {
        setTransactions(parsed.transactions);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(parsed.transactions));
        if (parsed.settings) {
          setSettings(parsed.settings);
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Calculated Metrics
  const { totalIncome, totalExpenses, netBalance, savingsRate, budgetUsagePercent } = useMemo(() => {
    let income = 0;
    let expenses = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        income += Number(tx.amount) || 0;
      } else {
        expenses += Number(tx.amount) || 0;
      }
    });

    const balance = income - expenses;
    const rate = income > 0 ? Math.max(0, Math.round(((income - expenses) / income) * 100)) : 0;
    const usage = settings.monthlyBudget > 0 ? Math.round((expenses / settings.monthlyBudget) * 100) : 0;

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: balance,
      savingsRate: rate,
      budgetUsagePercent: usage,
    };
  }, [transactions, settings.monthlyBudget]);

  // Category breakdown for expenses
  const categoryBreakdown = useMemo(() => {
    const expenseTx = transactions.filter((t) => t.type === 'expense');
    const totalExp = expenseTx.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const map = new Map<string, { amount: number; count: number }>();

    expenseTx.forEach((tx) => {
      const current = map.get(tx.categoryId) || { amount: 0, count: 0 };
      map.set(tx.categoryId, {
        amount: current.amount + (Number(tx.amount) || 0),
        count: current.count + 1,
      });
    });

    const list = Array.from(map.entries()).map(([catId, data]) => {
      const category = categories.find((c) => c.id === catId) || {
        id: catId,
        name: 'Sin Categoría',
        icon: 'HelpCircle',
        color: '#94a3b8',
        type: 'expense' as TransactionType,
      };
      const percentage = totalExp > 0 ? Math.round((data.amount / totalExp) * 100) : 0;
      return {
        category,
        amount: data.amount,
        percentage,
        count: data.count,
      };
    });

    return list.sort((a, b) => b.amount - a.amount);
  }, [transactions, categories]);

  // Monthly trend for the past 6 months
  const monthlyExpenseTrend = useMemo(() => {
    const monthsMap: Record<string, { expenses: number; income: number }> = {};
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]}`;
      monthsMap[key] = { expenses: 0, income: 0 };
    }

    transactions.forEach((tx) => {
      if (!tx.date) return;
      const d = new Date(tx.date + 'T00:00:00');
      const key = monthNames[d.getMonth()];
      if (monthsMap[key]) {
        if (tx.type === 'expense') {
          monthsMap[key].expenses += Number(tx.amount) || 0;
        } else {
          monthsMap[key].income += Number(tx.amount) || 0;
        }
      }
    });

    return Object.entries(monthsMap).map(([month, data]) => ({
      month,
      expenses: data.expenses,
      income: data.income,
    }));
  }, [transactions]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        settings,
        isLoaded,
        activeTab,
        setActiveTab,
        isAddModalOpen,
        setIsAddModalOpen,
        editingTransaction,
        setEditingTransaction,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateSettings,
        resetToDefaultData,
        clearAllData,
        formatCurrency,
        exportToCSV,
        exportToJSON,
        importFromJSON,
        totalIncome,
        totalExpenses,
        netBalance,
        savingsRate,
        budgetUsagePercent,
        categoryBreakdown,
        monthlyExpenseTrend,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
