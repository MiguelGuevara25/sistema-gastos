'use client';

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Account, AccountType } from '../../types/finance';
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
  Wallet,
  Landmark,
  Smartphone,
  Coins,
  CreditCard,
  ArrowRightLeft,
  Plus,
  Edit2,
  Trash2,
  Check,
  TrendingUp,
  ShieldCheck,
  SlidersHorizontal,
  PiggyBank,
} from 'lucide-react';

export const WalletView: React.FC = () => {
  const {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    transferBetweenAccounts,
    adjustAccountBalance,
    totalLiquidAssets,
    totalSavingsCapital,
    totalOperatingBalance,
    totalDebts,
    netWorth,
    formatCurrency,
  } = useFinance();

  // Modals state
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [adjustingAccount, setAdjustingAccount] = useState<Account | null>(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');

  // Transfer Form State
  const [transferFrom, setTransferFrom] = useState(accounts[0]?.id || '');
  const [transferTo, setTransferTo] = useState(accounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [transferNotes, setTransferNotes] = useState('');
  const [transferError, setTransferError] = useState('');

  // Account Form State
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('wallet');
  const [accountBalance, setAccountBalance] = useState('');
  const [accountColor, setAccountColor] = useState('#8b5cf6');
  const [accountNumber, setAccountNumber] = useState('');

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'wallet':
        return Smartphone;
      case 'bank':
        return Landmark;
      case 'cash':
        return Coins;
      case 'credit':
        return CreditCard;
      case 'savings':
        return PiggyBank;
      default:
        return Wallet;
    }
  };

  const getAccountTypeLabel = (type: AccountType) => {
    switch (type) {
      case 'wallet':
        return 'Billetera Digital';
      case 'bank':
        return 'Cuenta Bancaria';
      case 'cash':
        return 'Efectivo';
      case 'credit':
        return 'Tarjeta de Crédito';
      case 'savings':
        return 'Ahorro / Fondo Reserva';
      default:
        return 'Cuenta';
    }
  };

  const handleOpenTransfer = (fromId?: string) => {
    setTransferFrom(fromId || accounts[0]?.id || '');
    const other = accounts.find((a) => a.id !== (fromId || accounts[0]?.id));
    setTransferTo(other?.id || accounts[1]?.id || '');
    setTransferAmount('');
    setTransferNotes('');
    setTransferError('');
    setIsTransferOpen(true);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      setTransferError('Ingresa un monto válido mayor a 0');
      return;
    }
    if (!transferFrom || !transferTo) {
      setTransferError('Selecciona la cuenta de origen y de destino');
      return;
    }
    if (transferFrom === transferTo) {
      setTransferError('La cuenta de origen y destino deben ser diferentes');
      return;
    }

    transferBetweenAccounts({
      fromAccountId: transferFrom,
      toAccountId: transferTo,
      amount: amt,
      date: transferDate,
      notes: transferNotes.trim() || undefined,
    });

    setIsTransferOpen(false);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) return;
    const initialBal = parseFloat(accountBalance) || 0;

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name: accountName.trim(),
        type: accountType,
        color: accountColor,
        accountNumber: accountNumber.trim() || undefined,
      });
    } else {
      addAccount({
        name: accountName.trim(),
        type: accountType,
        balance: initialBal,
        color: accountColor,
        accountNumber: accountNumber.trim() || undefined,
      });
    }
    setIsAddAccountOpen(false);
    setEditingAccount(null);
  };

  const handleOpenEditAccount = (acc: Account) => {
    setEditingAccount(acc);
    setAccountName(acc.name);
    setAccountType(acc.type);
    setAccountBalance(acc.balance.toString());
    setAccountColor(acc.color);
    setAccountNumber(acc.accountNumber || '');
    setIsAddAccountOpen(true);
  };

  const handleOpenAddAccount = () => {
    setEditingAccount(null);
    setAccountName('');
    setAccountType('wallet');
    setAccountBalance('0');
    setAccountColor('#8b5cf6');
    setAccountNumber('');
    setIsAddAccountOpen(true);
  };

  const handleSaveBalanceAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingAccount) return;
    const val = parseFloat(newBalanceInput);
    if (!isNaN(val)) {
      adjustAccountBalance(adjustingAccount.id, val);
    }
    setAdjustingAccount(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Net Worth & Asset Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Operating Balance */}
        <Card className="p-3 sm:p-4 bg-muted/20 border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">Dinero Operativo</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Coins className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold text-foreground truncate">
            {formatCurrency(totalOperatingBalance)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 sm:mt-1 truncate">
            Yape, Plin y cuentas sueldo
          </p>
        </Card>

        {/* Capital Ahorrado / Reserva */}
        <Card className="p-3 sm:p-4 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 truncate">Capital Ahorrado</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <PiggyBank className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold text-emerald-400 truncate">
            {formatCurrency(totalSavingsCapital)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 sm:mt-1 truncate">
            Reserva acumulada
          </p>
        </Card>

        {/* Total Debts */}
        <Card className="p-3 sm:p-4 bg-muted/20 border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">Deuda Tarjetas</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <CreditCard className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold text-rose-400 truncate">
            {formatCurrency(totalDebts)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 sm:mt-1 truncate">
            Consumos pendientes
          </p>
        </Card>

        {/* Net Worth */}
        <Card className="p-3 sm:p-4 bg-primary/10 border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">Patrimonio Neto</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold text-primary truncate">
            {formatCurrency(netWorth)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 sm:mt-1 truncate">
            Activos menos deudas
          </p>
        </Card>
      </div>

      {/* Main Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="text-base font-bold text-foreground">Tus Cuentas y Billeteras</h3>
          <p className="text-xs text-muted-foreground">
            Monitorea el saldo real en cada banco y billetera digital
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenTransfer()}
            className="cursor-pointer gap-1.5 text-xs h-9"
          >
            <ArrowRightLeft className="size-3.5" />
            Transferir Dinero
          </Button>

          <Button
            size="sm"
            onClick={handleOpenAddAccount}
            className="cursor-pointer gap-1.5 text-xs h-9 shadow-xs"
          >
            <Plus className="size-3.5" />
            Nueva Cuenta
          </Button>
        </div>
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const Icon = getAccountIcon(acc.type);
          const isNegative = acc.balance < 0;

          return (
            <Card
              key={acc.id}
              className="relative overflow-hidden border-border/70 hover:border-border transition-all duration-200"
            >
              {/* Top Color Accent Line */}
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: acc.color }}
              />

              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
                      style={{
                        backgroundColor: `${acc.color}20`,
                        color: acc.color,
                        border: `1px solid ${acc.color}40`,
                      }}
                    >
                      <Icon className="size-5" />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-foreground leading-tight">
                        {acc.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {getAccountTypeLabel(acc.type)}
                        </Badge>
                        {acc.accountNumber && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {acc.accountNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditAccount(acc)}
                      className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                      title="Editar cuenta"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`¿Deseas eliminar la cuenta "${acc.name}"?`)) {
                          deleteAccount(acc.id);
                        }
                      }}
                      className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-rose-400"
                      title="Eliminar cuenta"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Balance display */}
                <div className="pt-1">
                  <span className="text-[11px] text-muted-foreground font-medium">Saldo Actual</span>
                  <div
                    className={`text-2xl font-black tracking-tight ${
                      isNegative
                        ? 'text-rose-400'
                        : acc.balance === 0
                        ? 'text-muted-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {formatCurrency(acc.balance)}
                  </div>
                </div>

                {/* Quick actions for this specific account */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAdjustingAccount(acc);
                      setNewBalanceInput(acc.balance.toString());
                    }}
                    className="flex-1 h-8 text-[11px] cursor-pointer gap-1"
                  >
                    <SlidersHorizontal className="size-3" />
                    Ajustar Saldo
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenTransfer(acc.id)}
                    className="flex-1 h-8 text-[11px] cursor-pointer gap-1"
                  >
                    <ArrowRightLeft className="size-3" />
                    Transferir
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transfer Modal */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ArrowRightLeft className="size-4 text-primary" />
              Transferir Entre Cuentas
            </DialogTitle>
            <DialogDescription className="text-xs">
              Mueve dinero entre tus billeteras (ej: BCP a Yape) sin generar un gasto falso
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleExecuteTransfer} className="space-y-4 pt-2">
            {transferError && (
              <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
                {transferError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Desde (Origen)</Label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value)}
                  className="w-full h-9 rounded-md bg-muted/40 border border-input text-xs px-2.5 text-foreground focus:outline-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} className="bg-popover text-popover-foreground">
                      {a.name} ({formatCurrency(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Hacia (Destino)</Label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="w-full h-9 rounded-md bg-muted/40 border border-input text-xs px-2.5 text-foreground focus:outline-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} className="bg-popover text-popover-foreground">
                      {a.name} ({formatCurrency(a.balance)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Monto a Transferir</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="h-9 text-xs"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Fecha</Label>
                <Input
                  type="date"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nota / Motivo (Opcional)</Label>
              <Input
                type="text"
                placeholder="ej: Recarga para compras menores"
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTransferOpen(false)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="cursor-pointer font-semibold">
                Confirmar Transferencia
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Account Modal */}
      <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingAccount ? 'Editar Cuenta o Billetera' : 'Nueva Cuenta o Billetera'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Registra una cuenta bancaria, billetera digital, efectivo o tarjeta de crédito
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAccount} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nombre de la Cuenta</Label>
              <Input
                type="text"
                placeholder="ej: Yape, BBVA Ahorros, Efectivo..."
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tipo de Cuenta</Label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as AccountType)}
                  className="w-full h-9 rounded-md bg-muted/40 border border-input text-xs px-2.5 text-foreground focus:outline-none"
                >
                  <option value="savings" className="bg-popover text-popover-foreground">
                    🐷 Cuenta de Ahorro / Capital Reserva
                  </option>
                  <option value="wallet" className="bg-popover text-popover-foreground">
                    📱 Billetera Digital (Yape / Plin)
                  </option>
                  <option value="bank" className="bg-popover text-popover-foreground">
                    🏦 Cuenta Bancaria
                  </option>
                  <option value="cash" className="bg-popover text-popover-foreground">
                    💵 Efectivo
                  </option>
                  <option value="credit" className="bg-popover text-popover-foreground">
                    💳 Tarjeta de Crédito
                  </option>
                </select>
              </div>

              {!editingAccount && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Saldo Inicial</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              )}

              {editingAccount && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Identificador / Dígitos</Label>
                  <Input
                    type="text"
                    placeholder="ej: *4821"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Color de Identificación</Label>
              <div className="flex items-center gap-2">
                {[
                  '#8b5cf6', // morado (Yape)
                  '#06b6d4', // celeste (Plin)
                  '#f97316', // naranja (BCP)
                  '#10b981', // verde (Interbank)
                  '#2563eb', // azul (BBVA)
                  '#f59e0b', // ámbar (Efectivo)
                  '#f43f5e', // rojo (Tarjeta)
                  '#64748b', // pizarra
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAccountColor(c)}
                    className={`size-6 rounded-full cursor-pointer transition-transform ${
                      accountColor === c ? 'scale-125 ring-2 ring-foreground ring-offset-2 ring-offset-background' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddAccountOpen(false)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="cursor-pointer font-semibold">
                Guardar Cuenta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Balance Modal */}
      <Dialog
        open={Boolean(adjustingAccount)}
        onOpenChange={(open) => !open && setAdjustingAccount(null)}
      >
        <DialogContent className="w-[92vw] sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              Ajustar Saldo: {adjustingAccount?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Sincroniza el monto con el saldo real que ves en tu app bancaria
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBalanceAdjustment} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nuevo Saldo</Label>
              <Input
                type="number"
                step="0.01"
                value={newBalanceInput}
                onChange={(e) => setNewBalanceInput(e.target.value)}
                className="h-10 text-base font-bold"
                autoFocus
              />
            </div>

            <DialogFooter className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAdjustingAccount(null)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="cursor-pointer font-semibold">
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
