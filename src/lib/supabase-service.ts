import { supabase } from "./supabase";
import {
  Transaction,
  Account,
  RecurringExpense,
  DebtLoan,
  SavingsGoal,
  SavingsChallenge,
  UserSettings,
  Category,
} from "../types/finance";

// ==========================================
// MAPPERS: TypeScript <-> PostgreSQL
// ==========================================

export const mapAccountFromDB = (row: any): Account => ({
  id: row.id,
  name: row.name,
  type: row.type,
  balance: Number(row.balance) || 0,
  color: row.color || "#3b82f6",
  icon: row.icon || "Wallet",
  accountNumber: row.account_number || undefined,
  currency: row.currency || "PEN",
  creditLimit: row.credit_limit ? Number(row.credit_limit) : undefined,
  closingDay: row.closing_day || undefined,
  dueDay: row.due_day || undefined,
  apr: row.apr ? Number(row.apr) : undefined,
});

export const mapAccountToDB = (userId: string, acc: Partial<Account>) => ({
  ...(acc.id ? { id: acc.id } : {}),
  user_id: userId,
  name: acc.name,
  type: acc.type,
  balance: acc.balance,
  color: acc.color,
  icon: acc.icon,
  account_number: acc.accountNumber,
  currency: acc.currency || "PEN",
  credit_limit: acc.creditLimit,
  closing_day: acc.closingDay,
  due_day: acc.dueDay,
  apr: acc.apr,
});

export const mapTransactionFromDB = (row: any): Transaction => ({
  id: row.id,
  description: row.description,
  amount: Number(row.amount) || 0,
  type: row.type,
  categoryId: row.category_id,
  date: row.date,
  paymentMethod: row.payment_method,
  accountId: row.account_id || undefined,
  currency: row.currency || "PEN",
  exchangeRate: row.exchange_rate ? Number(row.exchange_rate) : 1,
  installments: row.installments || undefined,
  tags: row.tags || [],
  notes: row.notes || undefined,
  createdAt: row.created_at,
});

export const mapTransactionToDB = (userId: string, tx: Transaction) => ({
  id: tx.id,
  user_id: userId,
  description: tx.description,
  amount: tx.amount,
  type: tx.type,
  category_id: tx.categoryId,
  date: tx.date,
  payment_method: tx.paymentMethod,
  account_id: tx.accountId || null,
  currency: tx.currency || "PEN",
  exchange_rate: tx.exchangeRate || 1.0,
  installments: tx.installments || null,
  tags: tx.tags || [],
  notes: tx.notes || null,
});

export const mapRecurringFromDB = (row: any): RecurringExpense => ({
  id: row.id,
  name: row.name,
  amount: Number(row.amount) || 0,
  categoryId: row.category_id,
  paymentMethod: row.payment_method,
  accountId: row.account_id || undefined,
  currency: row.currency || "PEN",
  dueDay: row.due_day,
  frequency: row.frequency,
  lastPaidMonth: row.last_paid_month || undefined,
  notes: row.notes || undefined,
  createdAt: row.created_at,
});

export const mapRecurringToDB = (userId: string, rec: RecurringExpense) => ({
  id: rec.id,
  user_id: userId,
  name: rec.name,
  amount: rec.amount,
  category_id: rec.categoryId,
  payment_method: rec.paymentMethod,
  account_id: rec.accountId || null,
  currency: rec.currency || "PEN",
  due_day: rec.dueDay,
  frequency: rec.frequency,
  last_paid_month: rec.lastPaidMonth || null,
  notes: rec.notes || null,
});

export const mapDebtFromDB = (row: any): DebtLoan => ({
  id: row.id,
  type: row.type,
  personName: row.person_name,
  amount: Number(row.amount) || 0,
  dueDate: row.due_date || undefined,
  status: row.status,
  notes: row.notes || undefined,
  accountId: row.account_id || undefined,
  currency: row.currency || "PEN",
  interestRate: row.interest_rate ? Number(row.interest_rate) : 0,
  minimumPayment: row.minimum_payment ? Number(row.minimum_payment) : 0,
  settledDate: row.settled_date || undefined,
  createdAt: row.created_at,
});

