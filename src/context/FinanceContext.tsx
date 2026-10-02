"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { supabaseService } from "../lib/supabase-service";
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
  SavingsChallenge,
} from "../types/finance";
import { DEFAULT_CATEGORIES } from "../data/categories";
import {
  DEFAULT_SETTINGS,
  INITIAL_TRANSACTIONS,
  DEFAULT_ACCOUNTS,
  DEFAULT_GOALS,
  DEFAULT_RECURRING,
  DEFAULT_DEBTS,
  DEFAULT_CHALLENGES,
} from "../data/initialData";
import {
  DEMO_SETTINGS,
  DEMO_TRANSACTIONS,
  DEMO_ACCOUNTS,
  DEMO_GOALS,
  DEMO_RECURRING,
  DEMO_DEBTS,
  DEMO_CHALLENGES,
} from "../data/demoData";
import { format, subMonths, parseISO, addDays, getDate } from "date-fns";
import { es } from "date-fns/locale";

export interface CashFlowDay {
  date: string;
  dayLabel: string;
  balance: number;
  income: number;
  expenses: number;
  events: string[];
}

export interface CashFlowProjectionResult {
  timeline: CashFlowDay[];
  startingBalance: number;
  finalBalance: number;
  minBalance: number;
  minBalanceDate: string;
  isAlert: boolean;
  totalProjectedIncome: number;
  totalProjectedExpenses: number;
}

export interface DebtPlanItem {
  id: string;
  personName: string;
  amount: number;
  interestRate: number;
  minimumPayment: number;
  order: number;
  monthsToPay: number;
  totalInterestPaid: number;
}

export interface DebtStrategyResult {
  snowball: {
    months: number;
    totalInterest: number;
    payoffDate: string;
    plan: DebtPlanItem[];
  };
  avalanche: {
    months: number;
    totalInterest: number;
    payoffDate: string;
    plan: DebtPlanItem[];
  };
  interestSaved: number;
  monthsSaved: number;
}

