import {
  Transaction,
  UserSettings,
  Account,
  SavingsGoal,
  RecurringExpense,
  DebtLoan,
  SavingsChallenge,
} from "../types/finance";

export const DEFAULT_DEBTS: DebtLoan[] = [];

export const DEFAULT_RECURRING: RecurringExpense[] = [];

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    name: "Efectivo",
    type: "cash",
    balance: 0,
    color: "#10b981",
    icon: "Coins",
    currency: "PEN",
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    name: "BCP Débito",
    type: "bank",
    balance: 0,
    color: "#3b82f6",
    icon: "Landmark",
    accountNumber: "*4821",
    currency: "PEN",
  },
  {
    id: "a0000000-0000-4000-8000-000000000003",
    name: "Yape",
    type: "wallet",
    balance: 0,
    color: "#8b5cf6",
    icon: "Smartphone",
    currency: "PEN",
  },
  {
    id: "a0000000-0000-4000-8000-000000000004",
    name: "Tarjeta de Crédito",
    type: "credit",
    balance: 0,
    color: "#f59e0b",
    icon: "CreditCard",
    creditLimit: 3000,
    closingDay: 20,
    dueDay: 15,
    currency: "PEN",
  },
];

export const DEFAULT_GOALS: SavingsGoal[] = [];

export const DEFAULT_CHALLENGES: SavingsChallenge[] = [];

export const DEFAULT_SETTINGS: UserSettings = {
  currency: "S/.",
  currencyCode: "PEN",
  monthlyBudget: 0,
  theme: "dark",
  userName: "Usuario",
  exchangeRates: {
    PEN: 1.0,
    USD: 3.75, // 1 USD = 3.75 PEN
    EUR: 4.05, // 1 EUR = 4.05 PEN
  },
  phantomExpenseThreshold: 20,
  incomeFrequency: "monthly",
  incomePayDay: 30,
  monthlyIncome: 1300,
};

export const INITIAL_TRANSACTIONS: Transaction[] = [];