export const mapDebtToDB = (userId: string, debt: DebtLoan) => ({
  id: debt.id,
  user_id: userId,
  type: debt.type,
  person_name: debt.personName,
  amount: debt.amount,
  due_date: debt.dueDate || null,
  status: debt.status,
  notes: debt.notes || null,
  account_id: debt.accountId || null,
  currency: debt.currency || "PEN",
  interest_rate: debt.interestRate || 0,
  minimum_payment: debt.minimumPayment || 0,
  settled_date: debt.settledDate || null,
});

export const mapGoalFromDB = (row: any): SavingsGoal => ({
  id: row.id,
  name: row.name,
  targetAmount: Number(row.target_amount) || 0,
  currentAmount: Number(row.current_amount) || 0,
  targetDate: row.deadline || undefined,
  color: row.color || "#10b981",
  category: row.category || undefined,
  icon: row.icon || "Target",
  currency: row.currency || "PEN",
  createdAt: row.created_at,
});

export const mapGoalToDB = (userId: string, goal: SavingsGoal) => ({
  id: goal.id,
  user_id: userId,
  name: goal.name,
  target_amount: goal.targetAmount,
  current_amount: goal.currentAmount,
  deadline: goal.targetDate || null,
  color: goal.color || "#10b981",
  category: goal.category || null,
  icon: goal.icon || "Target",
  currency: goal.currency || "PEN",
});

export const mapChallengeFromDB = (row: any): SavingsChallenge => ({
  id: row.id,
  title: row.title,
  description: row.description || "",
  type: row.type,
  targetAmount: Number(row.target_amount) || 0,
  currentAmount: Number(row.current_amount) || 0,
  startDate: row.start_date,
  durationUnits: row.duration_units,
  unitType: row.unit_type,
  completedSteps: row.completed_steps || [],
  status: row.status,
  badgeIcon: row.badge_icon || "Trophy",
  rewardBadge: row.reward_badge || "Medalla",
  currency: row.currency || "PEN",
  createdAt: row.created_at,
});

export const mapChallengeToDB = (userId: string, chal: SavingsChallenge) => ({
  id: chal.id,
  user_id: userId,
  title: chal.title,
  description: chal.description,
  type: chal.type,
  target_amount: chal.targetAmount,
  current_amount: chal.currentAmount,
  start_date: chal.startDate,
  duration_units: chal.durationUnits,
  unit_type: chal.unitType,
  completed_steps: chal.completedSteps,
  status: chal.status,
  badge_icon: chal.badgeIcon,
  reward_badge: chal.rewardBadge,
  currency: chal.currency || "PEN",
});

export const mapSettingsFromDB = (row: any): UserSettings => ({
  userName: row.user_name || "Usuario",
  currency: row.currency || "S/.",
  currencyCode: row.currency_code || "PEN",
  monthlyBudget: Number(row.monthly_budget) || 2500,
  theme: row.theme || "dark",
  exchangeRates: row.exchange_rates || { USD: 3.75, EUR: 4.05, PEN: 1.0 },
  phantomExpenseThreshold: Number(row.phantom_expense_threshold) || 20,
});

export const mapSettingsToDB = (userId: string, s: UserSettings) => ({
  user_id: userId,
  user_name: s.userName,
  currency: s.currency,
  currency_code: s.currencyCode,
  monthly_budget: s.monthlyBudget,
  theme: s.theme,
  exchange_rates: s.exchangeRates,
  phantom_expense_threshold: s.phantomExpenseThreshold,
});

// ==========================================
// SUPABASE DATABASE OPERATIONS
// ==========================================

