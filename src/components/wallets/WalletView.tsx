"use client";

import React, { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import { Account, AccountType } from "../../types/finance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { TransferModal } from "./TransferModal";
import { AccountModal } from "./AccountModal";
import { AdjustBalanceModal } from "./AdjustBalanceModal";

export const WalletView: React.FC = () => {
  const {
    accounts,
    deleteAccount,
    totalSavingsCapital,
    totalOperatingBalance,
    totalDebts,
    netWorth,
    currencyBreakdown,
    activeInstallments,
    creditCardsSummary,
    convertAmount,
    formatCurrency,
    settings,
  } = useFinance();

  // Modals state
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferDefaultFromId, setTransferDefaultFromId] = useState<
    string | undefined
  >(undefined);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [adjustingAccount, setAdjustingAccount] = useState<Account | null>(
    null,
  );

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case "wallet":
        return Smartphone;
      case "bank":
        return Landmark;
      case "cash":
        return Coins;
      case "credit":
        return CreditCard;
      case "savings":
        return PiggyBank;
      default:
        return Wallet;
    }
  };

  const getAccountTypeLabel = (type: AccountType) => {
    switch (type) {
      case "wallet":
        return "Billetera Digital";
      case "bank":
        return "Cuenta Bancaria";
      case "cash":
        return "Efectivo";
      case "credit":
        return "Tarjeta de Crédito";
      case "savings":
        return "Ahorro / Fondo Reserva";
      default:
        return "Cuenta";
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
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
              Dinero Operativo
            </span>
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
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 truncate">
              Capital Ahorrado
            </span>
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
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
              Deuda Tarjetas
            </span>
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
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
              Patrimonio Neto
            </span>
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

      {/* Multi-Currency Portfolio Breakdown */}
      {currencyBreakdown.length > 1 && (
        <div className="p-3 rounded-xl border border-border/70 bg-card/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" /> Cartera Multi-moneda:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {currencyBreakdown.map((item) => (
              <Badge
                key={item.currency}
                variant="outline"
                className="bg-background/80 font-mono text-xs py-1 px-2.5 border-border"
              >
                <strong className="text-foreground mr-1.5">{item.currency}:</strong>
                {formatCurrency(item.total, item.currency)}
                {item.currency !== settings.currencyCode && (
                  <span className="text-muted-foreground ml-1 font-normal">
                    (~ {formatCurrency(item.convertedTotal, settings.currencyCode)})
                  </span>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Active Installments / Compras en Cuotas Banner */}
      {activeInstallments.length > 0 && (
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="size-4 text-primary" /> Compras en Cuotas Activas
            </CardTitle>
            <CardDescription className="text-xs">
              Monitoreo de compras financiadas con tarjetas de crédito
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeInstallments.map((inst) => {
                const details = inst.installments!;
                const pct = Math.round((details.current / details.total) * 100);

                return (
                  <div
                    key={inst.id}
                    className="p-3 rounded-xl border border-border/60 bg-background/50 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {inst.description}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatCurrency(details.monthlyAmount, inst.currency)} / mes
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                        Cuota {details.current} de {details.total}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Total: {formatCurrency(details.originalAmount, inst.currency)}</span>
                        <span>{pct}% pagado</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Tus Cuentas y Tarjetas
          </h3>
          <p className="text-xs text-muted-foreground">
            Monitorea el saldo real en cada banco, billetera y ciclo de tarjetas
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
      {accounts.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center border-dashed border-border/80">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <Wallet className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No tienes cuentas registradas</h3>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto">
            Crea tu primera cuenta bancaria, billetera digital (Yape/Plin), efectivo o tarjeta para registrar y controlar tus saldos.
          </p>
          <Button
            size="sm"
            onClick={handleOpenAddAccount}
            className="mt-4 gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Plus className="size-3.5" />
            Crear mi primera cuenta
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => {
          const Icon = getAccountIcon(acc.type);
          const isNegative = acc.balance < 0;
          const isCredit = acc.type === "credit";
          const cardInfo = creditCardsSummary.cards.find((c) => c.account.id === acc.id);

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
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0"
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
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {getAccountTypeLabel(acc.type)}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 font-bold"
                        >
                          {acc.currency || settings.currencyCode}
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
                        if (
                          confirm(`¿Deseas eliminar la cuenta "${acc.name}"?`)
                        ) {
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
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {isCredit ? "Saldo Consumido" : "Saldo Actual"}
                  </span>
                  <div
                    className={`text-2xl font-black tracking-tight ${
                      isNegative
                        ? "text-rose-400"
                        : acc.balance === 0
                          ? "text-muted-foreground"
                          : "text-foreground"
                    }`}
                  >
                    {formatCurrency(acc.balance, acc.currency)}
                  </div>

                  {acc.currency && acc.currency !== settings.currencyCode && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      ~ {formatCurrency(convertAmount(acc.balance, acc.currency, settings.currencyCode), settings.currencyCode)}
                    </p>
                  )}
                </div>

                {/* Credit Card Specific Progress & Billing Cycle */}
                {isCredit && cardInfo && (
                  <div className="pt-2 border-t border-border/50 space-y-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                          Disponible:{" "}
                          <strong className="text-foreground">
                            {formatCurrency(cardInfo.available, acc.currency)}
                          </strong>
                        </span>
                        <span>
                          Línea: {formatCurrency(acc.creditLimit || 0, acc.currency)}
                        </span>
                      </div>
                      <Progress
                        value={
                          acc.creditLimit && acc.creditLimit > 0
                            ? Math.min(100, (cardInfo.used / acc.creditLimit) * 100)
                            : 0
                        }
                        className="h-1.5"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
                        <span className="text-[10px] text-muted-foreground block flex items-center gap-1">
                          <Calendar className="size-3" /> Cierre Ciclo
                        </span>
                        <p className="font-semibold text-[11px] text-foreground mt-0.5">
                          Día {acc.closingDay || 20}{" "}
                          <span className="text-[10px] text-amber-400 font-normal">
                            ({cardInfo.daysUntilClosing}d)
                          </span>
                        </p>
                      </div>

                      <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
                        <span className="text-[10px] text-muted-foreground block flex items-center gap-1">
                          <Calendar className="size-3" /> Fecha de Pago
                        </span>
                        <p className="font-semibold text-[11px] text-foreground mt-0.5">
                          Día {acc.dueDay || 15}{" "}
                          <span className="text-[10px] text-muted-foreground font-normal">
                            ({cardInfo.daysUntilDue}d)
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
      )}

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
