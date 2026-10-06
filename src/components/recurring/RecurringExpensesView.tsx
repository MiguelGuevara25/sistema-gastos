"use client";

import React, { useState, useMemo } from "react";
import { useFinance } from "../../context/FinanceContext";
import { RecurringExpense } from "../../types/finance";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  Clock,
  Receipt,
} from "lucide-react";
import { RecurringExpensesCard } from "./components/RecurringExpensesCard";
import { RecurringExpenseModal } from "./components/RecurringExpenseModal";
import { PayRecurringExpenseModal } from "./components/PayRecurringExpenseModal";
import { format, getDate } from "date-fns";

export const RecurringExpensesView: React.FC = () => {
  const {
    recurringExpenses,
    totalRecurringMonthly,
    recurringPaidThisMonth,
    recurringPendingThisMonth,
    categories,
    accounts,
    selectedMonth,
    formatCurrency,
    transactions,
  } = useFinance();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(
    null,
  );
  const [payingExpense, setPayingExpense] = useState<RecurringExpense | null>(
    null,
  );

  // Filter state
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">(
    "all",
  );

  const currentMonthKey = useMemo(() => {
    return format(new Date(), "yyyy-MM");
  }, []);

  const activeMonthKey =
    selectedMonth === "all" ? currentMonthKey : selectedMonth;

  // Percentage of fixed expenses paid this month
  const paidPercent =
    totalRecurringMonthly > 0
      ? Math.round((recurringPaidThisMonth / totalRecurringMonthly) * 100)
      : 0;

  // Helper to check if a recurring expense was paid in the active month
  const isExpensePaidThisMonth = React.useCallback(
    (exp: RecurringExpense) => {
      if (exp.lastPaidMonth === activeMonthKey) return true;
      return transactions.some(
        (tx) =>
          tx.type === "expense" &&
          tx.description.toLowerCase().trim() === exp.name.toLowerCase().trim(),
      );
    },
    [activeMonthKey, transactions],
  );

  // Find next upcoming bill
  const nextUpcomingBill = useMemo(() => {
    const todayDay = getDate(new Date());
    const pendingBills = recurringExpenses.filter(
      (e) => !isExpensePaidThisMonth(e),
    );
    if (pendingBills.length === 0) return null;

    // Sort by proximity to current day
    const sorted = [...pendingBills].sort((a, b) => {
      const diffA = (a.dueDay - todayDay + 31) % 31;
      const diffB = (b.dueDay - todayDay + 31) % 31;
      return diffA - diffB;
    });

    return sorted[0];
  }, [recurringExpenses, isExpensePaidThisMonth]);

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (exp: RecurringExpense) => {
    setEditingExpense(exp);
    setIsAddModalOpen(true);
  };

  const handleOpenPayModal = (exp: RecurringExpense) => {
    setPayingExpense(exp);
  };

  // Filtered list
  const filteredList = useMemo(() => {
    return recurringExpenses.filter((exp) => {
      const isPaid = isExpensePaidThisMonth(exp);
      if (statusFilter === "pending") return !isPaid;
      if (statusFilter === "paid") return isPaid;
      return true;
    });
  }, [recurringExpenses, statusFilter, isExpensePaidThisMonth]);

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monthly Commitment */}
        <Card className="p-4 bg-muted/20 border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Gastos Fijos del Mes
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Receipt className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {formatCurrency(totalRecurringMonthly)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {recurringExpenses.length} servicios y obligaciones fijas
          </p>
        </Card>

        {/* Paid this month */}
        <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">
              Ya Pagado Este Mes
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            {formatCurrency(recurringPaidThisMonth)}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Progress value={paidPercent} className="h-1.5 w-16 bg-muted/60" />
            <span className="text-[11px] text-muted-foreground">
              {paidPercent}% cubierto
            </span>
          </div>
        </Card>

        {/* Pending this month */}
        <Card className="p-4 bg-muted/20 border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Pendiente por Pagar
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">
            {formatCurrency(recurringPendingThisMonth)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Dinero que debes reservar este mes
          </p>
        </Card>

        {/* Next upcoming bill */}
        <Card className="p-4 bg-muted/20 border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Próximo Vencimiento
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <CalendarClock className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-base font-bold text-foreground truncate">
            {nextUpcomingBill ? nextUpcomingBill.name : "¡Todo al día! 🎉"}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {nextUpcomingBill
              ? `Vence el día ${nextUpcomingBill.dueDay} (${formatCurrency(nextUpcomingBill.amount)})`
              : "Sin recibos pendientes este mes"}
          </p>
        </Card>
      </div>

      {/* Main Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {/* Status Tabs / Pills */}
          <div className="flex items-center bg-muted/40 p-1 rounded-lg border border-border text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                statusFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos ({recurringExpenses.length})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                statusFilter === "pending"
                  ? "bg-amber-500/20 text-amber-400 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setStatusFilter("paid")}
              className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                statusFilter === "paid"
                  ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pagados
            </button>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleOpenAddModal}
          className="cursor-pointer gap-1.5 shadow-xs font-semibold h-9"
        >
          <Plus className="size-3.5" />
          Nuevo Gasto Fijo
        </Button>
      </div>

      {/* List of Recurring Expenses */}
      {filteredList.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center border-dashed border-border/80">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Receipt className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No hay gastos fijos registrados</h3>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto">
            Registra tus servicios mensuales recurrentes como alquiler, luz, internet o suscripciones para monitorear sus vencimientos.
          </p>
          <Button
            size="sm"
            onClick={handleOpenAddModal}
            className="mt-4 gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Plus className="size-3.5" />
            Crear mi primer gasto fijo
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((exp) => {
            const isPaid = isExpensePaidThisMonth(exp);
            const category = categories.find((c) => c.id === exp.categoryId) || {
              name: "General",
              icon: "Receipt",
              color: "#94a3b8",
            };
            const account = accounts.find((a) => a.id === exp.accountId);

            return (
              <RecurringExpensesCard
                key={exp.id}
                isPaid={isPaid}
                exp={exp}
                category={category}
                account={account}
                handleOpenPayModal={handleOpenPayModal}
                handleOpenEditModal={handleOpenEditModal}
              />
            );
          })}
        </div>
      )}

      {/* Add / Edit Recurring Expense Modal */}
      <RecurringExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
        }}
        expenseToEdit={editingExpense}
      />

      {/* Execute Payment Modal */}
      <PayRecurringExpenseModal
        isOpen={Boolean(payingExpense)}
        onClose={() => setPayingExpense(null)}
        expense={payingExpense}
        activeMonthKey={activeMonthKey}
      />
    </div>
  );
};
