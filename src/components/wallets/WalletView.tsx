'use client';

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Account, AccountType } from '../../types/finance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  ShieldCheck,
  SlidersHorizontal,
  PiggyBank,
} from 'lucide-react';
import { TransferModal } from './TransferModal';
import { AccountModal } from './AccountModal';
import { AdjustBalanceModal } from './AdjustBalanceModal';

export const WalletView: React.FC = () => {
  const {
    accounts,
    deleteAccount,
    totalSavingsCapital,
    totalOperatingBalance,
    totalDebts,
    netWorth,
    formatCurrency,
  } = useFinance();

  // Modals state
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferDefaultFromId, setTransferDefaultFromId] = useState<string | undefined>(undefined);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [adjustingAccount, setAdjustingAccount] = useState<Account | null>(null);

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
    setTransferDefaultFromId(fromId);
    setIsTransferOpen(true);
  };

  const handleOpenEditAccount = (acc: Account) => {
    setEditingAccount(acc);
    setIsAddAccountOpen(true);
  };

  const handleOpenAddAccount = () => {
    setEditingAccount(null);
    setIsAddAccountOpen(true);
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
                    onClick={() => setAdjustingAccount(acc)}
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
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        defaultFromId={transferDefaultFromId}
      />

      {/* Add / Edit Account Modal */}
      <AccountModal
        isOpen={isAddAccountOpen}
        onClose={() => {
          setIsAddAccountOpen(false);
          setEditingAccount(null);
        }}
        accountToEdit={editingAccount}
      />

      {/* Adjust Balance Modal */}
      <AdjustBalanceModal
        isOpen={Boolean(adjustingAccount)}
        onClose={() => setAdjustingAccount(null)}
        account={adjustingAccount}
      />
    </div>
  );
};
