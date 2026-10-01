'use client';

import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { RecurringExpense, PaymentMethod } from '../../types/finance';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  CalendarClock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Receipt,
  Calendar,
  CreditCard,
  Wallet,
  Sparkles,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { PAYMENT_METHOD_LABELS } from '../../data/categories';

export const RecurringExpensesView: React.FC = () => {
  const {
    recurringExpenses,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    payRecurringExpense,
    totalRecurringMonthly,
    recurringPaidThisMonth,
    recurringPendingThisMonth,
    categories,
    accounts,
    selectedMonth,
    formatCurrency,
    transactions,
  } = useFinance();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);
  const [payingExpense, setPayingExpense] = useState<RecurringExpense | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dueDay, setDueDay] = useState('5');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tarjeta_debito');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');

  // Pay Form State
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payAccountId, setPayAccountId] = useState('');

  const currentMonthKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const activeMonthKey = selectedMonth === 'all' ? currentMonthKey : selectedMonth;

  // Percentage of fixed expenses paid this month
  const paidPercent =
    totalRecurringMonthly > 0
      ? Math.round((recurringPaidThisMonth / totalRecurringMonthly) * 100)
      : 0;

  // Helper to check if a recurring expense was paid in the active month
  const isExpensePaidThisMonth = (exp: RecurringExpense) => {
    if (exp.lastPaidMonth === activeMonthKey) return true;
    return transactions.some(
      (tx) =>
        tx.type === 'expense' &&
        tx.description.toLowerCase().trim() === exp.name.toLowerCase().trim()
    );
  };

  // Find next upcoming bill
  const nextUpcomingBill = useMemo(() => {
    const todayDay = new Date().getDate();
    const pendingBills = recurringExpenses.filter((e) => !isExpensePaidThisMonth(e));
    if (pendingBills.length === 0) return null;

    // Sort by proximity to current day
    const sorted = [...pendingBills].sort((a, b) => {
      const diffA = (a.dueDay - todayDay + 31) % 31;
      const diffB = (b.dueDay - todayDay + 31) % 31;
      return diffA - diffB;
    });

    return sorted[0];
  }, [recurringExpenses, transactions, activeMonthKey]);

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setName('');
    setAmount('');
    const expCat = categories.find((c) => c.type === 'expense');
    setCategoryId(expCat ? expCat.id : '');
    setDueDay('5');
    setPaymentMethod('tarjeta_debito');
    setAccountId(accounts[0]?.id || '');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (exp: RecurringExpense) => {
    setEditingExpense(exp);
    setName(exp.name);
    setAmount(exp.amount.toString());
    setCategoryId(exp.categoryId);
    setDueDay(exp.dueDay.toString());
    setPaymentMethod(exp.paymentMethod);
    setAccountId(exp.accountId || '');
    setNotes(exp.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    const day = parseInt(dueDay, 10);
    if (isNaN(amt) || amt <= 0 || !name.trim() || isNaN(day)) return;

    if (editingExpense) {
      updateRecurringExpense(editingExpense.id, {
        name: name.trim(),
        amount: amt,
        categoryId,
        dueDay: Math.max(1, Math.min(31, day)),
        paymentMethod,
        accountId: accountId || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addRecurringExpense({
        name: name.trim(),
        amount: amt,
        categoryId,
        dueDay: Math.max(1, Math.min(31, day)),
        paymentMethod,
        frequency: 'monthly',
        accountId: accountId || undefined,
        notes: notes.trim() || undefined,
      });
    }

    setIsAddModalOpen(false);
    setEditingExpense(null);
  };

  const handleOpenPayModal = (exp: RecurringExpense) => {
    setPayingExpense(exp);
    const [y, m] = activeMonthKey.split('-');
    const dayStr = String(exp.dueDay).padStart(2, '0');
    setPayDate(`${y}-${m}-${dayStr}`);
    setPayAccountId(exp.accountId || accounts[0]?.id || '');
  };

  const handleExecutePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingExpense) return;
    payRecurringExpense(payingExpense.id, payDate, payAccountId || undefined);
    setPayingExpense(null);
  };

  // Filtered list
  const filteredList = useMemo(() => {
    return recurringExpenses.filter((exp) => {
      const isPaid = isExpensePaidThisMonth(exp);
      if (statusFilter === 'pending') return !isPaid;
      if (statusFilter === 'paid') return isPaid;
      return true;
    });
  }, [recurringExpenses, statusFilter, transactions, activeMonthKey]);

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monthly Commitment */}
        <Card className="p-4 bg-muted/20 border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Gastos Fijos del Mes</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Receipt className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {formatCurrency(totalRecurringMonthly)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {recurringExpenses.length} servicios y obligaciones fijas
          </p>
        </Card>

        {/* Paid this month */}
        <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Ya Pagado Este Mes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            {formatCurrency(recurringPaidThisMonth)}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Progress value={paidPercent} className="h-1.5 w-16 bg-muted/60" />
            <span className="text-[11px] text-muted-foreground">{paidPercent}% cubierto</span>
          </div>
        </Card>

        {/* Pending this month */}
        <Card className="p-4 bg-muted/20 border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pendiente por Pagar</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">
            {formatCurrency(recurringPendingThisMonth)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Dinero que debes reservar este mes
          </p>
        </Card>

        {/* Next upcoming bill */}
        <Card className="p-4 bg-muted/20 border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Próximo Vencimiento</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <CalendarClock className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-base font-bold text-foreground truncate">
            {nextUpcomingBill ? nextUpcomingBill.name : '¡Todo al día! 🎉'}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {nextUpcomingBill
              ? `Vence el día ${nextUpcomingBill.dueDay} (${formatCurrency(nextUpcomingBill.amount)})`
              : 'Sin recibos pendientes este mes'}
          </p>
        </Card>
      </div>

      {/* Main Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {/* Status Tabs / Pills */}
          <div className="flex items-center bg-muted/40 p-1 rounded-lg border border-border text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Todos ({recurringExpenses.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-amber-500/20 text-amber-400 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                statusFilter === 'paid'
                  ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pagados
            </button>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleOpenAddModal}
          className="cursor-pointer gap-1.5 shadow-xs font-semibold h-9"
        >
          <Plus className="size-3.5" />
          Nuevo Gasto Fijo
        </Button>
      </div>

      {/* List of Recurring Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((exp) => {
          const isPaid = isExpensePaidThisMonth(exp);
          const category = categories.find((c) => c.id === exp.categoryId) || {
            name: 'General',
            icon: 'Receipt',
            color: '#94a3b8',
          };
          const account = accounts.find((a) => a.id === exp.accountId);

          return (
            <Card
              key={exp.id}
              className={`relative overflow-hidden border transition-all flex flex-col justify-between ${
                isPaid
                  ? 'border-emerald-500/20 bg-muted/10'
                  : 'border-border/70 hover:border-border'
              }`}
            >
              {/* Top Accent Strip */}
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: isPaid ? '#10b981' : category.color }}
              />

              <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Top line: icon, name and actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${category.color}20`,
                          color: category.color,
                          border: `1px solid ${category.color}40`,
                        }}
                      >
                        <CategoryIcon name={category.icon} color={category.color} size={18} />
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-foreground leading-tight">
                          {exp.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-muted-foreground">{category.name}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-[11px] text-muted-foreground">
                            Día {exp.dueDay} de cada mes
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditModal(exp)}
                        className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`¿Eliminar el gasto recurrente "${exp.name}"?`)) {
                            deleteRecurringExpense(exp.id);
                          }
                        }}
                        className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-rose-400"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Amount and Status Pill */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">Monto Fijo</span>
                      <div className="text-2xl font-black text-foreground">
                        {formatCurrency(exp.amount)}
                      </div>
                    </div>

                    <div>
                      {isPaid ? (
                        <Badge
                          variant="default"
                          className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 gap-1 text-xs"
                        >
                          <CheckCircle2 className="size-3" />
                          Pagado este mes
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-amber-500/10 text-amber-400 border border-amber-500/20 gap-1 text-xs"
                        >
                          <Clock className="size-3" />
                          Pendiente (Día {exp.dueDay})
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Account / Payment Method Info */}
                  <div className="mt-3 p-2.5 rounded-lg bg-muted/30 border border-border/50 text-[11px] flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="size-3" />
                      {PAYMENT_METHOD_LABELS[exp.paymentMethod] || exp.paymentMethod}
                    </span>
                    {account && (
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <Wallet className="size-3 text-primary" />
                        {account.name}
                      </span>
                    )}
                  </div>

                  {exp.notes && (
                    <p className="text-[11px] text-muted-foreground/80 italic mt-2">
                      "{exp.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Action: Pay or Confirmed */}
                <div className="pt-3 border-t border-border/50 mt-4">
                  {isPaid ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="w-full h-8 text-xs opacity-60 gap-1.5 text-emerald-400"
                    >
                      <CheckCircle2 className="size-3.5" />
                      Cubierto este mes
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleOpenPayModal(exp)}
                      className="w-full h-8 text-xs cursor-pointer font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
                    >
                      <Receipt className="size-3.5" />
                      Pagar / Registrar este mes
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Recurring Expense Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingExpense ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo / Servicio'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Registra pagos que se repiten cada mes (Alquiler, Luz, Internet, Netflix, etc.)
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveExpense} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nombre del Servicio o Gasto</Label>
              <Input
                type="text"
                placeholder="ej: Alquiler Departamento, Netflix, Claro..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Monto Mensual ({formatCurrency(0).split(' ')[0]})</Label>
                <Input
                  type="number"
                  step="0.10"
                  min="0.10"
                  placeholder="150.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Día de Pago (1 - 31)</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Categoría</Label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-9 rounded-md bg-muted/40 border border-input text-xs px-2.5 text-foreground focus:outline-none"
              >
                {categories
                  .filter((c) => c.type === 'expense')
                  .map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-popover text-popover-foreground">
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Método de Pago</Label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full h-9 rounded-md bg-muted/40 border border-input text-xs px-2.5 text-foreground focus:outline-none"
                >
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([k, label]) => (
                    <option key={k} value={k} className="bg-popover text-popover-foreground">
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Cuenta Habitual (Opcional)</Label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full h-9 rounded-md bg-muted/40 border border-input text-xs px-2.5 text-foreground focus:outline-none"
                >
                  <option value="">-- Sin cuenta asignada --</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} className="bg-popover text-popover-foreground">
                      {a.name} ({formatCurrency(a.balance)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Notas (Opcional)</Label>
              <Input
                type="text"
                placeholder="ej: Recibo vence el 15, plan de 200MB..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="cursor-pointer font-semibold">
                Guardar Gasto Fijo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Execute Payment Modal */}
      <Dialog
        open={Boolean(payingExpense)}
        onOpenChange={(open) => !open && setPayingExpense(null)}
      >
        <DialogContent className="w-[92vw] sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Receipt className="size-4 text-primary" />
              Pagar: {payingExpense?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Se creará un movimiento de {payingExpense ? formatCurrency(payingExpense.amount) : ''}{' '}
              en tu historial del mes
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleExecutePay} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Fecha del Pago</Label>
              <Input
                type="date"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Debitar de Cuenta / Billetera</Label>
              <select
                value={payAccountId}
                onChange={(e) => setPayAccountId(e.target.value)}
                className="w-full h-9 rounded-md bg-muted/40 border border-input text-xs px-2.5 text-foreground focus:outline-none"
              >
                <option value="">-- Sin debitar de cuenta --</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id} className="bg-popover text-popover-foreground">
                    {a.name} ({formatCurrency(a.balance)})
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPayingExpense(null)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="cursor-pointer font-semibold">
                Confirmar Pago
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
