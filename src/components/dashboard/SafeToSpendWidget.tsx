"use client";

import React, { useMemo } from "react";
import { useFinance } from "../../context/FinanceContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Calendar,
  Sparkles,
  Zap,
} from "lucide-react";
import { getDaysInMonth, getDate, getDay, format } from "date-fns";

export const SafeToSpendWidget: React.FC = () => {
  const {
    settings,
    totalExpenses,
    recurringPendingThisMonth,
    formatCurrency,
    transactions,
    convertAmount,
  } = useFinance();

  const metrics = useMemo(() => {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    const totalDaysInMonth = getDaysInMonth(today);
    const currentDay = getDate(today);

    // Days left including today
    const daysLeftInMonth = Math.max(1, totalDaysInMonth - currentDay + 1);

    // Days left in current week (Monday to Sunday)
    const dayOfWeek = getDay(today); // 0 = Sunday, 1 = Monday...
    const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    const daysLeftInWeek = Math.max(1, 7 - normalizedDay + 1);

    // Monthly budget & commitments
    const budget = settings.monthlyBudget || 0;
    const commitments = recurringPendingThisMonth || 0;

    // Remaining variable pool after expenses and pending fixed bills
    const remainingPool = Math.max(0, budget - totalExpenses - commitments);

    const safePerDay = daysLeftInMonth > 0 ? remainingPool / daysLeftInMonth : 0;
    const safeThisWeek = safePerDay * daysLeftInWeek;

    // Real expenses recorded for TODAY
    const spentToday = transactions
      .filter((t) => t.type === "expense" && t.date === todayStr)
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency), 0);

    const hasSpentToday = spentToday > 0;
    const isTodayOverspent = hasSpentToday && spentToday > safePerDay;
    const remainingToday = Math.max(0, safePerDay - spentToday);

    // Daily spending pace so far this month
    const dailyPace = currentDay > 0 ? totalExpenses / currentDay : 0;

    // Health verdict
    let status: "healthy" | "warning" | "exceeded" = "healthy";
    let statusText = "Ritmo Saludable 🟢";
    let statusTip =
      "Tu ritmo de gasto está bajo control. Si mantienes esta pauta, cerrarás el mes con ahorro positivo.";

    if (budget > 0 && totalExpenses >= budget) {
      status = "exceeded";
      statusText = "Presupuesto al Límite 🔴";
      statusTip =
        "Has alcanzado el límite presupuestado para este mes. Te sugerimos congelar gastos no esenciales.";
    } else if (safePerDay > 0 && dailyPace > safePerDay * 1.25) {
      status = "warning";
      statusText = "Ritmo Acelerado 🟡";
      statusTip = `Estás gastando un promedio de ${formatCurrency(
        dailyPace,
      )}/día. Tu ritmo seguro recomendado es ${formatCurrency(
        safePerDay,
      )}/día.`;
    }

    // Dynamic styling for "Disponible seguro para HOY" card
    let todayTheme = {
      badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      valueClass: "text-emerald-400",
      label: "Límite diario",
    };

    if (status === "exceeded" || safePerDay <= 0) {
      todayTheme = {
        badgeClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        valueClass: "text-rose-400",
        label: "Límite agotado",
      };
    } else if (isTodayOverspent || status === "warning") {
      todayTheme = {
        badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        valueClass: "text-amber-400",
        label: isTodayOverspent ? "Límite de hoy superado" : "Ritmo acelerado",
      };
    }

    return {
      safePerDay,
      safeThisWeek,
      daysLeftInMonth,
      daysLeftInWeek,
      commitments,
      remainingPool,
      dailyPace,
      spentToday,
      hasSpentToday,
      isTodayOverspent,
      remainingToday,
      status,
      statusText,
      statusTip,
      todayTheme,
    };
  }, [
    settings.monthlyBudget,
    totalExpenses,
    recurringPendingThisMonth,
    formatCurrency,
    transactions,
    convertAmount,
  ]);

  if (settings.monthlyBudget <= 0) {
    return null;
  }

  return (
    <Card className="p-4 sm:p-5 border-border/80 bg-gradient-to-br from-background via-muted/20 to-muted/40 shadow-xs relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Zap className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-foreground">
                Presupuesto Inteligente & Ritmo Diario
              </h3>
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold px-2 py-0 ${
                  metrics.status === "healthy"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : metrics.status === "warning"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}
              >
                {metrics.statusText}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Cálculo dinámico descontando tus gastos fijos y días restantes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-primary" />
            <span>
              Quedan <strong>{metrics.daysLeftInMonth} días</strong> de mes
            </span>
          </div>
        </div>
      </div>

      {/* Main Metric Cards: Safe Today & Safe This Week */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3.5">
        {/* Seguro para Gastar Hoy */}
        <div className="p-3.5 rounded-xl bg-background border border-border/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">
              Disponible seguro para HOY
            </span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${metrics.todayTheme.badgeClass}`}
            >
              {metrics.todayTheme.label}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl sm:text-2xl font-bold font-mono ${metrics.todayTheme.valueClass}`}
            >
              {formatCurrency(metrics.safePerDay)}
            </span>
            <span className="text-[11px] text-muted-foreground">/ día</span>
          </div>
          {metrics.hasSpentToday ? (
            <div className="text-[10px] text-muted-foreground leading-tight space-y-0.5 pt-0.5">
              <p>
                Gastado hoy:{" "}
                <strong
                  className={
                    metrics.isTodayOverspent
                      ? "text-amber-400 font-bold"
                      : "text-foreground font-semibold"
                  }
                >
                  {formatCurrency(metrics.spentToday)}
                </strong>
              </p>
              {metrics.isTodayOverspent ? (
                <p className="text-amber-400 font-semibold flex items-center gap-1">
                  <span>⚠️</span>
                  <span>
                    Excediste tu cupo de hoy en +
                    {formatCurrency(metrics.spentToday - metrics.safePerDay)}
                  </span>
                </p>
              ) : (
                <p className="text-emerald-400 font-medium">
                  ✓ Te restan {formatCurrency(metrics.remainingToday)} para hoy
                </p>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground leading-tight">
              Gasto variable recomendado sin comprometer tus ahorros.
            </p>
          )}
        </div>

        {/* Seguro para Esta Semana */}
        <div className="p-3.5 rounded-xl bg-background border border-border/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">
              Disponible para ESTA SEMANA
            </span>
            <span className="text-[10px] text-primary font-semibold bg-primary/10 px-1.5 py-0.5 rounded">
              {metrics.daysLeftInWeek} días restantes
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {formatCurrency(metrics.safeThisWeek)}
            </span>
            <span className="text-[11px] text-muted-foreground">/ semana</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">
            Margen de maniobra acumulado hasta el próximo domingo.
          </p>
        </div>

        {/* Compromisos & Respaldo */}
        <div className="p-3.5 rounded-xl bg-background border border-border/80 shadow-2xs space-y-1 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">
              Compromisos fijos protegidos
            </span>
            <ShieldCheck className="size-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-blue-400">
              {formatCurrency(metrics.commitments)}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">
            Recibos, alquiler y suscripciones pendientes que no se tocan.
          </p>
        </div>
      </div>

      {/* Tip Banner */}
      <div className="mt-3 p-2.5 rounded-lg bg-muted/40 border border-border/60 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Sparkles className="size-3.5 text-amber-400 shrink-0" />
        <span className="leading-tight">{metrics.statusTip}</span>
      </div>
    </Card>
  );
};
