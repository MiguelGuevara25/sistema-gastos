export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 
  | 'efectivo'
  | 'tarjeta_debito'
  | 'tarjeta_credito'
  | 'transferencia'
  | 'otro';

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
  notes?: string;
  createdAt: string;
}

export interface UserSettings {
  currency: string;
  currencyCode: string;
  monthlyBudget: number;
  theme: 'dark' | 'light';
  userName: string;
}

export type ActiveTab = 'dashboard' | 'transactions' | 'budgets' | 'analytics' | 'settings';
