export type TransactionType = "expense" | "income";

export type PaymentMethod =
  | "efectivo"
  | "tarjeta_debito"
  | "tarjeta_credito"
  | "transferencia"
  | "otro";

export type AccountType = "bank" | "wallet" | "cash" | "credit" | "savings";

export interface Account {
  id: string;
  name: string; // ej: 'Yape', 'Plin', 'BCP Débito', 'Interbank Dólares', 'Efectivo', 'Tarjeta Crédito'
  type: AccountType;
  balance: number;
  color: string;
  icon?: string;
  accountNumber?: string;
  currency?: string; // "PEN" | "USD" | "EUR"
  // Credit Card features
  creditLimit?: number; // Límite de crédito disponible
  closingDay?: number; // Día de corte de facturación (1 - 31)
  dueDay?: number; // Día límite de pago (1 - 31)
  apr?: number; // Tasa de Interés Efectiva Anual (TEA / APR %)
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
  currency?: string;
}

export interface SavingsChallenge {
  id: string;
  title: string;
  description: string;
  type: "52_weeks" | "30_days_no_spend" | "target_sprint" | "custom";
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  durationUnits: number; // 52 semanas o 30 días
  unitType: "weeks" | "days";
  completedSteps: number[]; // Lista de índices completados (ej. [1, 2, 3...])
  status: "active" | "completed" | "paused";
  badgeIcon: string;
  rewardBadge: string;
  currency?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface InstallmentDetails {
  current: number; // Cuota actual (ej. 1)
  total: number; // Total de cuotas (ej. 6)
  originalAmount: number; // Monto total financiado
  monthlyAmount: number; // Monto de cada cuota
  parentId?: string; // ID de la transacción origen o agrupación
}

export interface SharedExpenseParticipant {
  id: string;
  name: string; // ej. "Carlos", "Ana", "Trabajo"
  amount: number; // Monto que debe esta persona
  settled: boolean; // true si ya devolvió el dinero
  settledDate?: string;
  settledAccountId?: string; // Billetera donde se recibió el reembolso
}

export interface SharedExpenseDetails {
  totalPaid: number; // Monto total pagado de tu cuenta (ej. 200)
  myShare: number; // Lo que realmente te correspondía gastar a ti (ej. 50)
  owedAmount: number; // Lo que te deben terceros (ej. 150)
  participants: SharedExpenseParticipant[];
  isFullySettled: boolean;
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
  toAccountId?: string; // Billetera de destino si es transferencia
  isTransfer?: boolean; // Flag para distinguir transferencias entre cuentas propias
  currency?: string; // "PEN" | "USD" | "EUR"
  exchangeRate?: number; // Tipo de cambio respecto a divisa base
  installments?: InstallmentDetails; // Detalles de compra en cuotas
  sharedDetails?: SharedExpenseDetails; // Detalles de cuenta compartida / reembolso
  tags?: string[]; // Etiquetas tipo #vacaciones, #trabajo
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
  currency?: string;
  dueDay: number; // Día del mes (1 - 31)
  frequency: "monthly" | "yearly";
  lastPaidMonth?: string; // e.g. "2026-09" o "2026-10"
  notes?: string;
  createdAt: string;
}

export interface DebtLoan {
  id: string;
  type: "lent" | "borrowed"; // 'lent' = presté (me deben) | 'borrowed' = me prestaron (debo)
  personName: string;
  amount: number;
  dueDate?: string; // YYYY-MM-DD
  status: "pending" | "settled";
  notes?: string;
  accountId?: string;
  currency?: string;
  // Debt Payoff Strategy features
  interestRate?: number; // Tasa de Interés Anual (APR %)
  minimumPayment?: number; // Pago mínimo mensual sugerido o requerido
  settledDate?: string;
  createdAt: string;
}

export interface UserSettings {
  currency: string; // "S/.", "$", "€"
  currencyCode: string; // "PEN", "USD", "EUR"
  monthlyBudget: number;
  theme: "dark" | "light";
  userName: string;
  exchangeRates: Record<string, number>; // e.g. { "USD": 3.75, "EUR": 4.05, "PEN": 1.0 }
  phantomExpenseThreshold: number; // Monto límite para considerar gasto hormiga (ej. 20)
  // Income settings for cashflow & advisor
  incomeFrequency?: "monthly" | "biweekly"; // "monthly" (mensual) o "biweekly" (quincenal)
  incomePayDay?: number; // Día del mes en que cobras (ej. 30 para fin de mes, 15, 1, etc.)
  monthlyIncome?: number; // Sueldo o ingreso mensual recurrente estimado (ej. 1300)
}

export type ActiveTab =
  | "dashboard"
  | "transactions"
  | "wallets"
  | "recurring"
  | "debts"
  | "cashflow"
  | "challenges"
  | "budgets"
  | "goals"
  | "analytics"
  | "advisor"
  | "settings";
