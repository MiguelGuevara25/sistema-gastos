'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Transaction,
  Category,
  UserSettings,
  ActiveTab,
  TransactionType,
  Account,
  SavingsGoal,
  RecurringExpense,
  DebtLoan,
} from '../types/finance';
import { DEFAULT_CATEGORIES } from '../data/categories';
import {
  DEFAULT_SETTINGS,
  INITIAL_TRANSACTIONS,
  DEFAULT_ACCOUNTS,
  DEFAULT_GOALS,
  DEFAULT_RECURRING,
  DEFAULT_DEBTS,
} from '../data/initialData';

interface FinanceContextType {
  // Transactions
  transactions: Transaction[]; // Filtered by selectedMonth
  allTransactions: Transaction[]; // All transactions regardless of month
  categories: Category[];
  settings: UserSettings;
  isLoaded: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (t: Transaction | null) => void;

  // Month / Period Filtering
  selectedMonth: string; // 'YYYY-MM' or 'all'
  setSelectedMonth: (month: string) => void;
  availableMonths: { value: string; label: string }[];
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  monthComparison: {
    previousIncome: number;
    previousExpenses: number;
    expenseDiffPercent: number;
    incomeDiffPercent: number;
  };

  // Accounts & Digital Wallets
  accounts: Account[];
  addAccount: (data: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, data: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  transferBetweenAccounts: (data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date: string;
    notes?: string;
  }) => void;
  adjustAccountBalance: (id: string, newBalance: number) => void;
  totalLiquidAssets: number;
  totalSavingsCapital: number;
  totalOperatingBalance: number;
  totalDebts: number;
  netWorth: number;

