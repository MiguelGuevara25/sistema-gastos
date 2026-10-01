export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 
  | 'efectivo'
  | 'tarjeta_debito'
  | 'tarjeta_credito'
  | 'transferencia'
  | 'otro';

export type AccountType = 'bank' | 'wallet' | 'cash' | 'credit' | 'savings';

export interface Account {
  id: string;
  name: string; // ej: 'Yape', 'Plin', 'BCP Débito', 'Interbank', 'Efectivo', 'Tarjeta Crédito'
  type: AccountType;
  balance: number;
  color: string;
  icon?: string;
  accountNumber?: string;
}

export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string; // ej. "Fondo de Emergencia", "Viaje a Cusco", "Nueva Laptop"
  targetAmount: number;
  currentAmount: number;
  targetDate?: string; // YYYY-MM-DD
  color: string;
  category?: string;
  icon?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  accountId?: string; // Billetera o cuenta asociada
  notes?: string;
  createdAt: string;
}

export interface RecurringExpense {
  id: string;
  name: string; // ej: "Alquiler", "Internet", "Luz", "Netflix", "Gimnasio"
  amount: number;
  categoryId: string;
  paymentMethod: PaymentMethod;
  accountId?: string;
  dueDay: number; // Día del mes (1 - 31)
  frequency: 'monthly' | 'yearly';
  lastPaidMonth?: string; // e.g. "2026-09" o "2026-10"
  notes?: string;
  createdAt: string;
}

export interface DebtLoan {
  id: string;
  type: 'lent' | 'borrowed'; // 'lent' = presté (me deben) | 'borrowed' = me prestaron (debo)
  personName: string;
  amount: number;
  dueDate?: string; // YYYY-MM-DD
  status: 'pending' | 'settled';
  notes?: string;
  accountId?: string;
  settledDate?: string;
  createdAt: string;
}

export interface UserSettings {
  currency: string;
  currencyCode: string;
  monthlyBudget: number;
  theme: 'dark' | 'light';
  userName: string;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'transactions' 
  | 'wallets' 
  | 'recurring'
  | 'debts'
  | 'budgets' 
  | 'goals' 
  | 'analytics' 
  | 'advisor' 
  | 'settings';
