'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType, PaymentMethod } from '../../types/finance';
import { CategoryIcon } from '../ui/CategoryIcon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowDownRight, ArrowUpRight, Check, Calendar, CreditCard, Tag, FileText, Wallet } from 'lucide-react';
import { PAYMENT_METHOD_LABELS } from '../../data/categories';
import { format } from 'date-fns';

interface TransactionFormData {
  type: TransactionType;
  amount: number | string;
  description: string;
  categoryId: string;
  date: string;
  paymentMethod: PaymentMethod;
  accountId: string;
  notes: string;
}

export const TransactionModal: React.FC = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    editingTransaction,
    setEditingTransaction,
    addTransaction,
    updateTransaction,
    categories,
    settings,
    accounts,
    formatCurrency,
  } = useFinance();

  const defaultExpCat = useMemo(
    () => categories.find((c) => c.type === 'expense'),
    [categories]
  );

  const defaultValues: TransactionFormData = useMemo(
    () => ({
      type: 'expense',
      amount: '',
      description: '',
      categoryId: defaultExpCat?.id || '',
      date: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'tarjeta_debito',
      accountId: accounts[0]?.id || '',
      notes: '',
    }),
    [defaultExpCat, accounts]
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    values: editingTransaction
      ? {
          type: editingTransaction.type,
          amount: editingTransaction.amount,
          description: editingTransaction.description,
          categoryId: editingTransaction.categoryId,
          date: editingTransaction.date,
          paymentMethod: editingTransaction.paymentMethod,
          accountId: editingTransaction.accountId || '',
          notes: editingTransaction.notes || '',
        }
      : defaultValues,
  });

  const currentType = watch('type');
  const currentCategoryId = watch('categoryId');

  const handleTypeChange = (newType: TransactionType) => {
    setValue('type', newType);
    const available = categories.filter((c) => c.type === newType);
    if (!available.some((c) => c.id === currentCategoryId)) {
      setValue('categoryId', available[0]?.id || '');
    }
  };

  const handleClose = () => {
    reset(defaultValues);
    setIsAddModalOpen(false);
    setEditingTransaction(null);
  };

  const onSubmit = (data: TransactionFormData) => {
    const numAmount = parseFloat(String(data.amount));
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type: data.type,
        amount: numAmount,
        description: data.description.trim(),
        categoryId: data.categoryId,
        date: data.date,
        paymentMethod: data.paymentMethod,
        accountId: data.accountId || undefined,
        notes: data.notes?.trim() || undefined,
      });
    } else {
      addTransaction({
        type: data.type,
        amount: numAmount,
        description: data.description.trim(),
        categoryId: data.categoryId,
        date: data.date,
        paymentMethod: data.paymentMethod,
        accountId: data.accountId || undefined,
        notes: data.notes?.trim() || undefined,
      });
    }

    handleClose();
  };

  const filteredCategories = categories.filter((c) => c.type === currentType);

  return (
    <Dialog open={isAddModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[95vw] sm:max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-6 gap-4 sm:gap-5 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold">
            {editingTransaction ? 'Editar Movimiento' : 'Nuevo Movimiento'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Registra tus finanzas para mantener el control de tus gastos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type Selector (Gasto / Ingreso Tabs) */}
          <div className="grid grid-cols-2 p-1 bg-muted rounded-xl gap-1">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentType === 'expense'
                  ? 'bg-background text-rose-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ArrowDownRight className="size-4" />
              Gasto
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentType === 'income'
                  ? 'bg-background text-emerald-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ArrowUpRight className="size-4" />
              Ingreso
            </button>
          </div>

          {/* Amount Input with Currency */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Monto</Label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xl font-semibold text-muted-foreground select-none">
                {settings.currency}
              </span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                autoFocus
                {...register('amount', {
                  required: 'El monto es obligatorio',
                  min: { value: 0.01, message: 'El monto debe ser mayor a 0' },
                })}
                className="pl-12 h-12 text-2xl font-bold bg-muted/40 border-input"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Concept / Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Concepto / Descripción</Label>
            <Input
              type="text"
              placeholder={currentType === 'expense' ? 'Ej. Almuerzo, Uber, Factura de luz' : 'Ej. Sueldo, Venta freelance'}
              {...register('description', { required: 'La descripción es obligatoria' })}
              className="h-10 bg-muted/40"
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Category Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Tag className="size-3.5" />
              Categoría
            </Label>
            <input type="hidden" {...register('categoryId', { required: 'Selecciona una categoría' })} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 max-h-36 overflow-y-auto p-1.5 border border-border rounded-xl bg-muted/20">
              {filteredCategories.map((cat) => {
                const isSelected = currentCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setValue('categoryId', cat.id, { shouldValidate: true })}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-accent border-border text-foreground shadow-xs font-semibold'
                        : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <CategoryIcon name={cat.icon} color={cat.color} size={13} />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
            {errors.categoryId && (
              <p className="text-xs text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Date, Payment Method & Wallet / Account */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Fecha
              </Label>
              <Input
                type="date"
                {...register('date', { required: true })}
                className="h-10 bg-muted/40 scheme-dark"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="size-3.5" />
                Método de Pago
              </Label>
              <select
                {...register('paymentMethod')}
                className="w-full h-10 px-3 bg-muted/40 border border-input rounded-lg text-xs text-foreground focus:outline-hidden focus:border-ring cursor-pointer"
              >
                {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                  <option key={key} value={key} className="bg-popover text-popover-foreground">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Wallet className="size-3.5" />
                Cuenta / Billetera
              </Label>
              <select
                {...register('accountId')}
                className="w-full h-10 px-3 bg-muted/40 border border-input rounded-lg text-xs text-foreground focus:outline-hidden focus:border-ring cursor-pointer"
              >
                <option value="">-- Sin cuenta --</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-popover text-popover-foreground">
                    {acc.name} ({formatCurrency(acc.balance)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <FileText className="size-3.5" />
              Notas adicionales (opcional)
            </Label>
            <textarea
              rows={2}
              placeholder="Detalles adicionales o recordatorios..."
              {...register('notes')}
              className="w-full px-3 py-2 bg-muted/40 border border-input rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-ring transition-colors resize-none"
            />
          </div>

          {/* Dialog Footer Actions */}
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="cursor-pointer font-semibold gap-1.5"
            >
              <Check className="size-4" />
              {editingTransaction ? 'Guardar Cambios' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