  // Savings Goals
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, data: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number, fromAccountId?: string) => void;
  withdrawFromGoal: (goalId: string, amount: number, toAccountId?: string) => void;
  totalSavedInGoals: number;
  totalTargetGoals: number;

  // Recurring / Fixed Expenses
  recurringExpenses: RecurringExpense[];
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id' | 'createdAt'>) => void;
  updateRecurringExpense: (id: string, data: Partial<RecurringExpense>) => void;
  deleteRecurringExpense: (id: string) => void;
  payRecurringExpense: (id: string, date?: string, accountId?: string) => void;
  totalRecurringMonthly: number;
  recurringPaidThisMonth: number;
  recurringPendingThisMonth: number;

  // Debts & Loans ("Me Deben" / "Debo")
  debtsLoans: DebtLoan[];
  addDebtLoan: (debt: Omit<DebtLoan, 'id' | 'createdAt'>) => void;
  updateDebtLoan: (id: string, data: Partial<DebtLoan>) => void;
  deleteDebtLoan: (id: string) => void;
  settleDebtLoan: (id: string, accountId?: string) => void;
  totalLentPending: number;
  totalBorrowedPending: number;
  netDebtBalance: number;

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

  // Computed metrics (for selectedMonth)
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
  ACCOUNTS: 'finanza_accounts_v1',
  GOALS: 'finanza_goals_v1',
  RECURRING: 'finanza_recurring_v1',
  DEBTS: 'finanza_debts_v1',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [goals, setGoals] = useState<SavingsGoal[]>(DEFAULT_GOALS);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(DEFAULT_RECURRING);
  const [debtsLoans, setDebtsLoans] = useState<DebtLoan[]>(DEFAULT_DEBTS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Default month: Current year and month 'YYYY-MM'
  const currentMonthStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const storedAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      const storedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      const storedRecurring = localStorage.getItem(STORAGE_KEYS.RECURRING);
      const storedDebts = localStorage.getItem(STORAGE_KEYS.DEBTS);

      if (storedTransactions) {
        setAllTransactions(JSON.parse(storedTransactions));
      } else {
        setAllTransactions(INITIAL_TRANSACTIONS);
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

      if (storedAccounts) {
        setAccounts(JSON.parse(storedAccounts));
      } else {
        setAccounts(DEFAULT_ACCOUNTS);
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
      }

      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      } else {
        setGoals(DEFAULT_GOALS);
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEFAULT_GOALS));
      }

      if (storedRecurring) {
        setRecurringExpenses(JSON.parse(storedRecurring));
      } else {
        setRecurringExpenses(DEFAULT_RECURRING);
        localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(DEFAULT_RECURRING));
      }

      if (storedDebts) {
        setDebtsLoans(JSON.parse(storedDebts));
      } else {
        setDebtsLoans(DEFAULT_DEBTS);
        localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(DEFAULT_DEBTS));
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
      setAllTransactions(INITIAL_TRANSACTIONS);
      setSettings(DEFAULT_SETTINGS);
      setCategories(DEFAULT_CATEGORIES);
      setAccounts(DEFAULT_ACCOUNTS);
      setGoals(DEFAULT_GOALS);
      setRecurringExpenses(DEFAULT_RECURRING);
      setDebtsLoans(DEFAULT_DEBTS);
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

  // Save transactions
  const saveTransactions = (newTransactions: Transaction[]) => {
    setAllTransactions(newTransactions);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTransactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  };

  // Save accounts
  const saveAccounts = (newAccounts: Account[]) => {
    setAccounts(newAccounts);
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(newAccounts));
    } catch (e) {
      console.error('Failed to save accounts to localStorage', e);
    }
  };

  // Save goals
  const saveGoals = (newGoals: SavingsGoal[]) => {
    setGoals(newGoals);
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(newGoals));
    } catch (e) {
      console.error('Failed to save goals to localStorage', e);
    }
  };

  // Save recurring expenses
  const saveRecurring = (newRecurring: RecurringExpense[]) => {
    setRecurringExpenses(newRecurring);
    try {
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(newRecurring));
    } catch (e) {
      console.error('Failed to save recurring expenses to localStorage', e);
    }
  };

  // Save debts and loans
  const saveDebtsLoans = (newDebts: DebtLoan[]) => {
    setDebtsLoans(newDebts);
    try {
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(newDebts));
    } catch (e) {
      console.error('Failed to save debts to localStorage', e);
    }
  };

  // Month navigation & available months
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    // Always include current month
    monthsSet.add(currentMonthStr);

    allTransactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        monthsSet.add(tx.date.substring(0, 7));
      }
    });

    const sorted = Array.from(monthsSet).sort().reverse();
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    return sorted.map((m) => {
      const [yearStr, monthNumStr] = m.split('-');
      const monthIdx = parseInt(monthNumStr, 10) - 1;
      const label = `${monthNames[monthIdx] || monthNumStr} ${yearStr}`;
      return { value: m, label };
    });
  }, [allTransactions, currentMonthStr]);

  const goToPreviousMonth = () => {
    if (selectedMonth === 'all') {
      setSelectedMonth(currentMonthStr);
      return;
    }
    const [y, m] = selectedMonth.split('-').map(Number);
    let prevY = y;
    let prevM = m - 1;
    if (prevM < 1) {
      prevM = 12;
      prevY -= 1;
    }
    setSelectedMonth(`${prevY}-${String(prevM).padStart(2, '0')}`);
  };

  const goToNextMonth = () => {
    if (selectedMonth === 'all') {
      setSelectedMonth(currentMonthStr);
      return;
    }
    const [y, m] = selectedMonth.split('-').map(Number);
    let nextY = y;
    let nextM = m + 1;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    }
    setSelectedMonth(`${nextY}-${String(nextM).padStart(2, '0')}`);
  };

  // Filter transactions by selectedMonth
  const transactions = useMemo(() => {
    if (selectedMonth === 'all') return allTransactions;
    return allTransactions.filter((tx) => tx.date && tx.date.startsWith(selectedMonth));
  }, [allTransactions, selectedMonth]);

  // Calculate previous month comparison stats
  const monthComparison = useMemo(() => {
    if (selectedMonth === 'all') {
      return { previousIncome: 0, previousExpenses: 0, expenseDiffPercent: 0, incomeDiffPercent: 0 };
    }
    const [y, m] = selectedMonth.split('-').map(Number);
    let prevY = y;
    let prevM = m - 1;
    if (prevM < 1) {
      prevM = 12;
      prevY -= 1;
    }
    const prevMonthKey = `${prevY}-${String(prevM).padStart(2, '0')}`;

    const prevTxs = allTransactions.filter((tx) => tx.date && tx.date.startsWith(prevMonthKey));
    let prevIncome = 0;
    let prevExpenses = 0;
    prevTxs.forEach((t) => {
      if (t.type === 'income') prevIncome += Number(t.amount) || 0;
      else prevExpenses += Number(t.amount) || 0;
    });

    let currentExpenses = 0;
    let currentIncome = 0;
    transactions.forEach((t) => {
      if (t.type === 'income') currentIncome += Number(t.amount) || 0;
      else currentExpenses += Number(t.amount) || 0;
    });

    const expenseDiffPercent =
      prevExpenses > 0 ? Math.round(((currentExpenses - prevExpenses) / prevExpenses) * 100) : 0;
    const incomeDiffPercent =
      prevIncome > 0 ? Math.round(((currentIncome - prevIncome) / prevIncome) * 100) : 0;

    return {
      previousIncome: prevIncome,
      previousExpenses: prevExpenses,
      expenseDiffPercent,
      incomeDiffPercent,
    };
  }, [selectedMonth, allTransactions, transactions]);

  // Add transaction with optional account balance update
  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...data,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
    };
    const updated = [newTx, ...allTransactions];
    saveTransactions(updated);

    // Update account balance if accountId is provided
    if (data.accountId) {
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === data.accountId) {
          const delta = data.type === 'income' ? data.amount : -data.amount;
          return { ...acc, balance: Number((acc.balance + delta).toFixed(2)) };
        }
        return acc;
      });
      saveAccounts(updatedAccounts);
    }
  };

  // Update transaction with account balance adjustments
  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    const oldTx = allTransactions.find((tx) => tx.id === id);
    const updated = allTransactions.map((tx) => (tx.id === id ? { ...tx, ...data } : tx));
    saveTransactions(updated);

    if (oldTx && (oldTx.accountId || data.accountId)) {
      let updatedAccounts = [...accounts];
      // Revert old effect
      if (oldTx.accountId) {
        const revertDelta = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
        updatedAccounts = updatedAccounts.map((acc) =>
          acc.id === oldTx.accountId
            ? { ...acc, balance: Number((acc.balance + revertDelta).toFixed(2)) }
            : acc
        );
      }
      // Apply new effect
      const finalAccId = data.accountId || oldTx.accountId;
      const finalType = data.type || oldTx.type;
      const finalAmount = data.amount !== undefined ? data.amount : oldTx.amount;
      if (finalAccId) {
        const applyDelta = finalType === 'income' ? finalAmount : -finalAmount;
        updatedAccounts = updatedAccounts.map((acc) =>
          acc.id === finalAccId
            ? { ...acc, balance: Number((acc.balance + applyDelta).toFixed(2)) }
            : acc
        );
      }
      saveAccounts(updatedAccounts);
    }
  };

  // Delete transaction with account balance revert
  const deleteTransaction = (id: string) => {
    const oldTx = allTransactions.find((tx) => tx.id === id);
    const updated = allTransactions.filter((tx) => tx.id !== id);
    saveTransactions(updated);

    if (oldTx && oldTx.accountId) {
      const revertDelta = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
      const updatedAccounts = accounts.map((acc) =>
        acc.id === oldTx.accountId
          ? { ...acc, balance: Number((acc.balance + revertDelta).toFixed(2)) }
          : acc
      );
      saveAccounts(updatedAccounts);
    }
  };

  // Account Management
  const addAccount = (data: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...data,
      id: 'acc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };
    saveAccounts([...accounts, newAcc]);
  };

  const updateAccount = (id: string, data: Partial<Account>) => {
    saveAccounts(accounts.map((acc) => (acc.id === id ? { ...acc, ...data } : acc)));
  };

  const deleteAccount = (id: string) => {
    saveAccounts(accounts.filter((acc) => acc.id !== id));
  };

  const adjustAccountBalance = (id: string, newBalance: number) => {
    saveAccounts(accounts.map((acc) => (acc.id === id ? { ...acc, balance: newBalance } : acc)));
  };

  const transferBetweenAccounts = (data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date: string;
    notes?: string;
  }) => {
    const fromAcc = accounts.find((a) => a.id === data.fromAccountId);
    const toAcc = accounts.find((a) => a.id === data.toAccountId);
    if (!fromAcc || !toAcc || data.amount <= 0) return;

    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === data.fromAccountId) {
        return { ...acc, balance: Number((acc.balance - data.amount).toFixed(2)) };
      }
      if (acc.id === data.toAccountId) {
        return { ...acc, balance: Number((acc.balance + data.amount).toFixed(2)) };
      }
      return acc;
    });
    saveAccounts(updatedAccounts);

    // Record informative transfer log as transaction or notes
    const transferTx: Transaction = {
      id: 'tx-trf-' + Date.now(),
      description: `Transferencia: ${fromAcc.name} ➔ ${toAcc.name}`,
      amount: data.amount,
      type: 'expense',
      categoryId: 'cat-servicios',
      date: data.date,
      paymentMethod: 'transferencia',
      accountId: data.fromAccountId,
      notes: data.notes || `Movimiento entre cuentas propias (${fromAcc.name} hacia ${toAcc.name})`,
      createdAt: new Date().toISOString(),
    };
    // Note: To avoid artificially distorting expenses, some users like to register, or we can make it a neutral transfer
    // Let's add it so it shows in the transaction timeline
    saveTransactions([transferTx, ...allTransactions]);
  };

  // Savings Goals Management
  const addGoal = (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: 'goal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    saveGoals([...goals, newGoal]);
  };

  const updateGoal = (id: string, data: Partial<SavingsGoal>) => {
    saveGoals(goals.map((g) => (g.id === id ? { ...g, ...data } : g)));
  };

  const deleteGoal = (id: string) => {
    saveGoals(goals.filter((g) => g.id !== id));
  };

  const contributeToGoal = (goalId: string, amount: number, fromAccountId?: string) => {
    if (amount <= 0) return;
    const updatedGoals = goals.map((g) => {
      if (g.id === goalId) {
        return { ...g, currentAmount: Number((g.currentAmount + amount).toFixed(2)) };
      }
      return g;
    });
    saveGoals(updatedGoals);

    if (fromAccountId) {
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === fromAccountId) {
          return { ...acc, balance: Number((acc.balance - amount).toFixed(2)) };
        }
        return acc;
      });
      saveAccounts(updatedAccounts);
    }
  };

  const withdrawFromGoal = (goalId: string, amount: number, toAccountId?: string) => {
    if (amount <= 0) return;
    const updatedGoals = goals.map((g) => {
      if (g.id === goalId) {
        const nextAmt = Math.max(0, g.currentAmount - amount);
        return { ...g, currentAmount: Number(nextAmt.toFixed(2)) };
      }
      return g;
    });
    saveGoals(updatedGoals);

    if (toAccountId) {
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === toAccountId) {
          return { ...acc, balance: Number((acc.balance + amount).toFixed(2)) };
        }
        return acc;
      });
      saveAccounts(updatedAccounts);
    }
  };

  // Recurring / Fixed Expenses Management
  const addRecurringExpense = (data: Omit<RecurringExpense, 'id' | 'createdAt'>) => {
    const newRec: RecurringExpense = {
      ...data,
      id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    saveRecurring([...recurringExpenses, newRec]);
  };

  const updateRecurringExpense = (id: string, data: Partial<RecurringExpense>) => {
    saveRecurring(recurringExpenses.map((r) => (r.id === id ? { ...r, ...data } : r)));
  };

  const deleteRecurringExpense = (id: string) => {
    saveRecurring(recurringExpenses.filter((r) => r.id !== id));
  };

  const payRecurringExpense = (id: string, payDate?: string, payAccountId?: string) => {
    const exp = recurringExpenses.find((r) => r.id === id);
    if (!exp) return;
    const activeMonth = selectedMonth === 'all' ? currentMonthStr : selectedMonth;
    const [y, m] = activeMonth.split('-');
    const dayStr = String(exp.dueDay).padStart(2, '0');
    const actualDate = payDate || `${y}-${m}-${dayStr}`;
    const finalAccId = payAccountId || exp.accountId;

    // Register actual transaction in current month
    addTransaction({
      description: exp.name,
      amount: exp.amount,
      type: 'expense',
      categoryId: exp.categoryId,
      paymentMethod: exp.paymentMethod,
      accountId: finalAccId,
      date: actualDate,
      notes: exp.notes ? `Gasto fijo: ${exp.notes}` : `Pago de servicio fijo (${exp.name})`,
    });

    // Mark as paid in this month
    const updated = recurringExpenses.map((r) =>
      r.id === id ? { ...r, lastPaidMonth: activeMonth } : r
    );
    saveRecurring(updated);
  };

  const { totalRecurringMonthly, recurringPaidThisMonth, recurringPendingThisMonth } = useMemo(() => {
    const activeMonth = selectedMonth === 'all' ? currentMonthStr : selectedMonth;
    let total = 0;
    let paid = 0;

    recurringExpenses.forEach((exp) => {
      total += exp.amount;
      const isPaid =
        exp.lastPaidMonth === activeMonth ||
        transactions.some(
          (tx) =>
            tx.type === 'expense' &&
            tx.description.toLowerCase().trim() === exp.name.toLowerCase().trim()
        );
      if (isPaid) {
        paid += exp.amount;
      }
    });

    return {
      totalRecurringMonthly: total,
      recurringPaidThisMonth: paid,
      recurringPendingThisMonth: Math.max(0, total - paid),
    };
  }, [recurringExpenses, selectedMonth, currentMonthStr, transactions]);

  // Debts & Loans Management ("Me Deben" / "Debo")
  const addDebtLoan = (data: Omit<DebtLoan, 'id' | 'createdAt'>) => {
    const newDebt: DebtLoan = {
      ...data,
      id: 'debt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    saveDebtsLoans([newDebt, ...debtsLoans]);
  };

  const updateDebtLoan = (id: string, data: Partial<DebtLoan>) => {
    saveDebtsLoans(debtsLoans.map((d) => (d.id === id ? { ...d, ...data } : d)));
  };

  const deleteDebtLoan = (id: string) => {
    saveDebtsLoans(debtsLoans.filter((d) => d.id !== id));
  };

  const settleDebtLoan = (id: string, accountId?: string) => {
    const debt = debtsLoans.find((d) => d.id === id);
    if (!debt || debt.status === 'settled') return;

    const todayStr = new Date().toISOString().split('T')[0];

    // If an account is specified, register the monetary transaction and adjust account balance
    if (accountId) {
      if (debt.type === 'lent') {
        // Me pagan lo prestado -> Entra dinero a la cuenta
        const updatedAccounts = accounts.map((acc) => {
          if (acc.id === accountId) {
            return { ...acc, balance: Number((acc.balance + debt.amount).toFixed(2)) };
          }
          return acc;
        });
        saveAccounts(updatedAccounts);

        addTransaction({
          description: `Cobro de préstamo: ${debt.personName}`,
          amount: debt.amount,
          type: 'income',
          categoryId: 'cat-otros-ingresos',
          paymentMethod: 'transferencia',
          accountId,
          date: todayStr,
          notes: debt.notes ? `Préstamo cobrado. Notas: ${debt.notes}` : `Cobro de préstamo a ${debt.personName}`,
        });
      } else {
        // Yo pago lo que debía -> Sale dinero de la cuenta
        const updatedAccounts = accounts.map((acc) => {
          if (acc.id === accountId) {
            return { ...acc, balance: Number((acc.balance - debt.amount).toFixed(2)) };
          }
          return acc;
        });
        saveAccounts(updatedAccounts);

        addTransaction({
          description: `Pago de deuda a: ${debt.personName}`,
          amount: debt.amount,
          type: 'expense',
          categoryId: 'cat-otros',
          paymentMethod: 'transferencia',
          accountId,
          date: todayStr,
          notes: debt.notes ? `Deuda saldada. Notas: ${debt.notes}` : `Pago de deuda a ${debt.personName}`,
        });
      }
    }

    const updated = debtsLoans.map((d) =>
      d.id === id
        ? {
            ...d,
            status: 'settled' as const,
            settledDate: todayStr,
            accountId: accountId || d.accountId,
          }
        : d
    );
    saveDebtsLoans(updated);
  };

  const { totalLentPending, totalBorrowedPending, netDebtBalance } = useMemo(() => {
    let lent = 0;
    let borrowed = 0;

    debtsLoans.forEach((d) => {
      if (d.status === 'pending') {
        if (d.type === 'lent') {
          lent += Number(d.amount) || 0;
        } else {
          borrowed += Number(d.amount) || 0;
        }
      }
    });

    return {
      totalLentPending: lent,
      totalBorrowedPending: borrowed,
      netDebtBalance: lent - borrowed,
    };
  }, [debtsLoans]);

  // Liquid assets, Savings capital, and Net Worth calculations
  const { totalLiquidAssets, totalSavingsCapital, totalOperatingBalance, totalDebts, netWorth } = useMemo(() => {
    let liquid = 0;
    let savings = 0;
    let operating = 0;
    let debt = 0;

    accounts.forEach((acc) => {
      if (acc.type === 'credit') {
        if (acc.balance < 0) {
          debt += Math.abs(acc.balance);
        }
      } else if (acc.type === 'savings') {
        if (acc.balance >= 0) {
          savings += acc.balance;
          liquid += acc.balance;
        } else {
          debt += Math.abs(acc.balance);
        }
      } else {
        if (acc.balance >= 0) {
          operating += acc.balance;
          liquid += acc.balance;
        } else {
          debt += Math.abs(acc.balance);
        }
      }
    });

    return {
      totalLiquidAssets: liquid,
      totalSavingsCapital: savings,
      totalOperatingBalance: operating,
      totalDebts: debt,
      netWorth: liquid - debt,
    };
  }, [accounts]);

  const { totalSavedInGoals, totalTargetGoals } = useMemo(() => {
    const saved = goals.reduce((acc, g) => acc + (Number(g.currentAmount) || 0), 0);
    const target = goals.reduce((acc, g) => acc + (Number(g.targetAmount) || 0), 0);
    return { totalSavedInGoals: saved, totalTargetGoals: target };
  }, [goals]);

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
    setAllTransactions(INITIAL_TRANSACTIONS);
    setSettings(DEFAULT_SETTINGS);
    setCategories(DEFAULT_CATEGORIES);
    setAccounts(DEFAULT_ACCOUNTS);
    setGoals(DEFAULT_GOALS);
    setRecurringExpenses(DEFAULT_RECURRING);
    setDebtsLoans(DEFAULT_DEBTS);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEFAULT_GOALS));
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(DEFAULT_RECURRING));
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(DEFAULT_DEBTS));
    } catch (e) {
      console.error('Failed to reset localStorage', e);
    }
  };

  // Clear all data
  const clearAllData = () => {
    setAllTransactions([]);
    setGoals([]);
    setRecurringExpenses([]);
    setDebtsLoans([]);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify([]));
    } catch (e) {
      console.error('Failed to clear transactions', e);
    }
  };

  // Currency Formatter
  const formatCurrency = (amount: number): string => {
    const isNegative = amount < 0;
    const formatted = Math.abs(amount).toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${isNegative ? '-' : ''}${settings.currency} ${formatted}`;
  };

  // Export to CSV
  const exportToCSV = () => {
    if (allTransactions.length === 0) return;
    const headers = [
      'ID',
      'Tipo',
      'Concepto',
      'Monto',
      'Categoría',
      'Método de Pago',
      'Cuenta',
      'Fecha',
      'Notas',
    ];
    const rows = allTransactions.map((tx) => {
      const cat = categories.find((c) => c.id === tx.categoryId)?.name || 'General';
      const acc = accounts.find((a) => a.id === tx.accountId)?.name || 'Sin cuenta asignada';
      return [
        tx.id,
        tx.type === 'expense' ? 'Gasto' : 'Ingreso',
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount,
        `"${cat}"`,
        tx.paymentMethod,
        `"${acc}"`,
        tx.date,
        `"${(tx.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
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
      version: '2.2',
      exportedAt: new Date().toISOString(),
      settings,
      transactions: allTransactions,
      categories,
      accounts,
      goals,
      recurringExpenses,
      debtsLoans,
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
        setAllTransactions(parsed.transactions);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(parsed.transactions));
        if (parsed.settings) {
          setSettings(parsed.settings);
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
        }
        if (parsed.categories && Array.isArray(parsed.categories)) {
          setCategories(parsed.categories);
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(parsed.categories));
        }
        if (parsed.accounts && Array.isArray(parsed.accounts)) {
          setAccounts(parsed.accounts);
          localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(parsed.accounts));
        }
        if (parsed.goals && Array.isArray(parsed.goals)) {
          setGoals(parsed.goals);
          localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(parsed.goals));
        }
        if (parsed.recurringExpenses && Array.isArray(parsed.recurringExpenses)) {
          setRecurringExpenses(parsed.recurringExpenses);
          localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(parsed.recurringExpenses));
        }
        if (parsed.debtsLoans && Array.isArray(parsed.debtsLoans)) {
          setDebtsLoans(parsed.debtsLoans);
          localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(parsed.debtsLoans));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Calculated Metrics (based on active transactions of selectedMonth)
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
    const usage =
      settings.monthlyBudget > 0 ? Math.round((expenses / settings.monthlyBudget) * 100) : 0;

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: balance,
      savingsRate: rate,
      budgetUsagePercent: usage,
    };
  }, [transactions, settings.monthlyBudget]);

  // Category breakdown for expenses (for selectedMonth)
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

  // Monthly trend for the past 6 months (based on allTransactions)
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

    allTransactions.forEach((tx) => {
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
  }, [allTransactions]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        allTransactions,
        categories,
        settings,
        isLoaded,
        activeTab,
        setActiveTab,
        isAddModalOpen,
        setIsAddModalOpen,
        isReportModalOpen,
        setIsReportModalOpen,
        editingTransaction,
        setEditingTransaction,
        selectedMonth,
        setSelectedMonth,
        availableMonths,
        goToPreviousMonth,
        goToNextMonth,
        monthComparison,
        accounts,
        addAccount,
        updateAccount,
        deleteAccount,
        transferBetweenAccounts,
        adjustAccountBalance,
        totalLiquidAssets,
        totalSavingsCapital,
        totalOperatingBalance,
        totalDebts,
        netWorth,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        withdrawFromGoal,
        totalSavedInGoals,
        totalTargetGoals,
        recurringExpenses,
        addRecurringExpense,
        updateRecurringExpense,
        deleteRecurringExpense,
        payRecurringExpense,
        totalRecurringMonthly,
        recurringPaidThisMonth,
        recurringPendingThisMonth,
        debtsLoans,
        addDebtLoan,
        updateDebtLoan,
        deleteDebtLoan,
        settleDebtLoan,
        totalLentPending,
        totalBorrowedPending,
        netDebtBalance,
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
