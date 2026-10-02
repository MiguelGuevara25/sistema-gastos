"use client";

import React, { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Sparkles,
  Wallet,
  Activity,
} from "lucide-react";

export const CashFlowProjectionView: React.FC = () => {
  const { getCashFlowProjection, formatCurrency } = useFinance();
  const [horizonDays, setHorizonDays] = useState<30 | 60 | 90>(60);

  const projection = getCashFlowProjection(horizonDays);
  const {
    timeline,
    startingBalance,
    finalBalance,
    minBalance,
    minBalanceDate,
    isAlert,
    totalProjectedIncome,
    totalProjectedExpenses,
  } = projection;

  // Filter events that actually have financial activity
  const activeEventsTimeline = timeline.filter(
    (t) => t.income > 0 || t.expenses > 0 || t.events.length > 0,
  );

  // Chart scaling calculations
  const maxVal = Math.max(
    ...timeline.map((t) => t.balance),
    startingBalance,
    100,
  );
  const minVal = Math.min(...timeline.map((t) => t.balance), 0);
  const range = maxVal - minVal || 1;

  // Sample 8-12 points evenly for SVG chart
  const step = Math.max(1, Math.floor(timeline.length / 14));
  const chartPoints = timeline.filter((_, idx) => idx % step === 0 || idx === timeline.length - 1);

  return (
    <div className="space-y-6">
      {/* Header with Horizon Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="size-5 sm:size-6 text-primary" />
            Proyección de Flujo de Caja
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Anticípate al futuro: simulación día a día de tus ingresos esperados, compromisos fijos y cuotas
          </p>
        </div>

        {/* Horizon Selector */}
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/60 text-xs">
          <span className="text-[11px] font-medium text-muted-foreground px-2">
            Horizonte:
          </span>
          {([30, 60, 90] as const).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setHorizonDays(days)}
              className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
                horizonDays === days
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              {days} Días
            </button>
          ))}
        </div>
      </div>

      {/* Liquidity Alert Banner if applicable */}
      {isAlert && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              Alerta Preventiva de Liquidez
              <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                Atención Requerida
              </Badge>
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              En la fecha <strong className="text-foreground">{minBalanceDate}</strong> tu saldo disponible descenderá a{" "}
              <strong className="text-rose-400 font-mono font-bold">{formatCurrency(minBalance)}</strong>,
              comprometiendo tu colchón mínimo de seguridad. Te recomendamos postergar gastos prescindibles o adelantar cobros a deudores.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Saldo Inicial */}
        <Card className="border-border/80 p-3 sm:p-4 bg-card/60">
          <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
            <Wallet className="size-3.5 text-sky-400" /> Saldo Líquido Actual
          </p>
          <p className="text-lg sm:text-2xl font-bold font-mono text-foreground mt-1">
            {formatCurrency(startingBalance)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Punto de partida en cuentas
          </p>
        </Card>

        {/* Saldo Final Proyectado */}
        <Card className="border-border/80 p-3 sm:p-4 bg-card/60">
          <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-emerald-400" /> Saldo en {horizonDays} Días
          </p>
          <p
            className={`text-lg sm:text-2xl font-bold font-mono mt-1 ${
              finalBalance >= startingBalance ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {formatCurrency(finalBalance)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {finalBalance >= startingBalance
              ? `+${formatCurrency(finalBalance - startingBalance)} superávit`
              : `-${formatCurrency(startingBalance - finalBalance)} consumo neto`}
          </p>
        </Card>

        {/* Punto Mínimo de Liquidez */}
        <Card className="border-border/80 p-3 sm:p-4 bg-card/60">
          <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3.5 text-amber-400" /> Punto Más Crítico
          </p>
          <p
            className={`text-lg sm:text-2xl font-bold font-mono mt-1 ${
              minBalance < 200 ? "text-rose-400" : "text-foreground"
            }`}
          >
            {formatCurrency(minBalance)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Fecha: {minBalanceDate}
          </p>
        </Card>

        {/* Flujo Total Estimado */}
        <Card className="border-border/80 p-3 sm:p-4 bg-card/60">
          <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" /> Ingresos vs Gastos
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono font-bold text-emerald-400">
              +{formatCurrency(totalProjectedIncome)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-mono font-bold text-rose-400">
              -{formatCurrency(totalProjectedExpenses)}
            </span>
          </div>
        </Card>
      </div>

      {/* Projected Curve Chart */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                Curva de Liquidez Esperada ({horizonDays} Días)
              </CardTitle>
              <CardDescription className="text-xs">
                Evolución estimada de tu capital líquido día por día
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                Saldo Proyectado
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="h-56 w-full flex items-end gap-1 sm:gap-2 pt-6 pb-2 border-b border-border">
            {chartPoints.map((point, index) => {
              const heightPct = Math.max(
                6,
                Math.min(100, Math.round(((point.balance - minVal) / range) * 100)),
              );
              const isLow = point.balance < 200;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-popover text-popover-foreground border border-border px-2 py-1 rounded shadow-md text-[10px] whitespace-nowrap pointer-events-none">
                    <span className="font-bold">{point.dayLabel}</span>
                    <span className="font-mono text-primary font-semibold">
                      {formatCurrency(point.balance)}
                    </span>
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t transition-all ${
                      isLow
                        ? "bg-rose-500/80 group-hover:bg-rose-400"
                        : "bg-primary/80 group-hover:bg-primary"
                    }`}
                  />
                  <span className="text-[9px] text-muted-foreground mt-2 truncate w-full text-center">
                    {point.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Scheduled Financial Events */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            Cronograma de Compromisos & Entradas
          </CardTitle>
          <CardDescription className="text-xs">
            Hitos financieros programados que impactarán tu saldo en los próximos {horizonDays} días
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4 space-y-2.5">
          {activeEventsTimeline.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-80" />
              <p>No hay eventos extraordinarios programados en esta ventana de tiempo.</p>
            </div>
          ) : (
            activeEventsTimeline.slice(0, 15).map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-border/50 bg-background/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-border transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 shrink-0 font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="size-3 text-muted-foreground" />
                    <span>{item.dayLabel}</span>
                  </div>
                  <div className="space-y-0.5">
                    {item.events.map((ev, evIdx) => (
                      <p key={evIdx} className="text-muted-foreground">
                        {ev}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <div className="flex items-center gap-2 font-mono">
                    {item.income > 0 && (
                      <span className="text-emerald-400 font-bold flex items-center">
                        <ArrowUpRight className="size-3 mr-0.5" />
                        +{formatCurrency(item.income)}
                      </span>
                    )}
                    {item.expenses > 0 && (
                      <span className="text-rose-400 font-bold flex items-center">
                        <ArrowDownLeft className="size-3 mr-0.5" />
                        -{formatCurrency(item.expenses)}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">
                      Saldo resultante
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(item.balance)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
