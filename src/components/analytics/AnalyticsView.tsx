"use client";

import { useMemo } from "react";
import { useFinance } from "../../context/FinanceContext";
import { CategoryIcon } from "../ui/CategoryIcon";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Percent, Calendar, CreditCard, Award, Layers } from "lucide-react";
import { PAYMENT_METHOD_LABELS } from "../../data/categories";
import { PhantomExpensesCard } from "./PhantomExpensesCard";

export const AnalyticsView: React.FC = () => {
  const {
    transactions,
    categoryBreakdown,
    totalExpenses,
    savingsRate,
    formatCurrency,
  } = useFinance();

  const expenseTx = useMemo(
    () => transactions.filter((t) => t.type === "expense"),
    [transactions],
  );

  // Daily average
  const dailyAverage = useMemo(() => {
    if (expenseTx.length === 0) return 0;
    return totalExpenses / 30;
  }, [totalExpenses, expenseTx]);

  // Highest transaction
  const highestExpense = useMemo(() => {
    if (expenseTx.length === 0) return null;
    return expenseTx.reduce(
      (max, curr) => (curr.amount > max.amount ? curr : max),
      expenseTx[0],
    );
  }, [expenseTx]);

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    expenseTx.forEach((tx) => {
      if (!map[tx.paymentMethod]) {
        map[tx.paymentMethod] = { amount: 0, count: 0 };
      }
      map[tx.paymentMethod].amount += tx.amount;
      map[tx.paymentMethod].count += 1;
    });

    return Object.entries(map)
      .map(([method, data]) => ({
        method,
        label: PAYMENT_METHOD_LABELS[method] || method,
        amount: data.amount,
        count: data.count,
        percentage:
          totalExpenses > 0
            ? Math.round((data.amount / totalExpenses) * 100)
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenseTx, totalExpenses]);

  return (
    <div className="space-y-6">
      {/* Top 3 Analytical Highlights with shadcn Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Savings Rate */}
        <Card className="p-4 space-y-2">
          <CardHeader className="p-0 flex flex-row items-center justify-between pb-1 space-y-0">
            <span className="text-xs font-medium text-muted-foreground">
              Tasa de Ahorro Neta
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Percent className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-1">
            <div className="text-2xl font-bold text-emerald-400">
              {savingsRate}%
            </div>
            <p className="text-[11px] text-muted-foreground">
              Porcentaje de tus ingresos conservados tras gastos
            </p>
          </CardContent>
        </Card>

        {/* Daily Average */}
        <Card className="p-4 space-y-2">
          <CardHeader className="p-0 flex flex-row items-center justify-between pb-1 space-y-0">
            <span className="text-xs font-medium text-muted-foreground">
              Gasto Diario Estimado
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Calendar className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-1">
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(dailyAverage)}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Promedio diario en un periodo de 30 días
            </p>
          </CardContent>
        </Card>

        {/* Highest Expense */}
        <Card className="p-4 space-y-2">
          <CardHeader className="p-0 flex flex-row items-center justify-between pb-1 space-y-0">
            <span className="text-xs font-medium text-muted-foreground">
              Gasto Más Alto
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Award className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-1">
            <div className="text-2xl font-bold text-foreground truncate">
              {highestExpense
                ? formatCurrency(highestExpense.amount)
                : "S/. 0.00"}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {highestExpense
                ? highestExpense.description
                : "Sin gastos registrados"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detector de Gastos Hormiga & Fugas Silenciosas */}
      <PhantomExpensesCard />

      {/* Payment Methods and Category Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment Methods Breakdown */}
        <Card className="lg:col-span-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="size-4 text-muted-foreground" />
              Gastos por Método de Pago
            </CardTitle>
            <CardDescription className="text-xs">
              Formas de pago más utilizadas
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            {paymentBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No hay registros.
              </p>
            ) : (
              <div className="space-y-4">
                {paymentBreakdown.map((item) => (
                  <div key={item.method} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">
                        {item.label}
                      </span>
                      <span className="font-bold text-foreground">
                        {formatCurrency(item.amount)}{" "}
                        <span className="text-[11px] font-normal text-muted-foreground">
                          ({item.percentage}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border">
                      <div
                        className="h-full bg-primary/70 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Category Table using shadcn Table */}
        <Card className="lg:col-span-7">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="size-4 text-muted-foreground" />
              Desglose Completo de Categorías
            </CardTitle>
            <CardDescription className="text-xs">
              Ticket promedio y peso porcentual
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No hay datos registrados.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Movimientos</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Ticket Prom.</TableHead>
                    <TableHead className="text-right">% Gasto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryBreakdown.map((item) => {
                    const avgTicket =
                      item.count > 0 ? item.amount / item.count : 0;
                    return (
                      <TableRow key={item.category.id}>
                        <TableCell className="py-2.5 font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: `${item.category.color}20`,
                              }}
                            >
                              <CategoryIcon
                                name={item.category.icon}
                                color={item.category.color}
                                size={13}
                              />
                            </div>
                            <span className="text-foreground">
                              {item.category.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.count}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(avgTicket)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className="font-semibold text-[11px] px-1.5 py-0"
                          >
                            {item.percentage}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
