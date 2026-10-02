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

export const DEFAULT_ACCOUNTS: Account[] = [];

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
};

export const INITIAL_TRANSACTIONS: Transaction[] = [];