export interface PhantomExpenseSummary {
  total: number;
  count: number;
  percentage: number;
  annualProjection: number;
  annualSavings50: number;
  transactions: Transaction[];
  topDescriptions: {
    description: string;
    count: number;
    total: number;
    average: number;
    categoryName: string;
  }[];
}

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
  addAccount: (data: Omit<Account, "id">) => void;
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

  // Multi-Currency
  convertAmount: (
    amount: number,
    fromCurrency?: string,
    toCurrency?: string,
  ) => number;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  currencyBreakdown: {
    currency: string;
    total: number;
    convertedTotal: number;
  }[];

  // Credit Cards & Installments
  creditCardsSummary: {
    totalLimit: number;
    totalUsed: number;
    availableTotal: number;
    cards: {
      account: Account;
      used: number;
      available: number;
      daysUntilClosing: number;
      daysUntilDue: number;
      isNearClosing: boolean;
    }[];
  };
  activeInstallments: Transaction[];

  // Savings Goals
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, "id" | "createdAt">) => void;
  updateGoal: (id: string, data: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (
    goalId: string,
    amount: number,
    fromAccountId?: string,
  ) => void;
  withdrawFromGoal: (
    goalId: string,
    amount: number,
    toAccountId?: string,
  ) => void;
  totalSavedInGoals: number;
  totalTargetGoals: number;

  // Gamified Savings Challenges
  challenges: SavingsChallenge[];
  addChallenge: (
    challenge: Omit<SavingsChallenge, "id" | "createdAt">,
  ) => void;
  updateChallenge: (id: string, data: Partial<SavingsChallenge>) => void;
  deleteChallenge: (id: string) => void;
  toggleChallengeStep: (
    id: string,
    stepIndex: number,
    amountPerStep?: number,
    accountId?: string,
  ) => void;

  // Recurring / Fixed Expenses
  recurringExpenses: RecurringExpense[];
  addRecurringExpense: (
    expense: Omit<RecurringExpense, "id" | "createdAt">,
  ) => void;
  updateRecurringExpense: (id: string, data: Partial<RecurringExpense>) => void;
  deleteRecurringExpense: (id: string) => void;
  payRecurringExpense: (id: string, date?: string, accountId?: string) => void;
  totalRecurringMonthly: number;
  recurringPaidThisMonth: number;
  recurringPendingThisMonth: number;

  // Debts & Loans ("Me Deben" / "Debo")
  debtsLoans: DebtLoan[];
  addDebtLoan: (debt: Omit<DebtLoan, "id" | "createdAt">) => void;
  updateDebtLoan: (id: string, data: Partial<DebtLoan>) => void;
  deleteDebtLoan: (id: string) => void;
  settleDebtLoan: (id: string, accountId?: string) => void;
  totalLentPending: number;
  totalBorrowedPending: number;
  netDebtBalance: number;

  // Strategy & Projections
  phantomExpensesSummary: PhantomExpenseSummary;
  getCashFlowProjection: (days?: 30 | 60 | 90) => CashFlowProjectionResult;
  calculateDebtStrategy: (extraMonthlyPayment?: number) => DebtStrategyResult;

  // Actions
  addTransaction: (data: Omit<Transaction, "id" | "createdAt">) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetToDefaultData: () => void;
  clearAllData: () => void;
  exportToCSV: () => void;
  exportToJSON: () => void;
  importFromJSON: (jsonData: string) => boolean;

  // Computed metrics (for selectedMonth)
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
  budgetUsagePercent: number;
  categoryBreakdown: {
    category: Category;
    amount: number;
    percentage: number;
    count: number;
  }[];
  monthlyExpenseTrend: { month: string; expenses: number; income: number }[];

  // Supabase Cloud Auth & Sync
  user: User | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  signOut: () => Promise<void>;
  isCloudSyncing: boolean;
  syncLocalDataToCloud: (overrideUserId?: string) => Promise<void>;

  // Demo Mode
  isDemoMode: boolean;
  enableDemoMode: () => void;
  exitDemoMode: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRANSACTIONS: "finanza_transactions_v3",
  SETTINGS: "finanza_settings_v3",
  CATEGORIES: "finanza_categories_v3",
  ACCOUNTS: "finanza_accounts_v3",
  GOALS: "finanza_goals_v3",
  RECURRING: "finanza_recurring_v3",
  DEBTS: "finanza_debts_v3",
  CHALLENGES: "finanza_challenges_v3",
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [goals, setGoals] = useState<SavingsGoal[]>(DEFAULT_GOALS);
  const [challenges, setChallenges] =
    useState<SavingsChallenge[]>(DEFAULT_CHALLENGES);
  const [recurringExpenses, setRecurringExpenses] =
    useState<RecurringExpense[]>(DEFAULT_RECURRING);
  const [debtsLoans, setDebtsLoans] = useState<DebtLoan[]>(DEFAULT_DEBTS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // Default month: Current year and month 'YYYY-MM'
  const currentMonthStr = useMemo(() => {
    return format(new Date(), "yyyy-MM");
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  // Supabase Auth and Sync State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true);
    setAllTransactions(DEMO_TRANSACTIONS);
    setAccounts(DEMO_ACCOUNTS);
    setGoals(DEMO_GOALS);
    setChallenges(DEMO_CHALLENGES);
    setRecurringExpenses(DEMO_RECURRING);
    setDebtsLoans(DEMO_DEBTS);
    setSettings(DEMO_SETTINGS);
  }, []);

  const exitDemoMode = useCallback(() => {
    setIsDemoMode(false);
    resetToDefaultData();
    setIsAuthModalOpen(true);
  }, []);

  // Sync entire local data to cloud
  const syncLocalDataToCloud = useCallback(
    async (overrideUserId?: string) => {
      const targetUserId = overrideUserId || user?.id;
      if (!targetUserId) return;
      try {
        setIsCloudSyncing(true);
        await supabaseService.migrateLocalDataToCloud(targetUserId, {
          accounts,
          transactions: allTransactions,
          recurring: recurringExpenses,
          debts: debtsLoans,
          goals,
          challenges,
          settings,
        });
      } catch (err) {
        console.error("Error migrating local data to cloud:", err);
      } finally {
        setIsCloudSyncing(false);
      }
    },
    [
      user?.id,
      accounts,
      allTransactions,
      recurringExpenses,
      debtsLoans,
      goals,
      challenges,
      settings,
    ]
  );

  const loadedUserRef = useRef<string | null>(null);
  const isLoadingCloudRef = useRef<boolean>(false);

  // Load cloud data for authenticated user
  const loadCloudData = useCallback(async (userId: string, force = false) => {
    if (!userId) return;
    if (isLoadingCloudRef.current) return;
    if (!force && loadedUserRef.current === userId) return;

    try {
      isLoadingCloudRef.current = true;
      setIsCloudSyncing(true);
      const data = await supabaseService.fetchAllUserData(userId);
      if (data) {
        setAccounts(data.accounts || []);
        setAllTransactions(data.transactions || []);
        setRecurringExpenses(data.recurring || []);
        setDebtsLoans(data.debts || []);
        setGoals(data.goals || []);
        setChallenges(data.challenges || []);
        if (data.settings) setSettings(data.settings);
        if (data.categories.length > 0) setCategories(data.categories);
        loadedUserRef.current = userId;
      }
    } catch (err) {
      console.error("Error loading cloud data from Supabase:", err);
    } finally {
      setIsCloudSyncing(false);
      isLoadingCloudRef.current = false;
    }
  }, []);

  // Supabase Auth listener
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (event === "SIGNED_OUT" || !currentUser) {
        loadedUserRef.current = null;
      } else if (currentUser && loadedUserRef.current !== currentUser.id) {
        await loadCloudData(currentUser.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadCloudData]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    loadedUserRef.current = null;
    setUser(null);
    resetToDefaultData();
  };

  // Load from localStorage on client mount with migration checks
  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem(
        STORAGE_KEYS.TRANSACTIONS,
      );
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const storedAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      const storedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      const storedChallenges = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
      const storedRecurring = localStorage.getItem(STORAGE_KEYS.RECURRING);
      const storedDebts = localStorage.getItem(STORAGE_KEYS.DEBTS);

      if (storedTransactions) {
        setAllTransactions(JSON.parse(storedTransactions));
      } else {
        setAllTransactions(INITIAL_TRANSACTIONS);
        localStorage.setItem(
          STORAGE_KEYS.TRANSACTIONS,
          JSON.stringify(INITIAL_TRANSACTIONS),
        );
      }

      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        const mergedSettings: UserSettings = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          exchangeRates: {
            ...DEFAULT_SETTINGS.exchangeRates,
            ...(parsed.exchangeRates || {}),
          },
        };
        setSettings(mergedSettings);
      } else {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem(
          STORAGE_KEYS.SETTINGS,
          JSON.stringify(DEFAULT_SETTINGS),
        );
      }

      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories(DEFAULT_CATEGORIES);
        localStorage.setItem(
          STORAGE_KEYS.CATEGORIES,
          JSON.stringify(DEFAULT_CATEGORIES),
        );
      }

      if (storedAccounts) {
        setAccounts(JSON.parse(storedAccounts));
      } else {
        setAccounts(DEFAULT_ACCOUNTS);
        localStorage.setItem(
          STORAGE_KEYS.ACCOUNTS,
          JSON.stringify(DEFAULT_ACCOUNTS),
        );
      }

      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      } else {
        setGoals(DEFAULT_GOALS);
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEFAULT_GOALS));
      }

      if (storedChallenges) {
        setChallenges(JSON.parse(storedChallenges));
      } else {
        setChallenges(DEFAULT_CHALLENGES);
        localStorage.setItem(
          STORAGE_KEYS.CHALLENGES,
          JSON.stringify(DEFAULT_CHALLENGES),
        );
      }

      if (storedRecurring) {
        setRecurringExpenses(JSON.parse(storedRecurring));
      } else {
        setRecurringExpenses(DEFAULT_RECURRING);
        localStorage.setItem(
          STORAGE_KEYS.RECURRING,
          JSON.stringify(DEFAULT_RECURRING),
        );
      }

      if (storedDebts) {
        setDebtsLoans(JSON.parse(storedDebts));
      } else {
        setDebtsLoans(DEFAULT_DEBTS);
        localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(DEFAULT_DEBTS));
      }
    } catch (e) {
      console.error("Error loading data from localStorage", e);
      setAllTransactions(INITIAL_TRANSACTIONS);
      setSettings(DEFAULT_SETTINGS);
      setCategories(DEFAULT_CATEGORIES);
      setAccounts(DEFAULT_ACCOUNTS);
      setGoals(DEFAULT_GOALS);
      setChallenges(DEFAULT_CHALLENGES);
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
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [settings.theme, isLoaded]);

  // Save helpers
  const saveTransactions = (newTransactions: Transaction[]) => {
    setAllTransactions(newTransactions);
    try {
      localStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(newTransactions),
      );
    } catch (e) {
      console.error("Failed to save transactions", e);
    }
  };

  const saveAccounts = (newAccounts: Account[]) => {
    setAccounts(newAccounts);
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(newAccounts));
    } catch (e) {
      console.error("Failed to save accounts", e);
    }
  };

  const saveGoals = (newGoals: SavingsGoal[]) => {
    setGoals(newGoals);
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(newGoals));
    } catch (e) {
      console.error("Failed to save goals", e);
    }
  };

  const saveChallenges = (newChallenges: SavingsChallenge[]) => {
    setChallenges(newChallenges);
    try {
      localStorage.setItem(
        STORAGE_KEYS.CHALLENGES,
        JSON.stringify(newChallenges),
      );
    } catch (e) {
      console.error("Failed to save challenges", e);
    }
  };

  const saveRecurring = (newRecurring: RecurringExpense[]) => {
    setRecurringExpenses(newRecurring);
    try {
      localStorage.setItem(
        STORAGE_KEYS.RECURRING,
        JSON.stringify(newRecurring),
      );
    } catch (e) {
      console.error("Failed to save recurring expenses", e);
    }
  };

  const saveDebtsLoans = (newDebts: DebtLoan[]) => {
    setDebtsLoans(newDebts);
    try {
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(newDebts));
    } catch (e) {
      console.error("Failed to save debts", e);
    }
  };

  // Multi-Currency Conversion Logic
  // Rates are relative to base currency (e.g. PEN: 1.0, USD: 3.75 means 1 USD = 3.75 PEN)
  const convertAmount = (
    amount: number,
    fromCurrency: string = settings.currencyCode,
    toCurrency: string = settings.currencyCode,
  ): number => {
    if (fromCurrency === toCurrency || !amount) return amount;
    const rates = settings.exchangeRates || { PEN: 1, USD: 3.75, EUR: 4.05 };

    // Value relative to PEN baseline
    const fromRate = rates[fromCurrency] || (fromCurrency === "USD" ? 3.75 : 1);
    const toRate = rates[toCurrency] || (toCurrency === "USD" ? 3.75 : 1);

    const amountInPEN = amount * fromRate;
    const converted = amountInPEN / toRate;
    return Number(converted.toFixed(2));
  };

  // Currency Formatter
  const formatCurrency = (amount: number, currencyCode?: string): string => {
    const isNegative = amount < 0;
    const absVal = Math.abs(amount).toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const code = currencyCode || settings.currencyCode;
    let symbol = settings.currency;
    if (code === "USD") symbol = "$";
    else if (code === "EUR") symbol = "€";
    else if (code === "PEN") symbol = "S/.";

    return `${isNegative ? "-" : ""}${symbol} ${absVal}`;
  };

  // Month navigation
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    monthsSet.add(currentMonthStr);

    allTransactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        monthsSet.add(tx.date.substring(0, 7));
      }
    });

    const sorted = Array.from(monthsSet).sort().reverse();
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    return sorted.map((m) => {
      const [yearStr, monthNumStr] = m.split("-");
      const monthIdx = parseInt(monthNumStr, 10) - 1;
      const label = `${monthNames[monthIdx] || monthNumStr} ${yearStr}`;
      return { value: m, label };
    });
  }, [allTransactions, currentMonthStr]);

  const goToPreviousMonth = () => {
    if (selectedMonth === "all") {
      setSelectedMonth(currentMonthStr);
      return;
    }
    const [y, m] = selectedMonth.split("-").map(Number);
    let prevY = y;
    let prevM = m - 1;
    if (prevM < 1) {
      prevM = 12;
      prevY -= 1;
    }
    setSelectedMonth(`${prevY}-${String(prevM).padStart(2, "0")}`);
  };

  const goToNextMonth = () => {
    if (selectedMonth === "all") {
      setSelectedMonth(currentMonthStr);
      return;
    }
    const [y, m] = selectedMonth.split("-").map(Number);
    let nextY = y;
    let nextM = m + 1;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    }
    setSelectedMonth(`${nextY}-${String(nextM).padStart(2, "0")}`);
  };

  // Filter transactions by selectedMonth
  const transactions = useMemo(() => {
    if (selectedMonth === "all") return allTransactions;
    return allTransactions.filter(
      (tx) => tx.date && tx.date.startsWith(selectedMonth),
    );
  }, [allTransactions, selectedMonth]);

  // Month comparison
  const monthComparison = useMemo(() => {
    if (selectedMonth === "all") {
      return {
        previousIncome: 0,
        previousExpenses: 0,
        expenseDiffPercent: 0,
        incomeDiffPercent: 0,
      };
    }
    const [y, m] = selectedMonth.split("-").map(Number);
    let prevY = y;
    let prevM = m - 1;
    if (prevM < 1) {
      prevM = 12;
      prevY -= 1;
    }
    const prevMonthKey = `${prevY}-${String(prevM).padStart(2, "0")}`;

    const prevTxs = allTransactions.filter(
      (tx) => tx.date && tx.date.startsWith(prevMonthKey),
    );
    let prevIncome = 0;
    let prevExpenses = 0;
    prevTxs.forEach((t) => {
      const amtInBase = convertAmount(
        t.amount,
        t.currency || settings.currencyCode,
        settings.currencyCode,
      );
      if (t.type === "income") prevIncome += amtInBase;
      else prevExpenses += amtInBase;
    });

    let currentExpenses = 0;
    let currentIncome = 0;
    transactions.forEach((t) => {
      const amtInBase = convertAmount(
        t.amount,
        t.currency || settings.currencyCode,
        settings.currencyCode,
      );
      if (t.type === "income") currentIncome += amtInBase;
      else currentExpenses += amtInBase;
    });

    const expenseDiffPercent =
      prevExpenses > 0
        ? Math.round(((currentExpenses - prevExpenses) / prevExpenses) * 100)
        : 0;
    const incomeDiffPercent =
      prevIncome > 0
        ? Math.round(((currentIncome - prevIncome) / prevIncome) * 100)
        : 0;

    return {
      previousIncome: prevIncome,
      previousExpenses: prevExpenses,
      expenseDiffPercent,
      incomeDiffPercent,
    };
  }, [allTransactions, transactions, selectedMonth, settings.currencyCode]);

  // Add / Edit / Delete Transactions with Account Balances & Installments
  const addTransaction = (data: Omit<Transaction, "id" | "createdAt">) => {
    const newTx: Transaction = {
      ...data,
      id: "tx-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      currency:
        data.currency ||
        accounts.find((a) => a.id === data.accountId)?.currency ||
        settings.currencyCode,
      createdAt: new Date().toISOString(),
    };

    saveTransactions([newTx, ...allTransactions]);

    if (user) {
      supabaseService.insertTransaction(user.id, newTx).catch((err) =>
        console.error("Error inserting transaction to Supabase:", err)
      );
    }

    // Update account balance if assigned
    if (newTx.accountId) {
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === newTx.accountId) {
          const delta =
            newTx.type === "income" ? newTx.amount : -newTx.amount;
          return {
            ...acc,
            balance: Number((acc.balance + delta).toFixed(2)),
          };
        }
        return acc;
      });
      saveAccounts(updatedAccounts);

      if (user) {
        const updatedAcc = updatedAccounts.find((a) => a.id === newTx.accountId);
        if (updatedAcc) {
          supabaseService.upsertAccount(user.id, updatedAcc).catch((err) =>
            console.error("Error updating account balance in Supabase:", err)
          );
        }
      }
    }
  };

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    const oldTx = allTransactions.find((tx) => tx.id === id);
    const updatedTransactions = allTransactions.map((tx) =>
      tx.id === id ? { ...tx, ...data } : tx,
    );
    saveTransactions(updatedTransactions);

    if (user) {
      const updatedTx = updatedTransactions.find((tx) => tx.id === id);
      if (updatedTx) {
        supabaseService.insertTransaction(user.id, updatedTx).catch((err) =>
          console.error("Error updating transaction in Supabase:", err)
        );
      }
    }

    // Revert old effect and apply new effect on accounts
    if (oldTx && (oldTx.accountId || data.accountId)) {
      let updatedAccounts = [...accounts];
      if (oldTx.accountId) {
        const revertDelta =
          oldTx.type === "income" ? -oldTx.amount : oldTx.amount;
        updatedAccounts = updatedAccounts.map((acc) =>
          acc.id === oldTx.accountId
            ? {
                ...acc,
                balance: Number((acc.balance + revertDelta).toFixed(2)),
              }
            : acc,
        );
      }
      const finalAccId = data.accountId || oldTx.accountId;
      const finalType = data.type || oldTx.type;
      const finalAmount =
        data.amount !== undefined ? data.amount : oldTx.amount;
      if (finalAccId) {
        const applyDelta = finalType === "income" ? finalAmount : -finalAmount;
        updatedAccounts = updatedAccounts.map((acc) =>
          acc.id === finalAccId
            ? { ...acc, balance: Number((acc.balance + applyDelta).toFixed(2)) }
            : acc,
        );
      }
      saveAccounts(updatedAccounts);

      if (user) {
        const touchedAccIds = Array.from(new Set([oldTx.accountId, finalAccId].filter(Boolean)));
        touchedAccIds.forEach((accId) => {
          const accToSync = updatedAccounts.find((a) => a.id === accId);
          if (accToSync) {
            supabaseService.upsertAccount(user.id, accToSync).catch((err) =>
              console.error("Error syncing account update in Supabase:", err)
            );
          }
        });
      }
    }
  };

  const deleteTransaction = (id: string) => {
    const oldTx = allTransactions.find((tx) => tx.id === id);
    const updated = allTransactions.filter((tx) => tx.id !== id);
    saveTransactions(updated);

    if (user) {
      supabaseService.deleteTransaction(id).catch((err) =>
        console.error("Error deleting transaction in Supabase:", err)
      );
    }

    if (oldTx && oldTx.accountId) {
      const revertDelta =
        oldTx.type === "income" ? -oldTx.amount : oldTx.amount;
      const updatedAccounts = accounts.map((acc) =>
        acc.id === oldTx.accountId
          ? { ...acc, balance: Number((acc.balance + revertDelta).toFixed(2)) }
          : acc,
      );
      saveAccounts(updatedAccounts);

      if (user) {
        const accToSync = updatedAccounts.find((a) => a.id === oldTx.accountId);
        if (accToSync) {
          supabaseService.upsertAccount(user.id, accToSync).catch((err) =>
            console.error("Error updating account after deleting tx in Supabase:", err)
          );
        }
      }
    }
  };

  // Accounts Management
  const addAccount = (data: Omit<Account, "id">) => {
    const newAcc: Account = {
      ...data,
      id:
        "acc-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      currency: data.currency || settings.currencyCode,
    };
    saveAccounts([...accounts, newAcc]);

    if (user) {
      supabaseService.upsertAccount(user.id, newAcc).catch((err) =>
        console.error("Error adding account in Supabase:", err)
      );
    }
  };

  const updateAccount = (id: string, data: Partial<Account>) => {
    const updated = accounts.map((acc) => (acc.id === id ? { ...acc, ...data } : acc));
    saveAccounts(updated);

    if (user) {
      const acc = updated.find((a) => a.id === id);
      if (acc) {
        supabaseService.upsertAccount(user.id, acc).catch((err) =>
          console.error("Error updating account in Supabase:", err)
        );
      }
    }
  };

  const deleteAccount = (id: string) => {
    saveAccounts(accounts.filter((acc) => acc.id !== id));

    if (user) {
      supabaseService.deleteAccount(id).catch((err) =>
        console.error("Error deleting account in Supabase:", err)
      );
    }
  };

  const adjustAccountBalance = (id: string, newBalance: number) => {
    const updated = accounts.map((acc) =>
      acc.id === id ? { ...acc, balance: newBalance } : acc,
    );
    saveAccounts(updated);

    if (user) {
      const acc = updated.find((a) => a.id === id);
      if (acc) {
        supabaseService.upsertAccount(user.id, acc).catch((err) =>
          console.error("Error adjusting account balance in Supabase:", err)
        );
      }
    }
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

    // Handle currency exchange if accounts have different currencies
    const targetAmount =
      fromAcc.currency !== toAcc.currency
        ? convertAmount(
            data.amount,
            fromAcc.currency || settings.currencyCode,
            toAcc.currency || settings.currencyCode,
          )
        : data.amount;

    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === data.fromAccountId) {
        return {
          ...acc,
          balance: Number((acc.balance - data.amount).toFixed(2)),
        };
      }
      if (acc.id === data.toAccountId) {
        return {
          ...acc,
          balance: Number((acc.balance + targetAmount).toFixed(2)),
        };
      }
      return acc;
    });
    saveAccounts(updatedAccounts);

    const transferTx: Transaction = {
      id: "tx-trf-" + Date.now(),
      description: `Transferencia: ${fromAcc.name} ➔ ${toAcc.name}`,
      amount: data.amount,
      type: "expense",
      categoryId: "cat-servicios",
      date: data.date,
      paymentMethod: "transferencia",
      accountId: data.fromAccountId,
      currency: fromAcc.currency || settings.currencyCode,
      notes:
        data.notes ||
        `Transferencia interna (${fromAcc.name} a ${toAcc.name})${fromAcc.currency !== toAcc.currency ? ` [Conversión: ${formatCurrency(data.amount, fromAcc.currency)} -> ${formatCurrency(targetAmount, toAcc.currency)}]` : ""}`,
      createdAt: new Date().toISOString(),
    };
    saveTransactions([transferTx, ...allTransactions]);

    if (user) {
      const fromSynced = updatedAccounts.find((a) => a.id === data.fromAccountId);
      const toSynced = updatedAccounts.find((a) => a.id === data.toAccountId);
      if (fromSynced) supabaseService.upsertAccount(user.id, fromSynced).catch(console.error);
      if (toSynced) supabaseService.upsertAccount(user.id, toSynced).catch(console.error);
      supabaseService.insertTransaction(user.id, transferTx).catch(console.error);
    }
  };

  // Credit Cards Summary & Installments
  const creditCardsSummary = useMemo(() => {
    const today = new Date();
    const currentDayOfMonth = getDate(today);

    let totalLimit = 0;
    let totalUsed = 0;

    const creditAccounts = accounts.filter((a) => a.type === "credit");

    const cards = creditAccounts.map((acc) => {
      const limit = acc.creditLimit || 0;
      const used = acc.balance < 0 ? Math.abs(acc.balance) : 0;
      const available = Math.max(0, limit - used);

      totalLimit += convertAmount(
        limit,
        acc.currency || settings.currencyCode,
        settings.currencyCode,
      );
      totalUsed += convertAmount(
        used,
        acc.currency || settings.currencyCode,
        settings.currencyCode,
      );

      const closingDay = acc.closingDay || 20;
      const dueDay = acc.dueDay || 15;

      let daysUntilClosing = closingDay - currentDayOfMonth;
      if (daysUntilClosing < 0) daysUntilClosing += 30;

      let daysUntilDue = dueDay - currentDayOfMonth;
      if (daysUntilDue < 0) daysUntilDue += 30;

      return {
        account: acc,
        used,
        available,
        daysUntilClosing,
        daysUntilDue,
        isNearClosing: daysUntilClosing <= 3,
      };
    });

    const availableTotal = Math.max(0, totalLimit - totalUsed);

    return {
      totalLimit,
      totalUsed,
      availableTotal,
      cards,
    };
  }, [accounts, settings.currencyCode]);

  const activeInstallments = useMemo(() => {
    return allTransactions.filter(
      (tx) => tx.installments && tx.installments.total > 1,
    );
  }, [allTransactions]);

  // Savings Goals Management
  const addGoal = (goal: Omit<SavingsGoal, "id" | "createdAt">) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id:
        "goal-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      currency: goal.currency || settings.currencyCode,
      createdAt: new Date().toISOString(),
    };
    saveGoals([...goals, newGoal]);

    if (user) {
      supabaseService.upsertGoal(user.id, newGoal).catch((err) =>
        console.error("Error adding goal to Supabase:", err)
      );
    }
  };

  const updateGoal = (id: string, data: Partial<SavingsGoal>) => {
    const updated = goals.map((g) => (g.id === id ? { ...g, ...data } : g));
    saveGoals(updated);

    if (user) {
      const g = updated.find((x) => x.id === id);
      if (g) {
        supabaseService.upsertGoal(user.id, g).catch((err) =>
          console.error("Error updating goal in Supabase:", err)
        );
      }
    }
  };

  const deleteGoal = (id: string) => {
    saveGoals(goals.filter((g) => g.id !== id));

    if (user) {
      supabaseService.deleteGoal(id).catch((err) =>
        console.error("Error deleting goal in Supabase:", err)
      );
    }
  };

  const contributeToGoal = (
    goalId: string,
    amount: number,
    fromAccountId?: string,
  ) => {
    if (amount <= 0) return;
    const targetGoal = goals.find((g) => g.id === goalId);
    if (!targetGoal) return;

    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    const convertedToGoal =
      fromAcc && fromAcc.currency !== targetGoal.currency
        ? convertAmount(
            amount,
            fromAcc.currency || settings.currencyCode,
            targetGoal.currency || settings.currencyCode,
          )
        : amount;

    const updatedGoals = goals.map((g) => {
      if (g.id === goalId) {
        return {
          ...g,
          currentAmount: Number((g.currentAmount + convertedToGoal).toFixed(2)),
        };
      }
      return g;
    });
    saveGoals(updatedGoals);

    let updatedAccounts = accounts;
    if (fromAccountId) {
      updatedAccounts = accounts.map((acc) => {
        if (acc.id === fromAccountId) {
          return { ...acc, balance: Number((acc.balance - amount).toFixed(2)) };
        }
        return acc;
      });
      saveAccounts(updatedAccounts);
    }

    if (user) {
      const g = updatedGoals.find((x) => x.id === goalId);
      if (g) supabaseService.upsertGoal(user.id, g).catch(console.error);
      if (fromAccountId) {
        const acc = updatedAccounts.find((a) => a.id === fromAccountId);
        if (acc) supabaseService.upsertAccount(user.id, acc).catch(console.error);
      }
    }
  };

  const withdrawFromGoal = (
    goalId: string,
    amount: number,
    toAccountId?: string,
  ) => {
    if (amount <= 0) return;
    const targetGoal = goals.find((g) => g.id === goalId);
    if (!targetGoal) return;

    const updatedGoals = goals.map((g) => {
      if (g.id === goalId) {
        const nextAmt = Math.max(0, g.currentAmount - amount);
        return { ...g, currentAmount: Number(nextAmt.toFixed(2)) };
      }
      return g;
    });
    saveGoals(updatedGoals);

    let updatedAccounts = accounts;
    if (toAccountId) {
      const toAcc = accounts.find((a) => a.id === toAccountId);
      const convertedToAccount =
        toAcc && toAcc.currency !== targetGoal.currency
          ? convertAmount(
              amount,
              targetGoal.currency || settings.currencyCode,
              toAcc.currency || settings.currencyCode,
            )
          : amount;

      updatedAccounts = accounts.map((acc) => {
        if (acc.id === toAccountId) {
          return {
            ...acc,
            balance: Number((acc.balance + convertedToAccount).toFixed(2)),
          };
        }
        return acc;
      });
      saveAccounts(updatedAccounts);
    }

    if (user) {
      const g = updatedGoals.find((x) => x.id === goalId);
      if (g) supabaseService.upsertGoal(user.id, g).catch(console.error);
      if (toAccountId) {
        const acc = updatedAccounts.find((a) => a.id === toAccountId);
        if (acc) supabaseService.upsertAccount(user.id, acc).catch(console.error);
      }
    }
  };

  // Gamified Savings Challenges Management
  const addChallenge = (
    challenge: Omit<SavingsChallenge, "id" | "createdAt">,
  ) => {
    const newChal: SavingsChallenge = {
      ...challenge,
      id:
        "chal-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      currency: challenge.currency || settings.currencyCode,
      createdAt: new Date().toISOString(),
    };
    saveChallenges([...challenges, newChal]);

    if (user) {
      supabaseService.upsertChallenge(user.id, newChal).catch((err) =>
        console.error("Error adding challenge to Supabase:", err)
      );
    }
  };

  const updateChallenge = (id: string, data: Partial<SavingsChallenge>) => {
    const updated = challenges.map((c) => (c.id === id ? { ...c, ...data } : c));
    saveChallenges(updated);

    if (user) {
      const chal = updated.find((c) => c.id === id);
      if (chal) {
        supabaseService.upsertChallenge(user.id, chal).catch((err) =>
          console.error("Error updating challenge in Supabase:", err)
        );
      }
    }
  };

  const deleteChallenge = (id: string) => {
    saveChallenges(challenges.filter((c) => c.id !== id));

    if (user) {
      supabaseService.deleteChallenge(id).catch((err) =>
        console.error("Error deleting challenge in Supabase:", err)
      );
    }
  };

  const toggleChallengeStep = (
    id: string,
    stepIndex: number,
    amountPerStep: number = 20,
    accountId?: string,
  ) => {
    const chal = challenges.find((c) => c.id === id);
    if (!chal) return;

    const isDone = chal.completedSteps.includes(stepIndex);
    const newSteps = isDone
      ? chal.completedSteps.filter((s) => s !== stepIndex)
      : [...chal.completedSteps, stepIndex].sort((a, b) => a - b);

    const deltaAmount = isDone ? -amountPerStep : amountPerStep;
    const newCurrent = Math.max(
      0,
      Number((chal.currentAmount + deltaAmount).toFixed(2)),
    );
    const isCompleted =
      newSteps.length >= chal.durationUnits || newCurrent >= chal.targetAmount;

    updateChallenge(id, {
      completedSteps: newSteps,
      currentAmount: newCurrent,
      status: isCompleted ? "completed" : "active",
    });

    if (accountId && deltaAmount !== 0) {
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === accountId) {
          // If marking step as done, deposit to savings / subtract from operating
          return {
            ...acc,
            balance: Number((acc.balance - deltaAmount).toFixed(2)),
          };
        }
        return acc;
      });
      saveAccounts(updatedAccounts);

      if (user) {
        const acc = updatedAccounts.find((a) => a.id === accountId);
        if (acc) supabaseService.upsertAccount(user.id, acc).catch(console.error);
      }
    }
  };

  // Recurring / Fixed Expenses
  const addRecurringExpense = (
    expense: Omit<RecurringExpense, "id" | "createdAt">,
  ) => {
    const newExp: RecurringExpense = {
      ...expense,
      id:
        "rec-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      currency: expense.currency || settings.currencyCode,
      createdAt: new Date().toISOString(),
    };
    saveRecurring([...recurringExpenses, newExp]);

    if (user) {
      supabaseService.upsertRecurring(user.id, newExp).catch((err) =>
        console.error("Error adding recurring expense in Supabase:", err)
      );
    }
  };

  const updateRecurringExpense = (
    id: string,
    data: Partial<RecurringExpense>,
  ) => {
    const updated = recurringExpenses.map((r) => (r.id === id ? { ...r, ...data } : r));
    saveRecurring(updated);

    if (user) {
      const exp = updated.find((r) => r.id === id);
      if (exp) {
        supabaseService.upsertRecurring(user.id, exp).catch((err) =>
          console.error("Error updating recurring expense in Supabase:", err)
        );
      }
    }
  };

  const deleteRecurringExpense = (id: string) => {
    saveRecurring(recurringExpenses.filter((r) => r.id !== id));

    if (user) {
      supabaseService.deleteRecurring(id).catch((err) =>
        console.error("Error deleting recurring expense in Supabase:", err)
      );
    }
  };

  const payRecurringExpense = (
    id: string,
    date?: string,
    accountId?: string,
  ) => {
    const expense = recurringExpenses.find((r) => r.id === id);
    if (!expense) return;

    const payDate = date || format(new Date(), "yyyy-MM-dd");
    const targetAccountId = accountId || expense.accountId;

    addTransaction({
      description: `Pago fijo: ${expense.name}`,
      amount: expense.amount,
      type: "expense",
      categoryId: expense.categoryId,
      paymentMethod: expense.paymentMethod,
      accountId: targetAccountId,
      currency: expense.currency || settings.currencyCode,
      date: payDate,
      notes: expense.notes
        ? `Pago de servicio fijo programado. ${expense.notes}`
        : `Pago de servicio fijo: ${expense.name}`,
    });

    const monthKey = payDate.substring(0, 7);
    updateRecurringExpense(id, { lastPaidMonth: monthKey });
  };

  // Debts & Loans
  const addDebtLoan = (debt: Omit<DebtLoan, "id" | "createdAt">) => {
    const newDebt: DebtLoan = {
      ...debt,
      id:
        "debt-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      currency: debt.currency || settings.currencyCode,
      createdAt: new Date().toISOString(),
    };
    saveDebtsLoans([newDebt, ...debtsLoans]);

    if (user) {
      supabaseService.upsertDebt(user.id, newDebt).catch((err) =>
        console.error("Error adding debt in Supabase:", err)
      );
    }
  };

  const updateDebtLoan = (id: string, data: Partial<DebtLoan>) => {
    const updated = debtsLoans.map((d) => (d.id === id ? { ...d, ...data } : d));
    saveDebtsLoans(updated);

    if (user) {
      const debt = updated.find((d) => d.id === id);
      if (debt) {
        supabaseService.upsertDebt(user.id, debt).catch((err) =>
          console.error("Error updating debt in Supabase:", err)
        );
      }
    }
  };

  const deleteDebtLoan = (id: string) => {
    saveDebtsLoans(debtsLoans.filter((d) => d.id !== id));

    if (user) {
      supabaseService.deleteDebt(id).catch((err) =>
        console.error("Error deleting debt in Supabase:", err)
      );
    }
  };

  const settleDebtLoan = (id: string, accountId?: string) => {
    const debt = debtsLoans.find((d) => d.id === id);
    if (!debt || debt.status === "settled") return;

    const todayStr = format(new Date(), "yyyy-MM-dd");

    if (accountId) {
      if (debt.type === "lent") {
        const updatedAccounts = accounts.map((acc) => {
          if (acc.id === accountId) {
            return {
              ...acc,
              balance: Number((acc.balance + debt.amount).toFixed(2)),
            };
          }
          return acc;
        });
        saveAccounts(updatedAccounts);

        addTransaction({
          description: `Cobro de préstamo: ${debt.personName}`,
          amount: debt.amount,
          type: "income",
          categoryId: "cat-otros-ingresos",
          paymentMethod: "transferencia",
          accountId,
          currency: debt.currency || settings.currencyCode,
          date: todayStr,
          notes: debt.notes
            ? `Préstamo cobrado. Notas: ${debt.notes}`
            : `Cobro de préstamo a ${debt.personName}`,
        });
      } else {
        const updatedAccounts = accounts.map((acc) => {
          if (acc.id === accountId) {
            return {
              ...acc,
              balance: Number((acc.balance - debt.amount).toFixed(2)),
            };
          }
          return acc;
        });
        saveAccounts(updatedAccounts);

        addTransaction({
          description: `Pago de deuda a: ${debt.personName}`,
          amount: debt.amount,
          type: "expense",
          categoryId: "cat-otros",
          paymentMethod: "transferencia",
          accountId,
          currency: debt.currency || settings.currencyCode,
          date: todayStr,
          notes: debt.notes
            ? `Deuda saldada. Notas: ${debt.notes}`
            : `Pago de deuda a ${debt.personName}`,
        });
      }
    }

    const updated = debtsLoans.map((d) =>
      d.id === id
        ? {
            ...d,
            status: "settled" as const,
            settledDate: todayStr,
            accountId: accountId || d.accountId,
          }
        : d,
    );
    saveDebtsLoans(updated);

    if (user) {
      const settledItem = updated.find((d) => d.id === id);
      if (settledItem) {
        supabaseService.upsertDebt(user.id, settledItem).catch(console.error);
      }
    }
  };

  // Debt & Liquid Balances with Multi-currency
  const { totalLentPending, totalBorrowedPending, netDebtBalance } =
    useMemo(() => {
      let lent = 0;
      let borrowed = 0;

      debtsLoans.forEach((d) => {
        if (d.status === "pending") {
          const amtInBase = convertAmount(
            d.amount,
            d.currency || settings.currencyCode,
            settings.currencyCode,
          );
          if (d.type === "lent") {
            lent += amtInBase;
          } else {
            borrowed += amtInBase;
          }
        }
      });

      return {
        totalLentPending: lent,
        totalBorrowedPending: borrowed,
        netDebtBalance: lent - borrowed,
      };
    }, [debtsLoans, settings.currencyCode]);

  const {
    totalLiquidAssets,
    totalSavingsCapital,
    totalOperatingBalance,
    totalDebts,
    netWorth,
    currencyBreakdown,
  } = useMemo(() => {
    let liquid = 0;
    let savings = 0;
    let operating = 0;
    let debt = 0;

    const currMap: Record<string, { total: number; convertedTotal: number }> =
      {};

    accounts.forEach((acc) => {
      const accCurr = acc.currency || settings.currencyCode;
      if (!currMap[accCurr]) {
        currMap[accCurr] = { total: 0, convertedTotal: 0 };
      }
      currMap[accCurr].total += acc.balance;

      const convertedBalance = convertAmount(
        acc.balance,
        accCurr,
        settings.currencyCode,
      );
      currMap[accCurr].convertedTotal += convertedBalance;

      if (acc.type === "credit") {
        if (acc.balance < 0) {
          debt += Math.abs(convertedBalance);
        }
      } else if (acc.type === "savings") {
        if (acc.balance >= 0) {
          savings += convertedBalance;
          liquid += convertedBalance;
        } else {
          debt += Math.abs(convertedBalance);
        }
      } else {
        if (acc.balance >= 0) {
          operating += convertedBalance;
          liquid += convertedBalance;
        } else {
          debt += Math.abs(convertedBalance);
        }
      }
    });

    const breakdownList = Object.entries(currMap).map(([currency, data]) => ({
      currency,
      total: data.total,
      convertedTotal: data.convertedTotal,
    }));

    return {
      totalLiquidAssets: liquid,
      totalSavingsCapital: savings,
      totalOperatingBalance: operating,
      totalDebts: debt,
      netWorth: liquid - debt,
      currencyBreakdown: breakdownList,
    };
  }, [accounts, settings.currencyCode]);

  const { totalSavedInGoals, totalTargetGoals } = useMemo(() => {
    let saved = 0;
    let target = 0;

    goals.forEach((g) => {
      saved += convertAmount(
        g.currentAmount,
        g.currency || settings.currencyCode,
        settings.currencyCode,
      );
      target += convertAmount(
        g.targetAmount,
        g.currency || settings.currencyCode,
        settings.currencyCode,
      );
    });

    return { totalSavedInGoals: saved, totalTargetGoals: target };
  }, [goals, settings.currencyCode]);

  const {
    totalRecurringMonthly,
    recurringPaidThisMonth,
    recurringPendingThisMonth,
  } = useMemo(() => {
    let total = 0;
    let paid = 0;

    recurringExpenses.forEach((exp) => {
      const amtInBase = convertAmount(
        exp.amount,
        exp.currency || settings.currencyCode,
        settings.currencyCode,
      );
      total += amtInBase;

      const isPaid =
        exp.lastPaidMonth === selectedMonth ||
        transactions.some(
          (tx) =>
            tx.type === "expense" &&
            tx.description.toLowerCase().trim() ===
              exp.name.toLowerCase().trim(),
        );

      if (isPaid) paid += amtInBase;
    });

    return {
      totalRecurringMonthly: total,
      recurringPaidThisMonth: paid,
      recurringPendingThisMonth: Math.max(0, total - paid),
    };
  }, [recurringExpenses, transactions, selectedMonth, settings.currencyCode]);

  // Phantom Expenses / Gastos Hormiga Analytics
  const phantomExpensesSummary = useMemo<PhantomExpenseSummary>(() => {
    const threshold = settings.phantomExpenseThreshold || 20;

    const phantomTx = transactions.filter((t) => {
      if (t.type !== "expense") return false;
      const amtInBase = convertAmount(
        t.amount,
        t.currency || settings.currencyCode,
        settings.currencyCode,
      );
      const isTagged = t.tags?.includes("gasto-hormiga");
      return amtInBase <= threshold || isTagged;
    });

    const total = phantomTx.reduce((sum, tx) => {
      return (
        sum +
        convertAmount(
          tx.amount,
          tx.currency || settings.currencyCode,
          settings.currencyCode,
        )
      );
    }, 0);

    const count = phantomTx.length;
    const currentMonthExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce(
        (sum, t) =>
          sum +
          convertAmount(
            t.amount,
            t.currency || settings.currencyCode,
            settings.currencyCode,
          ),
        0,
      );

    const percentage =
      currentMonthExpenses > 0
        ? Math.round((total / currentMonthExpenses) * 100)
        : 0;

    const annualProjection = total * 12;
    const annualSavings50 = annualProjection * 0.5;

    // Aggregate by description
    const descMap: Record<
      string,
      { count: number; total: number; categoryId: string }
    > = {};

    phantomTx.forEach((tx) => {
      const key = tx.description.trim().toLowerCase();
      const amtInBase = convertAmount(
        tx.amount,
        tx.currency || settings.currencyCode,
        settings.currencyCode,
      );
      if (!descMap[key]) {
        descMap[key] = { count: 0, total: 0, categoryId: tx.categoryId };
      }
      descMap[key].count += 1;
      descMap[key].total += amtInBase;
    });

    const topDescriptions = Object.entries(descMap)
      .map(([desc, data]) => {
        const cat = categories.find((c) => c.id === data.categoryId);
        return {
          description: desc.charAt(0).toUpperCase() + desc.slice(1),
          count: data.count,
          total: Number(data.total.toFixed(2)),
          average: Number((data.total / data.count).toFixed(2)),
          categoryName: cat?.name || "General",
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    return {
      total,
      count,
      percentage,
      annualProjection,
      annualSavings50,
      transactions: phantomTx,
      topDescriptions,
    };
  }, [transactions, settings.phantomExpenseThreshold, settings.currencyCode, categories]);

  // Future Cash Flow Projection (30, 60 or 90 days)
  const getCashFlowProjection = (
    days: 30 | 60 | 90 = 60,
  ): CashFlowProjectionResult => {
    let currentBalance = totalLiquidAssets;
    const timeline: CashFlowDay[] = [];
    let minBalance = currentBalance;
    let minBalanceDate = format(new Date(), "yyyy-MM-dd");
    let totalProjectedIncome = 0;
    let totalProjectedExpenses = 0;

    const now = new Date();

    for (let i = 0; i <= days; i++) {
      const dateObj = addDays(now, i);
      const dateStr = format(dateObj, "yyyy-MM-dd");
      const dayOfMonth = getDate(dateObj);
      const dayLabel = format(dateObj, "d MMM", { locale: es });

      let dayIncome = 0;
      let dayExpense = 0;
      const events: string[] = [];

      // 1. Estimated Recurring Income (Salary on 15th and 30th/last day)
      if (dayOfMonth === 15 || dayOfMonth === 30) {
        // Look for recurring salary in past transactions
        const salaryTx = allTransactions.find(
          (t) => t.type === "income" && t.categoryId === "cat-salario",
        );
        const estSalary = salaryTx ? salaryTx.amount / 2 : 1750;
        dayIncome += estSalary;
        events.push(`Ingreso estimado quincena: +${formatCurrency(estSalary)}`);
      }

      // 2. Scheduled Recurring Expenses
      recurringExpenses.forEach((exp) => {
        if (exp.dueDay === dayOfMonth) {
          const amtInBase = convertAmount(
            exp.amount,
            exp.currency || settings.currencyCode,
            settings.currencyCode,
          );
          dayExpense += amtInBase;
          events.push(`${exp.name}: -${formatCurrency(amtInBase)}`);
        }
      });

      // 3. Credit Card Payment Dues
      accounts.forEach((acc) => {
        if (acc.type === "credit" && acc.dueDay === dayOfMonth && acc.balance < 0) {
          const dueAmt = Math.abs(
            convertAmount(
              acc.balance,
              acc.currency || settings.currencyCode,
              settings.currencyCode,
            ),
          );
          dayExpense += dueAmt;
          events.push(`Pago Tarjeta ${acc.name}: -${formatCurrency(dueAmt)}`);
        }
      });

      // 4. Pending Debts receivable or payable on due date
      debtsLoans.forEach((debt) => {
        if (debt.status === "pending" && debt.dueDate === dateStr) {
          const amtInBase = convertAmount(
            debt.amount,
            debt.currency || settings.currencyCode,
            settings.currencyCode,
          );
          if (debt.type === "lent") {
            dayIncome += amtInBase;
            events.push(`Cobro previsto (${debt.personName}): +${formatCurrency(amtInBase)}`);
          } else {
            dayExpense += amtInBase;
            events.push(`Vencimiento deuda (${debt.personName}): -${formatCurrency(amtInBase)}`);
          }
        }
      });

      currentBalance += dayIncome - dayExpense;
      totalProjectedIncome += dayIncome;
      totalProjectedExpenses += dayExpense;

      if (currentBalance < minBalance) {
        minBalance = currentBalance;
        minBalanceDate = dateStr;
      }

      timeline.push({
        date: dateStr,
        dayLabel,
        balance: Number(currentBalance.toFixed(2)),
        income: dayIncome,
        expenses: dayExpense,
        events,
      });
    }

    return {
      timeline,
      startingBalance: totalLiquidAssets,
      finalBalance: currentBalance,
      minBalance,
      minBalanceDate,
      isAlert: minBalance < 200,
      totalProjectedIncome,
      totalProjectedExpenses,
    };
  };

  // Debt Strategy Simulator (Snowball vs Avalanche)
  const calculateDebtStrategy = (
    extraMonthlyPayment: number = 150,
  ): DebtStrategyResult => {
    // Gather all borrowed debts and credit card deficits
    interface RawDebt {
      id: string;
      name: string;
      balance: number;
      rate: number;
      minPay: number;
    }

    const debtList: RawDebt[] = [];

    debtsLoans.forEach((d) => {
      if (d.status === "pending" && d.type === "borrowed") {
        const amt = convertAmount(
          d.amount,
          d.currency || settings.currencyCode,
          settings.currencyCode,
        );
        debtList.push({
          id: d.id,
          name: d.personName,
          balance: amt,
          rate: d.interestRate || 0,
          minPay: d.minimumPayment || Math.max(30, Math.round(amt * 0.05)),
        });
      }
    });

    accounts.forEach((acc) => {
      if (acc.type === "credit" && acc.balance < 0) {
        const amt = Math.abs(
          convertAmount(
            acc.balance,
            acc.currency || settings.currencyCode,
            settings.currencyCode,
          ),
        );
        debtList.push({
          id: acc.id,
          name: `Tarjeta ${acc.name}`,
          balance: amt,
          rate: acc.apr || 38.5,
          minPay: Math.max(50, Math.round(amt * 0.05)),
        });
      }
    });

    if (debtList.length === 0) {
      return {
        snowball: { months: 0, totalInterest: 0, payoffDate: "Al día", plan: [] },
        avalanche: { months: 0, totalInterest: 0, payoffDate: "Al día", plan: [] },
        interestSaved: 0,
        monthsSaved: 0,
      };
    }

    // Simulation Engine
    const simulate = (sortBy: "balance" | "rate") => {
      const debts = debtList.map((d) => ({ ...d }));
      if (sortBy === "balance") {
        debts.sort((a, b) => a.balance - b.balance); // Bola de Nieve: Menor saldo primero
      } else {
        debts.sort((a, b) => b.rate - a.rate); // Avalancha: Mayor interés primero
      }

      let months = 0;
      let totalInterest = 0;
      const plan: DebtPlanItem[] = [];
      const payoffOrder: string[] = [];

      let remainingDebts = [...debts];

      while (remainingDebts.length > 0 && months < 120) {
        months++;
        let availableExtra = extraMonthlyPayment;

        // Apply interest first
        remainingDebts.forEach((d) => {
          const monthlyRate = d.rate / 100 / 12;
          const interest = d.balance * monthlyRate;
          totalInterest += interest;
          d.balance += interest;
        });

        // Pay minimums on all
        remainingDebts.forEach((d) => {
          const pay = Math.min(d.balance, d.minPay);
          d.balance -= pay;
        });

        // Apply extra + freed payments to target (first in sorted list)
        for (let i = 0; i < remainingDebts.length; i++) {
          if (availableExtra <= 0) break;
          const target = remainingDebts[i];
          const payExtra = Math.min(target.balance, availableExtra);
          target.balance -= payExtra;
          availableExtra -= payExtra;
        }

        // Check for paid off debts
        const stillUnpaid: typeof debts = [];
        remainingDebts.forEach((d) => {
          if (d.balance <= 0.5) {
            payoffOrder.push(d.name);
            plan.push({
              id: d.id,
              personName: d.name,
              amount: debts.find((od) => od.id === d.id)?.balance || 0,
              interestRate: d.rate,
              minimumPayment: d.minPay,
              order: plan.length + 1,
              monthsToPay: months,
              totalInterestPaid: 0,
            });
          } else {
            stillUnpaid.push(d);
          }
        });
        remainingDebts = stillUnpaid;
      }

      const futureDate = addDays(new Date(), months * 30);
      const payoffDate = format(futureDate, "MMMM yyyy", { locale: es });

      return {
        months,
        totalInterest: Number(totalInterest.toFixed(2)),
        payoffDate: payoffDate.charAt(0).toUpperCase() + payoffDate.slice(1),
        plan,
      };
    };

    const snowball = simulate("balance");
    const avalanche = simulate("rate");

    return {
      snowball,
      avalanche,
      interestSaved: Math.max(0, snowball.totalInterest - avalanche.totalInterest),
      monthsSaved: Math.max(0, snowball.months - avalanche.months),
    };
  };

  // General Settings & Export
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save settings", e);
    }
    if (user) {
      supabaseService.saveSettings(user.id, updated).catch((err) =>
        console.error("Error saving settings to Supabase:", err)
      );
    }
  };

  const resetToDefaultData = () => {
    setAllTransactions(INITIAL_TRANSACTIONS);
    setSettings(DEFAULT_SETTINGS);
    setCategories(DEFAULT_CATEGORIES);
    setAccounts(DEFAULT_ACCOUNTS);
    setGoals(DEFAULT_GOALS);
    setChallenges(DEFAULT_CHALLENGES);
    setRecurringExpenses(DEFAULT_RECURRING);
    setDebtsLoans(DEFAULT_DEBTS);
    try {
      localStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(INITIAL_TRANSACTIONS),
      );
      localStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(DEFAULT_SETTINGS),
      );
      localStorage.setItem(
        STORAGE_KEYS.CATEGORIES,
        JSON.stringify(DEFAULT_CATEGORIES),
      );
      localStorage.setItem(
        STORAGE_KEYS.ACCOUNTS,
        JSON.stringify(DEFAULT_ACCOUNTS),
      );
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEFAULT_GOALS));
      localStorage.setItem(
        STORAGE_KEYS.CHALLENGES,
        JSON.stringify(DEFAULT_CHALLENGES),
      );
      localStorage.setItem(
        STORAGE_KEYS.RECURRING,
        JSON.stringify(DEFAULT_RECURRING),
      );
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(DEFAULT_DEBTS));
    } catch (e) {
      console.error("Failed to reset localStorage", e);
    }
  };

  const clearAllData = async () => {
    setAllTransactions([]);
    setAccounts([]);
    setGoals([]);
    setChallenges([]);
    setRecurringExpenses([]);
    setDebtsLoans([]);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify([]));
    } catch (e) {
      console.error("Failed to clear local data", e);
    }

    if (user && supabase) {
      try {
        await Promise.all([
          supabase.from("transactions").delete().eq("user_id", user.id),
          supabase.from("recurring_expenses").delete().eq("user_id", user.id),
          supabase.from("debts_loans").delete().eq("user_id", user.id),
          supabase.from("savings_goals").delete().eq("user_id", user.id),
          supabase.from("savings_challenges").delete().eq("user_id", user.id),
          supabase.from("accounts").delete().eq("user_id", user.id),
        ]);
      } catch (err) {
        console.error("Error clearing Supabase data:", err);
      }
    }
  };

  const exportToCSV = () => {
    if (allTransactions.length === 0) return;
    const headers = [
      "ID",
      "Tipo",
      "Concepto",
      "Monto",
      "Moneda",
      "Categoría",
      "Método de Pago",
      "Cuenta",
      "Fecha",
      "Notas",
    ];
    const rows = allTransactions.map((tx) => {
      const cat =
        categories.find((c) => c.id === tx.categoryId)?.name || "General";
      const acc =
        accounts.find((a) => a.id === tx.accountId)?.name ||
        "Sin cuenta asignada";
      return [
        tx.id,
        tx.type === "expense" ? "Gasto" : "Ingreso",
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount,
        tx.currency || settings.currencyCode,
        `"${cat}"`,
        tx.paymentMethod,
        `"${acc}"`,
        tx.date,
        `"${(tx.notes || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `gastos_export_${format(new Date(), "yyyy-MM-dd")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const data = {
      version: "3.0",
      exportedAt: new Date().toISOString(),
      settings,
      transactions: allTransactions,
      categories,
      accounts,
      goals,
      challenges,
      recurringExpenses,
      debtsLoans,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gastos_backup_${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importFromJSON = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed && Array.isArray(parsed.transactions)) {
        setAllTransactions(parsed.transactions);
        localStorage.setItem(
          STORAGE_KEYS.TRANSACTIONS,
          JSON.stringify(parsed.transactions),
        );
        if (parsed.settings) {
          setSettings(parsed.settings);
          localStorage.setItem(
            STORAGE_KEYS.SETTINGS,
            JSON.stringify(parsed.settings),
          );
        }
        if (parsed.categories && Array.isArray(parsed.categories)) {
          setCategories(parsed.categories);
          localStorage.setItem(
            STORAGE_KEYS.CATEGORIES,
            JSON.stringify(parsed.categories),
          );
        }
        if (parsed.accounts && Array.isArray(parsed.accounts)) {
          setAccounts(parsed.accounts);
          localStorage.setItem(
            STORAGE_KEYS.ACCOUNTS,
            JSON.stringify(parsed.accounts),
          );
        }
        if (parsed.goals && Array.isArray(parsed.goals)) {
          setGoals(parsed.goals);
          localStorage.setItem(
            STORAGE_KEYS.GOALS,
            JSON.stringify(parsed.goals),
          );
        }
        if (parsed.challenges && Array.isArray(parsed.challenges)) {
          setChallenges(parsed.challenges);
          localStorage.setItem(
            STORAGE_KEYS.CHALLENGES,
            JSON.stringify(parsed.challenges),
          );
        }
        if (
          parsed.recurringExpenses &&
          Array.isArray(parsed.recurringExpenses)
        ) {
          setRecurringExpenses(parsed.recurringExpenses);
          localStorage.setItem(
            STORAGE_KEYS.RECURRING,
            JSON.stringify(parsed.recurringExpenses),
          );
        }
        if (parsed.debtsLoans && Array.isArray(parsed.debtsLoans)) {
          setDebtsLoans(parsed.debtsLoans);
          localStorage.setItem(
            STORAGE_KEYS.DEBTS,
            JSON.stringify(parsed.debtsLoans),
          );
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Base metrics for selectedMonth
  const {
    totalIncome,
    totalExpenses,
    netBalance,
    savingsRate,
    budgetUsagePercent,
  } = useMemo(() => {
    let income = 0;
    let expenses = 0;

    transactions.forEach((tx) => {
      const amtInBase = convertAmount(
        tx.amount,
        tx.currency || settings.currencyCode,
        settings.currencyCode,
      );
      if (tx.type === "income") {
        income += amtInBase;
      } else {
        expenses += amtInBase;
      }
    });

    const balance = income - expenses;
    const rate =
      income > 0
        ? Math.max(0, Math.round(((income - expenses) / income) * 100))
        : 0;
    const usage =
      settings.monthlyBudget > 0
        ? Math.round((expenses / settings.monthlyBudget) * 100)
        : 0;

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: balance,
      savingsRate: rate,
      budgetUsagePercent: usage,
    };
  }, [transactions, settings.monthlyBudget, settings.currencyCode]);

  // Category breakdown for expenses
  const categoryBreakdown = useMemo(() => {
    const expenseTx = transactions.filter((t) => t.type === "expense");
    const totalExp = expenseTx.reduce(
      (acc, curr) =>
        acc +
        convertAmount(
          curr.amount,
          curr.currency || settings.currencyCode,
          settings.currencyCode,
        ),
      0,
    );
    const map = new Map<string, { amount: number; count: number }>();

    expenseTx.forEach((tx) => {
      const current = map.get(tx.categoryId) || { amount: 0, count: 0 };
      const amtInBase = convertAmount(
        tx.amount,
        tx.currency || settings.currencyCode,
        settings.currencyCode,
      );
      map.set(tx.categoryId, {
        amount: current.amount + amtInBase,
        count: current.count + 1,
      });
    });

    const list = Array.from(map.entries()).map(([catId, data]) => {
      const category = categories.find((c) => c.id === catId) || {
        id: catId,
        name: "Sin Categoría",
        icon: "HelpCircle",
        color: "#94a3b8",
        type: "expense" as TransactionType,
      };
      const percentage =
        totalExp > 0 ? Math.round((data.amount / totalExp) * 100) : 0;
      return {
        category,
        amount: data.amount,
        percentage,
        count: data.count,
      };
    });

    return list.sort((a, b) => b.amount - a.amount);
  }, [transactions, categories, settings.currencyCode]);

  // Monthly trend for the past 6 months
  const monthlyExpenseTrend = useMemo(() => {
    const monthsMap: Record<string, { expenses: number; income: number }> = {};
    const formatMonthKey = (date: Date) => {
      const str = format(date, "MMM", { locale: es });
      return str.charAt(0).toUpperCase() + str.slice(1).replace(".", "");
    };

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const key = formatMonthKey(d);
      monthsMap[key] = { expenses: 0, income: 0 };
    }

    allTransactions.forEach((tx) => {
      if (!tx.date) return;
      try {
        const d = parseISO(tx.date + "T00:00:00");
        const key = formatMonthKey(d);
        if (monthsMap[key]) {
          const amtInBase = convertAmount(
            tx.amount,
            tx.currency || settings.currencyCode,
            settings.currencyCode,
          );
          if (tx.type === "expense") {
            monthsMap[key].expenses += amtInBase;
          } else {
            monthsMap[key].income += amtInBase;
          }
        }
      } catch {
        // ignore invalid dates
      }
    });

    return Object.entries(monthsMap).map(([month, data]) => ({
      month,
      expenses: data.expenses,
      income: data.income,
    }));
  }, [allTransactions, settings.currencyCode]);

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
        convertAmount,
        formatCurrency,
        currencyBreakdown,
        creditCardsSummary,
        activeInstallments,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        withdrawFromGoal,
        totalSavedInGoals,
        totalTargetGoals,
        challenges,
        addChallenge,
        updateChallenge,
        deleteChallenge,
        toggleChallengeStep,
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
        phantomExpensesSummary,
        getCashFlowProjection,
        calculateDebtStrategy,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateSettings,
        resetToDefaultData,
        clearAllData,
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
        user,
        isAuthModalOpen,
        setIsAuthModalOpen,
        signOut,
        isCloudSyncing,
        syncLocalDataToCloud,
        isDemoMode,
        enableDemoMode,
        exitDemoMode,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};
