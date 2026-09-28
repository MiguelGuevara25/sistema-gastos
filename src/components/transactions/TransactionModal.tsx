'use client';

import React, { useState, useEffect } from 'react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownRight, ArrowUpRight, Check, Calendar, CreditCard, Tag, FileText } from 'lucide-react';
import { PAYMENT_METHOD_LABELS } from '../../data/categories';

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
  } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tarjeta_debito');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setDescription(editingTransaction.description);
      setCategoryId(editingTransaction.categoryId);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes || '');
    } else {
      setType('expense');
      setAmount('');
      setDescription('');
      const defaultExpCat = categories.find((c) => c.type === 'expense');
      setCategoryId(defaultExpCat ? defaultExpCat.id : '');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('tarjeta_debito');
      setNotes('');
    }
    setError('');
  }, [editingTransaction, isAddModalOpen, categories]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const available = categories.filter((c) => c.type === newType);
    if (!available.some((c) => c.id === categoryId)) {
      setCategoryId(available[0]?.id || '');
    }
  };

  const handleClose = () => {
    setIsAddModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0');
      return;
    }

    if (!description.trim()) {
      setError('Por favor ingresa un concepto o descripción');
      return;
    }

    if (!categoryId) {
      setError('Por favor selecciona una categoría');
      return;
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type,
        amount: numAmount,
        description: description.trim(),
        categoryId,
        date,
        paymentMethod,
        notes: notes.trim(),
      });
    } else {
      addTransaction({
        type,
        amount: numAmount,
        description: description.trim(),
        categoryId,
        date,
        paymentMethod,
        notes: notes.trim(),
      });
    }

    handleClose();
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <Dialog open={isAddModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto p-6 gap-5">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {editingTransaction ? 'Editar Movimiento' : 'Nuevo Movimiento'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Registra tus finanzas para mantener el control de tus gastos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}

          {/* Type Selector (Gasto / Ingreso Tabs) */}
          <div className="grid grid-cols-2 p-1 bg-muted rounded-xl gap-1">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                type === 'expense'
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
                type === 'income'
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
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="pl-12 h-12 text-2xl font-bold bg-muted/40 border-input"
              />
            </div>
          </div>

          {/* Concept / Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Concepto / Descripción</Label>
            <Input
              type="text"
              placeholder={type === 'expense' ? 'Ej. Almuerzo, Uber, Factura de luz' : 'Ej. Sueldo, Venta freelance'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 bg-muted/40"
            />
          </div>

          {/* Category Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Tag className="size-3.5" />
              Categoría
            </Label>
            <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 border border-border rounded-xl bg-muted/20">
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
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
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Fecha
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 bg-muted/40 [color-scheme:dark]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="size-3.5" />
                Método de Pago
              </Label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full h-10 px-3 bg-muted/40 border border-input rounded-lg text-sm text-foreground focus:outline-hidden focus:border-ring cursor-pointer"
              >
                {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                  <option key={key} value={key} className="bg-popover text-popover-foreground">
                    {label}
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