export const supabaseService = {
  // Fetch all user finance data in parallel
  async fetchAllUserData(userId: string) {
    if (!supabase) return null;

    const [
      accRes,
      txRes,
      recRes,
      debRes,
      goalRes,
      chalRes,
      setRes,
      catRes,
    ] = await Promise.all([
      supabase.from("accounts").select("*").eq("user_id", userId),
      supabase.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false }),
      supabase.from("recurring_expenses").select("*").eq("user_id", userId),
      supabase.from("debts_loans").select("*").eq("user_id", userId),
      supabase.from("savings_goals").select("*").eq("user_id", userId),
      supabase.from("savings_challenges").select("*").eq("user_id", userId),
      supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("categories").select("*"),
    ]);

    const accounts = (accRes.data || []).map(mapAccountFromDB);
    const transactions = (txRes.data || []).map(mapTransactionFromDB);
    const recurring = (recRes.data || []).map(mapRecurringFromDB);
    const debts = (debRes.data || []).map(mapDebtFromDB);
    const goals = (goalRes.data || []).map(mapGoalFromDB);
    const challenges = (chalRes.data || []).map(mapChallengeFromDB);
    const settings = setRes.data ? mapSettingsFromDB(setRes.data) : null;
    const categories: Category[] = (catRes.data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      type: c.type,
    }));

    return {
      accounts,
      transactions,
      recurring,
      debts,
      goals,
      challenges,
      settings,
      categories,
    };
  },

  // Save / Update Settings
  async saveSettings(userId: string, s: UserSettings) {
    if (!supabase) return;
    await supabase.from("user_settings").upsert(mapSettingsToDB(userId, s));
  },

  // Transactions
  async insertTransaction(userId: string, tx: Transaction) {
    if (!supabase) return;
    await supabase.from("transactions").upsert(mapTransactionToDB(userId, tx));
  },

  async deleteTransaction(txId: string) {
    if (!supabase) return;
    await supabase.from("transactions").delete().eq("id", txId);
  },

  // Accounts
  async upsertAccount(userId: string, acc: Account) {
    if (!supabase) return;
    await supabase.from("accounts").upsert(mapAccountToDB(userId, acc));
  },

  async deleteAccount(accId: string) {
    if (!supabase) return;
    await supabase.from("accounts").delete().eq("id", accId);
  },

  // Debts
  async upsertDebt(userId: string, debt: DebtLoan) {
    if (!supabase) return;
    await supabase.from("debts_loans").upsert(mapDebtToDB(userId, debt));
  },

  async deleteDebt(debtId: string) {
    if (!supabase) return;
    await supabase.from("debts_loans").delete().eq("id", debtId);
  },

  // Goals
  async upsertGoal(userId: string, goal: SavingsGoal) {
    if (!supabase) return;
    await supabase.from("savings_goals").upsert(mapGoalToDB(userId, goal));
  },

  async deleteGoal(goalId: string) {
    if (!supabase) return;
    await supabase.from("savings_goals").delete().eq("id", goalId);
  },

  // Recurring
  async upsertRecurring(userId: string, rec: RecurringExpense) {
    if (!supabase) return;
    await supabase.from("recurring_expenses").upsert(mapRecurringToDB(userId, rec));
  },

  async deleteRecurring(recId: string) {
    if (!supabase) return;
    await supabase.from("recurring_expenses").delete().eq("id", recId);
  },

  // Challenges
  async upsertChallenge(userId: string, chal: SavingsChallenge) {
    if (!supabase) return;
    await supabase.from("savings_challenges").upsert(mapChallengeToDB(userId, chal));
  },

  async deleteChallenge(chalId: string) {
    if (!supabase) return;
    await supabase.from("savings_challenges").delete().eq("id", chalId);
  },

  // Migrate entire local data to Supabase in batch
  async migrateLocalDataToCloud(
    userId: string,
    data: {
      accounts: Account[];
      transactions: Transaction[];
      recurring: RecurringExpense[];
      debts: DebtLoan[];
      goals: SavingsGoal[];
      challenges: SavingsChallenge[];
      settings: UserSettings;
    }
  ) {
    if (!supabase) return;

    // Settings
    await supabase.from("user_settings").upsert(mapSettingsToDB(userId, data.settings));

    // Accounts
    if (data.accounts.length > 0) {
      await supabase.from("accounts").upsert(data.accounts.map((a) => mapAccountToDB(userId, a)));
    }

    // Transactions
    if (data.transactions.length > 0) {
      await supabase.from("transactions").upsert(data.transactions.map((t) => mapTransactionToDB(userId, t)));
    }

    // Recurring
    if (data.recurring.length > 0) {
      await supabase.from("recurring_expenses").upsert(data.recurring.map((r) => mapRecurringToDB(userId, r)));
    }

    // Debts
    if (data.debts.length > 0) {
      await supabase.from("debts_loans").upsert(data.debts.map((d) => mapDebtToDB(userId, d)));
    }

    // Goals
    if (data.goals.length > 0) {
      await supabase.from("savings_goals").upsert(data.goals.map((g) => mapGoalToDB(userId, g)));
    }

    // Challenges
    if (data.challenges.length > 0) {
      await supabase.from("savings_challenges").upsert(data.challenges.map((c) => mapChallengeToDB(userId, c)));
    }
  },
};
