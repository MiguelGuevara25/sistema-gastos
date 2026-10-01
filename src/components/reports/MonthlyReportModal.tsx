'use client';

import { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Printer,
  FileText,
  Wallet,
  PieChart,
  Receipt,
  HandCoins,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({ isOpen, onClose }) => {
  const {
    allTransactions,
    categories,
    accounts,
    debtsLoans,
    recurringExpenses,
    settings,
    selectedMonth,
    availableMonths,
    formatCurrency,
  } = useFinance();

  // Current month string
  const defaultMonth = useMemo(() => {
    if (selectedMonth && selectedMonth !== 'all') return selectedMonth;
    return format(new Date(), 'yyyy-MM');
  }, [selectedMonth]);

  const [reportMonth, setReportMonth] = useState<string>(defaultMonth);

  // Month label
  const monthLabel = useMemo(() => {
    const item = availableMonths.find((m) => m.value === reportMonth);
    if (item) return item.label;
    try {
      const date = parseISO(`${reportMonth}-01`);
      const formatted = format(date, 'MMMM yyyy', { locale: es });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return reportMonth;
    }
  }, [reportMonth, availableMonths]);

  // Transactions of report month
  const monthTransactions = useMemo(() => {
    return allTransactions.filter((tx) => tx.date && tx.date.startsWith(reportMonth));
  }, [allTransactions, reportMonth]);

  // Metrics for report month
  const { totalIncome, totalExpenses, netBalance, savingsRate, budgetUsagePercent } = useMemo(() => {
    let income = 0;
    let expenses = 0;

    monthTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        income += Number(tx.amount) || 0;
      } else {
        expenses += Number(tx.amount) || 0;
      }
    });

    const net = income - expenses;
    const rate = income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;
    const budgetUsage =
      settings.monthlyBudget > 0 ? Math.round((expenses / settings.monthlyBudget) * 100) : 0;

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: net,
      savingsRate: rate,
      budgetUsagePercent: budgetUsage,
    };
  }, [monthTransactions, settings.monthlyBudget]);

  // Category breakdown for report month
  const topCategories = useMemo(() => {
    const expenseTx = monthTransactions.filter((t) => t.type === 'expense');
    const totalExp = expenseTx.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const map = new Map<string, { amount: number; count: number }>();

    expenseTx.forEach((tx) => {
      const current = map.get(tx.categoryId) || { amount: 0, count: 0 };
      map.set(tx.categoryId, {
        amount: current.amount + (Number(tx.amount) || 0),
        count: current.count + 1,
      });
    });

    const list = Array.from(map.entries()).map(([catId, data]) => {
      const category = categories.find((c) => c.id === catId) || {
        id: catId,
        name: 'Sin Categoría',
        icon: 'HelpCircle',
        color: '#94a3b8',
        type: 'expense' as const,
      };
      const percentage = totalExp > 0 ? Math.round((data.amount / totalExp) * 100) : 0;
      return {
        category,
        amount: data.amount,
        percentage,
        count: data.count,
      };
    });

    return list.sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [monthTransactions, categories]);

  // 50/30/20 Rule Analysis for report month
  const rule503020 = useMemo(() => {
    const needsCategories = ['cat-vivienda', 'cat-servicios', 'cat-alimentacion', 'cat-transporte', 'cat-salud'];
    let needs = 0;
    let wants = 0;

    monthTransactions.forEach((tx) => {
      if (tx.type === 'expense') {
        const amt = Number(tx.amount) || 0;
        if (needsCategories.includes(tx.categoryId)) {
          needs += amt;
        } else {
          wants += amt;
        }
      }
    });

    const income = totalIncome > 0 ? totalIncome : totalExpenses;
    const needsPct = income > 0 ? Math.round((needs / income) * 100) : 0;
    const wantsPct = income > 0 ? Math.round((wants / income) * 100) : 0;
    const savingsPct = income > 0 ? Math.max(0, 100 - needsPct - wantsPct) : 0;

    let diagnosis = 'Excelente salud financiera: gastaste dentro de los márgenes y lograste un buen margen de ahorro.';
    let status: 'optimal' | 'warning' | 'alert' = 'optimal';

    if (needsPct > 60) {
      diagnosis = 'Atención: Los gastos básicos consumieron más del 60% de tus ingresos. Evalúa reducir costos fijos.';
      status = 'warning';
    } else if (wantsPct > 35) {
      diagnosis = 'Alerta: Los gastos de entretenimiento y compras superaron el límite recomendado del 30%.';
      status = 'alert';
    }

    return { needs, wants, needsPct, wantsPct, savingsPct, diagnosis, status };
  }, [monthTransactions, totalIncome, totalExpenses]);

  // Recurring bills status
  const recurringSummary = useMemo(() => {
    let total = 0;
    let paid = 0;
    recurringExpenses.forEach((exp) => {
      total += exp.amount;
      const isPaid =
        exp.lastPaidMonth === reportMonth ||
        monthTransactions.some(
          (tx) =>
            tx.type === 'expense' &&
            tx.description.toLowerCase().trim() === exp.name.toLowerCase().trim()
        );
      if (isPaid) paid += exp.amount;
    });
    return { total, paid, pending: Math.max(0, total - paid) };
  }, [recurringExpenses, reportMonth, monthTransactions]);

  // Debts summary
  const debtsSummary = useMemo(() => {
    let lent = 0;
    let borrowed = 0;
    debtsLoans.forEach((d) => {
      if (d.status === 'pending') {
        if (d.type === 'lent') lent += d.amount;
        if (d.type === 'borrowed') borrowed += d.amount;
      }
    });
    return { lent, borrowed, net: lent - borrowed };
  }, [debtsLoans]);

  // Handle Print Action
  const handlePrint = () => {
    window.print();
  };

  const currentDate = useMemo(() => {
    return format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es });
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[96vw] max-w-5xl sm:max-w-5xl lg:max-w-6xl max-h-[92vh] overflow-y-auto p-0 border-border/80 shadow-2xl rounded-2xl">
        {/* Modal Header & Controls (Screen only) */}
        <div className="no-print p-4 sm:p-5 bg-card/95 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">Reporte Ejecutivo Mensual</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Informe formal de finanzas listo para imprimir o guardar como PDF
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            {/* Month Picker */}
            <select
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="bg-muted text-foreground text-xs font-semibold rounded-lg border border-input px-3 py-1.5 focus:outline-none cursor-pointer h-9"
            >
              {availableMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <Button
              onClick={handlePrint}
              size="sm"
              className="gap-1.5 cursor-pointer font-semibold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3.5 text-xs"
            >
              <Printer className="size-4" />
              <span>Imprimir / PDF</span>
            </Button>
          </div>
        </div>

        {/* Printable Report Canvas */}
        <div className="printable-report w-full p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-8 bg-card text-foreground print:bg-white print:text-zinc-900 print:p-8 mx-auto">
          {/* Executive Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-primary/20 pb-5 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs print:border print:border-zinc-800">
                  <Wallet className="size-4" />
                </div>
                <h1 className="text-xl font-extrabold tracking-tight">Finanza Pro</h1>
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0">
                  Reporte Mensual
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground print:text-zinc-500">
                Sistema Personal de Control Financiero y Gastos
              </p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-0.5">
              <p className="font-bold text-sm text-foreground print:text-zinc-900 uppercase tracking-wide">
                {monthLabel}
              </p>
              <p className="text-muted-foreground print:text-zinc-500">
                Titular: <strong className="text-foreground print:text-zinc-800">{settings.userName}</strong>
              </p>
              <p className="text-muted-foreground print:text-zinc-500">
                Emisión: {currentDate}
              </p>
            </div>
          </div>

          {/* Key Financial KPIs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 page-break-avoid">
            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 print:bg-zinc-50 print:border-zinc-200">
              <span className="text-[11px] font-medium text-emerald-500 uppercase tracking-wider block mb-1">
                Ingresos del Mes
              </span>
              <p className="text-xl font-extrabold text-foreground print:text-zinc-900">
                {formatCurrency(totalIncome)}
              </p>
              <span className="text-[10px] text-muted-foreground print:text-zinc-500">
                {monthTransactions.filter((t) => t.type === 'income').length} depósitos registrados
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 print:bg-zinc-50 print:border-zinc-200">
              <span className="text-[11px] font-medium text-rose-500 uppercase tracking-wider block mb-1">
                Gastos del Mes
              </span>
              <p className="text-xl font-extrabold text-foreground print:text-zinc-900">
                {formatCurrency(totalExpenses)}
              </p>
              <span className="text-[10px] text-muted-foreground print:text-zinc-500">
                {monthTransactions.filter((t) => t.type === 'expense').length} salidas registradas
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 print:bg-zinc-50 print:border-zinc-200">
              <span className="text-[11px] font-medium text-cyan-500 uppercase tracking-wider block mb-1">
                Balance Neto
              </span>
              <p
                className={`text-xl font-extrabold ${
                  netBalance >= 0 ? 'text-emerald-500 print:text-emerald-700' : 'text-rose-500 print:text-rose-700'
                }`}
              >
                {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
              </p>
              <span className="text-[10px] text-muted-foreground print:text-zinc-500">
                {netBalance >= 0 ? 'Superávit favorable' : 'Déficit de flujo'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 print:bg-zinc-50 print:border-zinc-200">
              <span className="text-[11px] font-medium text-primary uppercase tracking-wider block mb-1">
                Tasa de Ahorro
              </span>
              <p className="text-xl font-extrabold text-foreground print:text-zinc-900">
                {savingsRate}%
              </p>
              <span className="text-[10px] text-muted-foreground print:text-zinc-500">
                Meta recomendada: 20%+
              </span>
            </div>
          </div>

          {/* 50/30/20 Diagnostic & Health Check */}
          <div className="p-4 rounded-xl border border-border/70 bg-muted/15 space-y-3 page-break-avoid print:bg-zinc-50 print:border-zinc-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="size-4 text-primary" />
                <h3 className="text-sm font-bold tracking-tight">
                  Diagnóstico de Presupuesto 50 / 30 / 20
                </h3>
              </div>
              <Badge
                variant="outline"
                className={`text-xs font-semibold ${
                  rule503020.status === 'optimal'
                    ? 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10'
                    : rule503020.status === 'warning'
                    ? 'border-amber-500/40 text-amber-500 bg-amber-500/10'
                    : 'border-rose-500/40 text-rose-500 bg-rose-500/10'
                }`}
              >
                {rule503020.status === 'optimal'
                  ? 'Saludable'
                  : rule503020.status === 'warning'
                  ? 'Atención'
                  : 'Desbalance'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Necesidades */}
              <div className="p-2.5 rounded-lg border border-border/50 bg-background/50 print:bg-white">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Necesidades (Meta 50%)</span>
                  <strong className="font-mono">{rule503020.needsPct}%</strong>
                </div>
                <p className="text-sm font-bold text-foreground print:text-zinc-900 mt-1">
                  {formatCurrency(rule503020.needs)}
                </p>
                <div className="w-full bg-muted rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, rule503020.needsPct)}%` }}
                  />
                </div>
              </div>

              {/* Deseos */}
              <div className="p-2.5 rounded-lg border border-border/50 bg-background/50 print:bg-white">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Deseos & Ocio (Meta 30%)</span>
                  <strong className="font-mono">{rule503020.wantsPct}%</strong>
                </div>
                <p className="text-sm font-bold text-foreground print:text-zinc-900 mt-1">
                  {formatCurrency(rule503020.wants)}
                </p>
                <div className="w-full bg-muted rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, rule503020.wantsPct)}%` }}
                  />
                </div>
              </div>

              {/* Ahorro */}
              <div className="p-2.5 rounded-lg border border-border/50 bg-background/50 print:bg-white">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Ahorro / Excedente (Meta 20%)</span>
                  <strong className="font-mono text-emerald-500">{rule503020.savingsPct}%</strong>
                </div>
                <p className="text-sm font-bold text-emerald-500 print:text-emerald-700 mt-1">
                  {formatCurrency(Math.max(0, netBalance))}
                </p>
                <div className="w-full bg-muted rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, rule503020.savingsPct)}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground print:text-zinc-600 italic pt-1">
              Diagnóstico: {rule503020.diagnosis}
            </p>
          </div>

          {/* Top 5 Categories & Recurring Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 page-break-avoid">
            {/* Top Categories */}
            <div className="p-4 rounded-xl border border-border/70 bg-muted/10 space-y-3 print:bg-zinc-50 print:border-zinc-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-zinc-600">
                Top Gastos por Categoría
              </h3>

              {topCategories.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">Sin gastos registrados este mes.</p>
              ) : (
                <div className="space-y-2.5">
                  {topCategories.map((item) => (
                    <div key={item.category.id} className="text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground print:text-zinc-800">
                          {item.category.name}
                        </span>
                        <div className="space-x-1.5 font-mono">
                          <span className="font-bold">{formatCurrency(item.amount)}</span>
                          <span className="text-muted-foreground">({item.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.category.color || '#3b82f6',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Commitments & Debts Snapshot */}
            <div className="p-4 rounded-xl border border-border/70 bg-muted/10 space-y-3 print:bg-zinc-50 print:border-zinc-200 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-zinc-600 mb-2.5">
                  Obligaciones y Deudas Activas
                </h3>

                <div className="space-y-2 text-xs">
                  {/* Recurring Bills */}
                  <div className="p-2.5 rounded-lg border border-border/50 bg-background/50 print:bg-white flex items-center justify-between">
                    <div>
                      <span className="text-foreground font-semibold flex items-center gap-1.5">
                        <Receipt className="size-3.5 text-amber-500" /> Gastos Fijos
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Pagado: {formatCurrency(recurringSummary.paid)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold">{formatCurrency(recurringSummary.total)}</p>
                      <span className="text-[10px] text-amber-500">
                        Pendiente: {formatCurrency(recurringSummary.pending)}
                      </span>
                    </div>
                  </div>

                  {/* Debts & Loans */}
                  <div className="p-2.5 rounded-lg border border-border/50 bg-background/50 print:bg-white flex items-center justify-between">
                    <div>
                      <span className="text-foreground font-semibold flex items-center gap-1.5">
                        <HandCoins className="size-3.5 text-primary" /> Deudas & Préstamos
                      </span>
                      <p className="text-[11px] text-emerald-500">
                        Me deben: {formatCurrency(debtsSummary.lent)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-amber-500">
                        Debo: {formatCurrency(debtsSummary.borrowed)}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        Neto: {formatCurrency(debtsSummary.net)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Execution progress */}
              <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                <span>Presupuesto mensual planeado:</span>
                <strong className="font-mono text-foreground print:text-zinc-800">
                  {formatCurrency(settings.monthlyBudget)} ({budgetUsagePercent}% consumido)
                </strong>
              </div>
            </div>
          </div>

          {/* Account Balances Summary */}
          <div className="p-4 rounded-xl border border-border/70 bg-muted/10 space-y-2.5 page-break-avoid print:bg-zinc-50 print:border-zinc-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-zinc-600 flex items-center gap-2">
              <Wallet className="size-3.5" /> Estado de Cuentas y Liquidez
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-2 rounded-lg border border-border/50 bg-background/50 print:bg-white text-xs"
                >
                  <p className="font-medium text-foreground print:text-zinc-800 truncate">{acc.name}</p>
                  <p className="font-mono font-bold text-xs mt-0.5">{formatCurrency(acc.balance)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Automatic Conclusions & Sign-off */}
          <div className="pt-4 border-t border-border/70 text-xs space-y-2 page-break-avoid">
            <h4 className="font-bold text-xs uppercase tracking-wider text-primary">
              Conclusiones Ejecutivas
            </h4>
            <ul className="space-y-1.5 text-muted-foreground print:text-zinc-700 list-disc list-inside">
              <li>
                {netBalance >= 0
                  ? `Cierre positivo de mes con un excedente de ${formatCurrency(netBalance)}, logrando una tasa de ahorro del ${savingsRate}%.`
                  : `El mes registró un déficit de ${formatCurrency(Math.abs(netBalance))}. Revisa gastos variables para restaurar el equilibrio.`}
              </li>
              <li>
                {budgetUsagePercent <= 100
                  ? `Consumo presupuestario controlado al ${budgetUsagePercent}% de la meta de ${formatCurrency(settings.monthlyBudget)}.`
                  : `Se sobrepasó el presupuesto en ${budgetUsagePercent - 100}% (${formatCurrency(totalExpenses - settings.monthlyBudget)}).`}
              </li>
              <li>
                {debtsSummary.lent > 0
                  ? `Tienes ${formatCurrency(debtsSummary.lent)} pendientes por cobrar a terceros.`
                  : 'No tienes préstamos pendientes por cobrar a terceros.'}
              </li>
            </ul>

            <div className="pt-6 flex items-center justify-between text-[10px] text-muted-foreground print:text-zinc-400">
              <p>Generado automáticamente por Finanza • Documento privado y confidencial</p>
              <p>Página 1 de 1</p>
            </div>
          </div>
        </div>

        {/* Modal Footer (Screen only) */}
        <DialogFooter className="no-print p-4 bg-card border-t border-border flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Cerrar
          </Button>
          <Button onClick={handlePrint} className="cursor-pointer font-semibold gap-1.5 shadow-xs">
            <Printer className="size-4" />
            <span>Imprimir / Descargar PDF</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
