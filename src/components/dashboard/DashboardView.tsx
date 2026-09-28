'use client';

import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { MetricCard } from './MetricCard';
import { ExpenseFlowChart } from './ExpenseFlowChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { RecentTransactions } from './RecentTransactions';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
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
  } = useFinance();

  const remainingBudget = settings.monthlyBudget - totalExpenses;
  const incomeCount = transactions.filter((t) => t.type === 'income').length;
  const expenseCount = transactions.filter((t) => t.type === 'expense').length;

  return (
    <div className="space-y-6">
      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Neto */}
        <MetricCard
          title="Balance Neto"
          amount={formatCurrency(netBalance)}
          subtitle={netBalance >= 0 ? 'Superávit acumulado' : 'Déficit acumulado'}
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
          subtitle={`${incomeCount} entradas`}
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
          subtitle={`${expenseCount} salidas`}
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
