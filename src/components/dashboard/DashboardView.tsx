'use client';

import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { MetricCard } from './MetricCard';
import { ExpenseFlowChart } from './ExpenseFlowChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { RecentTransactions } from './RecentTransactions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  ArrowRight,
  Coins,
  CreditCard,
  Smartphone,
  Landmark,
  Sparkles,
  Receipt,
  HandCoins,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    totalIncome,
    totalExpenses,
    netBalance,
    savingsRate,
    budgetUsagePercent,
    settings,
    formatCurrency,
    transactions,
    accounts,
    goals,
    recurringExpenses,
    totalRecurringMonthly,
    recurringPaidThisMonth,
    recurringPendingThisMonth,
    totalLentPending,
    totalBorrowedPending,
    netDebtBalance,
    totalLiquidAssets,
    totalSavedInGoals,
    totalTargetGoals,
    selectedMonth,
    monthComparison,
    setActiveTab,
  } = useFinance();

  const remainingBudget = settings.monthlyBudget - totalExpenses;
  const incomeCount = transactions.filter((t) => t.type === 'income').length;
  const expenseCount = transactions.filter((t) => t.type === 'expense').length;

  const getAccountIcon = (type: string) => {
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Balance Neto */}
        <MetricCard
          title="Balance Neto"
          amount={formatCurrency(netBalance)}
          subtitle={netBalance >= 0 ? 'Superávit del período' : 'Déficit del período'}
          icon={Wallet}
          iconColor={netBalance >= 0 ? 'text-zinc-100' : 'text-rose-400'}
          iconBg={netBalance >= 0 ? 'bg-zinc-800' : 'bg-rose-950/60'}
          badge={{
            text: netBalance >= 0 ? 'Positivo' : 'En rojo',
            type: netBalance >= 0 ? 'positive' : 'negative',
          }}
        />

        {/* Total Ingresos */}
        <MetricCard
          title="Total Ingresos"
          amount={formatCurrency(totalIncome)}
          subtitle={`${incomeCount} entradas este mes`}
          icon={TrendingUp}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-950/40"
          badge={{
            text: `+${incomeCount}`,
            type: 'positive',
          }}
        />

        {/* Total Gastos */}
        <MetricCard
          title="Total Gastos"
          amount={formatCurrency(totalExpenses)}
          subtitle={
            selectedMonth !== 'all' && monthComparison.previousExpenses > 0
              ? `${Math.abs(monthComparison.expenseDiffPercent)}% ${
                  monthComparison.expenseDiffPercent <= 0 ? 'menos' : 'más'
                } que el mes ant.`
              : `${expenseCount} salidas este mes`
          }
          icon={TrendingDown}
          iconColor="text-rose-400"
          iconBg="bg-rose-950/40"
          badge={{
            text: `${budgetUsagePercent}% cupo`,
            type: budgetUsagePercent > 100 ? 'negative' : 'neutral',
          }}
        />

        {/* Tasa de Ahorro / Presupuesto Restante */}
        <MetricCard
          title="Presupuesto Restante"
          amount={formatCurrency(remainingBudget)}
          subtitle={`Meta: ${formatCurrency(settings.monthlyBudget)}`}
          icon={PiggyBank}
          iconColor="text-blue-400"
          iconBg="bg-blue-950/40"
          badge={{
            text: `${savingsRate}% ahorro`,
            type: savingsRate >= 20 ? 'positive' : 'neutral',
          }}
        />
      </div>

      {/* Quick Glance: Wallets, Recurring, Goals & Debts Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallets & Accounts Summary */}
        <Card className="p-4 border-border/70 hover:border-border transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Wallet className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Billeteras & Cuentas</h4>
                <p className="text-[11px] text-muted-foreground">
                  Líquido: <strong className="text-foreground">{formatCurrency(totalLiquidAssets)}</strong>
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('wallets')}
              className="text-xs gap-1 cursor-pointer h-7 text-muted-foreground hover:text-foreground"
            >
              <span>Ver</span>
              <ArrowRight className="size-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {accounts.slice(0, 4).map((acc) => {
              const Icon = getAccountIcon(acc.type);
              return (
                <div
                  key={acc.id}
                  onClick={() => setActiveTab('wallets')}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/30 border border-border/50 shrink-0 cursor-pointer hover:bg-muted/60 transition-colors"
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${acc.color}20`, color: acc.color }}
                  >
                    <Icon className="size-3" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-foreground leading-tight truncate max-w-[70px]">
                      {acc.name}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-mono">
                      {formatCurrency(acc.balance)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recurring / Fixed Expenses Summary */}
        <Card className="p-4 border-border/70 hover:border-border transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Receipt className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Gastos Fijos del Mes</h4>
                <p className="text-[11px] text-muted-foreground">
                  Total: <strong className="text-foreground">{formatCurrency(totalRecurringMonthly)}</strong>
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('recurring')}
              className="text-xs gap-1 cursor-pointer h-7 text-muted-foreground hover:text-foreground"
            >
              <span>Ver</span>
              <ArrowRight className="size-3" />
            </Button>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Cubierto: {formatCurrency(recurringPaidThisMonth)}</span>
              <span className="font-semibold text-amber-400">
                Pendiente: {formatCurrency(recurringPendingThisMonth)}
              </span>
            </div>
            <Progress
              value={
                totalRecurringMonthly > 0
                  ? Math.min(100, Math.round((recurringPaidThisMonth / totalRecurringMonthly) * 100))
                  : 0
              }
              className="h-1.5"
            />
          </div>
        </Card>

        {/* Savings Goals Summary */}
        <Card className="p-4 border-border/70 hover:border-border transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Target className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Metas de Ahorro</h4>
                <p className="text-[11px] text-muted-foreground">
                  Ahorrado: <strong className="text-emerald-400">{formatCurrency(totalSavedInGoals)}</strong>
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('goals')}
              className="text-xs gap-1 cursor-pointer h-7 text-muted-foreground hover:text-foreground"
            >
              <span>Ver</span>
              <ArrowRight className="size-3" />
            </Button>
          </div>

          <div className="space-y-1.5 pt-1">
            {goals[0] ? (
              <>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-foreground truncate max-w-[150px]">
                    {goals[0].name}
                  </span>
                  <span className="text-muted-foreground font-mono">
                    {Math.round((goals[0].currentAmount / goals[0].targetAmount) * 100)}%
                  </span>
                </div>
                <Progress
                  value={Math.min(100, Math.round((goals[0].currentAmount / goals[0].targetAmount) * 100))}
                  className="h-1.5"
                />
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground">Sin metas activas</p>
            )}
          </div>
        </Card>

        {/* Debts & Loans Summary */}
        <Card className="p-4 border-border/70 hover:border-border transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <HandCoins className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Deudas & Préstamos</h4>
                <p className="text-[11px] text-muted-foreground">
                  Me deben: <strong className="text-emerald-400">{formatCurrency(totalLentPending)}</strong>
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('debts')}
              className="text-xs gap-1 cursor-pointer h-7 text-muted-foreground hover:text-foreground"
            >
              <span>Ver</span>
              <ArrowRight className="size-3" />
            </Button>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Debo pagar:</span>
              <span className="font-semibold text-amber-400 font-mono">
                {formatCurrency(totalBorrowedPending)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>Balance neto:</span>
              <span className={netDebtBalance >= 0 ? 'text-cyan-400 font-semibold' : 'text-rose-400 font-semibold'}>
                {netDebtBalance >= 0 ? '+' : ''}{formatCurrency(netDebtBalance)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Middle Grid: Chart + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ExpenseFlowChart />
        </div>
        <div className="lg:col-span-5">
          <CategoryBreakdown />
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions */}
      <div>
        <RecentTransactions />
      </div>
    </div>
  );
};
