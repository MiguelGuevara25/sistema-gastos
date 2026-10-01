'use client';

import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { DebtLoan } from '../../types/finance';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  HandCoins,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  AlertCircle,
  Sparkles,
  Users,
  Check,
} from 'lucide-react';

export const DebtsLoansView: React.FC = () => {
  const {
    debtsLoans,
    addDebtLoan,
    updateDebtLoan,
    deleteDebtLoan,
    settleDebtLoan,
    totalLentPending,
    totalBorrowedPending,
    netDebtBalance,
    accounts,
    formatCurrency,
  } = useFinance();

  // Filter & Search
  const [filterType, setFilterType] = useState<'all' | 'lent' | 'borrowed' | 'settled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtLoan | null>(null);
  const [settlingDebt, setSettlingDebt] = useState<DebtLoan | null>(null);

  // Form State
  const [type, setType] = useState<'lent' | 'borrowed'>('lent');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');

  // Settle Form State
  const [settleAccountId, setSettleAccountId] = useState('');

  // Counts
  const pendingLentCount = useMemo(
    () => debtsLoans.filter((d) => d.status === 'pending' && d.type === 'lent').length,
    [debtsLoans]
  );
  const pendingBorrowedCount = useMemo(
    () => debtsLoans.filter((d) => d.status === 'pending' && d.type === 'borrowed').length,
    [debtsLoans]
  );
  const settledCount = useMemo(
    () => debtsLoans.filter((d) => d.status === 'settled').length,
    [debtsLoans]
  );

  // Filtered List
  const filteredList = useMemo(() => {
    return debtsLoans
      .filter((item) => {
        // Tab filter
        if (filterType === 'lent') return item.status === 'pending' && item.type === 'lent';
        if (filterType === 'borrowed') return item.status === 'pending' && item.type === 'borrowed';
        if (filterType === 'settled') return item.status === 'settled';
        // 'all' includes pending first, but all items
        return true;
      })
      .filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.personName.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        // Pending first
        if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
        // Due date closest first
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [debtsLoans, filterType, searchQuery]);

  // Handlers for Add / Edit
  const handleOpenAdd = () => {
    setType('lent');
    setPersonName('');
    setAmount('');
    setDueDate('');
    setAccountId(accounts[0]?.id || '');
    setNotes('');
    setEditingDebt(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (debt: DebtLoan) => {
    setEditingDebt(debt);
    setType(debt.type);
    setPersonName(debt.personName);
    setAmount(debt.amount.toString());
    setDueDate(debt.dueDate || '');
    setAccountId(debt.accountId || '');
    setNotes(debt.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!personName.trim() || isNaN(numAmount) || numAmount <= 0) return;

    if (editingDebt) {
      updateDebtLoan(editingDebt.id, {
        type,
        personName: personName.trim(),
        amount: numAmount,
        dueDate: dueDate || undefined,
        accountId: accountId || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addDebtLoan({
        type,
        personName: personName.trim(),
        amount: numAmount,
        dueDate: dueDate || undefined,
        status: 'pending',
        accountId: accountId || undefined,
        notes: notes.trim() || undefined,
      });
    }

    setIsAddModalOpen(false);
  };

  // Handler for Settle
  const handleOpenSettle = (debt: DebtLoan) => {
    setSettlingDebt(debt);
    setSettleAccountId(debt.accountId || accounts[0]?.id || '');
  };

  const handleConfirmSettle = () => {
    if (!settlingDebt) return;
    settleDebtLoan(settlingDebt.id, settleAccountId || undefined);
    setSettlingDebt(null);
  };

  // Helper for date status
  const getDueStatus = (dateStr?: string) => {
    if (!dateStr) return { text: 'Sin fecha límite', color: 'text-zinc-500', isOverdue: false };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Venció hace ${Math.abs(diffDays)} día${Math.abs(diffDays) === 1 ? '' : 's'}`,
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        isOverdue: true,
      };
    }
    if (diffDays === 0) {
      return {
        text: 'Vence hoy',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        isOverdue: false,
      };
    }
    if (diffDays === 1) {
      return {
        text: 'Vence mañana',
        color: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
        isOverdue: false,
      };
    }
    return {
      text: `Vence en ${diffDays} días (${dateStr})`,
      color: 'text-zinc-400 bg-zinc-800/40 border-zinc-700/30',
      isOverdue: false,
    };
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Main Call to Action */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HandCoins className="size-5 sm:size-6 text-primary" />
            Deudas & Préstamos
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
            Lleva el control de quién te debe dinero y qué deudas tienes pendientes de pagar.
          </p>
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="cursor-pointer gap-1.5 font-semibold shadow-xs text-xs h-8">
          <Plus className="size-3.5" />
          <span>Nuevo Préstamo</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {/* Me Deben */}
        <Card className="border-border/80 shadow-xs relative overflow-hidden bg-card/60 p-3 sm:p-4">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/80" />
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-emerald-400">
              Me Deben (Por Cobrar)
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold text-foreground mt-0.5 sm:mt-1">
            {formatCurrency(totalLentPending)}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <span className="font-semibold text-emerald-400">{pendingLentCount}</span> personas pendientes
          </p>
        </Card>

        {/* Debo */}
        <Card className="border-border/80 shadow-xs relative overflow-hidden bg-card/60 p-3 sm:p-4">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500/80" />
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-amber-400">
              Debo (Por Pagar)
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <ArrowDownLeft className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold text-foreground mt-0.5 sm:mt-1">
            {formatCurrency(totalBorrowedPending)}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <span className="font-semibold text-amber-400">{pendingBorrowedCount}</span> obligaciones pendientes
          </p>
        </Card>

        {/* Balance Neto */}
        <Card className="border-border/80 shadow-xs relative overflow-hidden bg-card/60 p-3 sm:p-4">
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${
              netDebtBalance >= 0 ? 'bg-cyan-500/80' : 'bg-rose-500/80'
            }`}
          />
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Balance Neto
            </span>
            <div
              className={`p-1.5 rounded-lg ${
                netDebtBalance >= 0 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              <Sparkles className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div
            className={`text-xl sm:text-3xl font-extrabold mt-0.5 sm:mt-1 ${
              netDebtBalance >= 0 ? 'text-cyan-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(netDebtBalance)}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
            {netDebtBalance >= 0 ? (
              <span className="text-cyan-300">Saldo favorable (+{formatCurrency(netDebtBalance)})</span>
            ) : (
              <span className="text-rose-300">Saldo en contra (-{formatCurrency(Math.abs(netDebtBalance))})</span>
            )}
          </p>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border overflow-x-auto scrollbar-none shrink-0 w-full sm:w-auto">
          <Button
            variant={filterType === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilterType('all')}
            className="text-xs h-7.5 px-2.5 cursor-pointer shrink-0"
          >
            Todos ({debtsLoans.length})
          </Button>
          <Button
            variant={filterType === 'lent' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilterType('lent')}
            className="text-xs h-8 px-3 cursor-pointer text-emerald-400"
          >
            Me Deben ({pendingLentCount})
          </Button>
          <Button
            variant={filterType === 'borrowed' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilterType('borrowed')}
            className="text-xs h-8 px-3 cursor-pointer text-amber-400"
          >
            Debo ({pendingBorrowedCount})
          </Button>
          <Button
            variant={filterType === 'settled' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilterType('settled')}
            className="text-xs h-8 px-3 cursor-pointer text-zinc-400"
          >
            Saldados ({settledCount})
          </Button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por persona..."
            className="pl-9 text-xs h-9 bg-muted/20"
          />
        </div>
      </div>

      {/* Debts List */}
      {filteredList.length === 0 ? (
        <Card className="border-border/60 p-10 text-center shadow-xs">
          <div className="max-w-sm mx-auto flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
              <Users className="size-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No se encontraron registros</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              {searchQuery
                ? 'No hay préstamos ni deudas que coincidan con la búsqueda.'
                : 'No tienes registros pendientes en esta pestaña.'}
            </p>
            <Button size="sm" onClick={handleOpenAdd} className="gap-2 cursor-pointer font-medium">
              <Plus className="size-4" /> Registrar Nuevo
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredList.map((item) => {
            const isLent = item.type === 'lent';
            const isSettled = item.status === 'settled';
            const dueStatus = getDueStatus(item.dueDate);
            const account = accounts.find((a) => a.id === item.accountId);

            return (
              <Card
                key={item.id}
                className={`transition-all duration-200 border-border/80 shadow-xs relative overflow-hidden ${
                  isSettled
                    ? 'opacity-65 bg-card/40'
                    : isLent
                    ? 'hover:border-emerald-500/40 bg-card/80'
                    : 'hover:border-amber-500/40 bg-card/80'
                }`}
              >
                {/* Side Status Border */}
                <div
                  className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                    isSettled
                      ? 'bg-zinc-600'
                      : isLent
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                />

                <CardContent className="p-4 pl-5 flex flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                          isSettled
                            ? 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400'
                            : isLent
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}
                      >
                        {item.personName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-foreground">{item.personName}</h4>
                          {isSettled ? (
                            <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-400 border-zinc-700">
                              <CheckCircle2 className="size-3 mr-1 text-emerald-400" />
                              {isLent ? 'Cobrado' : 'Pagado'}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold ${
                                isLent
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}
                            >
                              {isLent ? 'Me debe' : 'Debo'}
                            </Badge>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p
                        className={`text-base sm:text-lg font-bold tracking-tight ${
                          isSettled
                            ? 'line-through text-muted-foreground'
                            : isLent
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Row: Due Date & Account */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {!isSettled ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${dueStatus.color}`}
                        >
                          <Clock className="size-3" />
                          {dueStatus.text}
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <Check className="size-3 text-emerald-400" />
                          Saldado {item.settledDate ? `el ${item.settledDate}` : ''}
                        </span>
                      )}

                      {account && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 bg-muted/30 px-2 py-0.5 rounded-md">
                          <Wallet className="size-3" style={{ color: account.color }} />
                          {account.name}
                        </span>
                      )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      {!isSettled && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenSettle(item)}
                          className={`h-7 px-2.5 text-xs font-semibold cursor-pointer gap-1 ${
                            isLent
                              ? 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
                              : 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300'
                          }`}
                        >
                          <CheckCircle2 className="size-3.5" />
                          <span>{isLent ? 'Cobrado' : 'Pagado'}</span>
                        </Button>
                      )}

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEdit(item)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteDebtLoan(item.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Debt Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HandCoins className="size-5 text-primary" />
              {editingDebt ? 'Editar Préstamo o Deuda' : 'Registrar Préstamo o Deuda'}
            </DialogTitle>
            <DialogDescription>
              {editingDebt
                ? 'Modifica los datos del préstamo o compromiso.'
                : 'Controla a quién le prestaste dinero o quién te hizo un préstamo.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            {/* Type selector: Lent vs Borrowed */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tipo de Operación</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('lent')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                    type === 'lent'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-semibold'
                      : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                  }`}
                >
                  <ArrowUpRight className="size-5 mb-1 text-emerald-400" />
                  <span className="text-xs">Presté Dinero</span>
                  <span className="text-[10px] opacity-75">Me deben a mí</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('borrowed')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                    type === 'borrowed'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-semibold'
                      : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                  }`}
                >
                  <ArrowDownLeft className="size-5 mb-1 text-amber-400" />
                  <span className="text-xs">Me Prestaron Dinero</span>
                  <span className="text-[10px] opacity-75">Yo debo pagar</span>
                </button>
              </div>
            </div>

            {/* Persona */}
            <div className="space-y-1.5">
              <Label htmlFor="personName" className="text-xs font-semibold">
                Nombre de la Persona
              </Label>
              <Input
                id="personName"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Ej. Carlos Gómez, Mamá, Juan Pérez..."
                required
                className="text-sm"
              />
            </div>

            {/* Monto & Fecha Límite */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="amount" className="text-xs font-semibold">
                  Monto
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dueDate" className="text-xs font-semibold">
                  Fecha Promesa (Opcional)
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Cuenta Asociada (Opcional) */}
            <div className="space-y-1.5">
              <Label htmlFor="accountId" className="text-xs font-semibold">
                Cuenta / Billetera Asociada (Opcional)
              </Label>
              <select
                id="accountId"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Ninguna / No especificada</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            {/* Notas / Motivo */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold">
                Motivo / Notas
              </Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Para repuesto del auto, cena compartida..."
                className="text-sm"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button type="submit" className="cursor-pointer font-semibold">
                {editingDebt ? 'Guardar Cambios' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Settle / Mark as Paid Modal */}
      <Dialog open={!!settlingDebt} onOpenChange={(open) => !open && setSettlingDebt(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-400" />
              {settlingDebt?.type === 'lent' ? 'Confirmar Cobro' : 'Confirmar Pago de Deuda'}
            </DialogTitle>
            <DialogDescription>
              {settlingDebt?.type === 'lent' ? (
                <span>
                  ¿Recibiste el pago de <strong>{settlingDebt?.personName}</strong> por un monto de{' '}
                  <strong className="text-emerald-400">{formatCurrency(settlingDebt?.amount || 0)}</strong>?
                </span>
              ) : (
                <span>
                  ¿Ya cancelaste la deuda a <strong>{settlingDebt?.personName}</strong> por un monto de{' '}
                  <strong className="text-amber-400">{formatCurrency(settlingDebt?.amount || 0)}</strong>?
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {settlingDebt?.type === 'lent'
                  ? '¿A qué cuenta ingresó el dinero cobrado?'
                  : '¿De qué cuenta salió el dinero pagado?'}
              </Label>
              <select
                value={settleAccountId}
                onChange={(e) => setSettleAccountId(e.target.value)}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">No registrar movimiento en cuentas (Solo marcar como saldado)</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Saldo actual: {formatCurrency(acc.balance)})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground mt-1">
                {settleAccountId ? (
                  <span className="text-emerald-400">
                    ✓ Se actualizará el saldo de la cuenta y se registrará automáticamente en tus movimientos del mes.
                  </span>
                ) : (
                  <span>Solo cambiará el estado a liquidado sin alterar el saldo de tus cuentas.</span>
                )}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSettlingDebt(null)}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSettle}
              className="cursor-pointer font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Confirmar Liquidación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
