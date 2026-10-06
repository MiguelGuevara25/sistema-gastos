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
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  Award,
} from "lucide-react";

export const DebtStrategySimulator: React.FC = () => {
  const { calculateDebtStrategy, formatCurrency } = useFinance();
  const [extraPayment, setExtraPayment] = useState<number>(150);
  const [selectedMethod, setSelectedMethod] = useState<"snowball" | "avalanche">(
    "avalanche",
  );

  const strategy = calculateDebtStrategy(extraPayment);
  const { snowball, avalanche, interestSaved } = strategy;

  const activePlan =
    selectedMethod === "snowball" ? snowball.plan : avalanche.plan;

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                Simulador de Salida de Deudas
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Compara los métodos probados de aceleración: Bola de Nieve vs Avalancha
              </CardDescription>
            </div>

            {/* Extra Monthly Payment input */}
            <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-xl border border-border/60">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                Aporte extra mensual:
              </span>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(Number(e.target.value) || 0)}
                  className="h-8 w-28 text-xs font-mono font-bold pr-2"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Destinar un monto adicional fijo cada mes (más allá de los pagos mínimos) activa el
            efecto multiplicador: a medida que cancelas una deuda, ese dinero se suma al pago de la siguiente.
          </p>
        </CardContent>
      </Card>

      {/* Side by Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Avalancha Card */}
        <div
          onClick={() => setSelectedMethod("avalanche")}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            selectedMethod === "avalanche"
              ? "border-emerald-500/60 bg-emerald-500/5 ring-1 ring-emerald-500/20 shadow-xs"
              : "border-border/70 bg-card hover:border-border"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <Zap className="size-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  Método Avalancha
                  <Badge className="bg-emerald-500 text-white text-[10px] font-semibold">
                    Recomendado Matemáticamente
                  </Badge>
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Ataca primero la deuda con mayor tasa de interés (APR)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border/50">
            <div>
              <p className="text-[11px] text-muted-foreground">Tiempo estimado</p>
              <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                {avalanche.months} meses
              </p>
              <p className="text-[10px] text-muted-foreground">
                Libre en {avalanche.payoffDate}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Intereses totales</p>
              <p className="text-base font-bold font-mono text-foreground mt-0.5">
                {formatCurrency(avalanche.totalInterest)}
              </p>
              <p className="text-[10px] text-emerald-400 font-medium">
                {interestSaved > 0
                  ? `Ahorras ${formatCurrency(interestSaved)} vs Bola de Nieve`
                  : "Mínimo costo financiero"}
              </p>
            </div>
          </div>
        </div>

        {/* Bola de Nieve Card */}
        <div
          onClick={() => setSelectedMethod("snowball")}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            selectedMethod === "snowball"
              ? "border-sky-500/60 bg-sky-500/5 ring-1 ring-sky-500/20 shadow-xs"
              : "border-border/70 bg-card hover:border-border"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold">
                <Layers className="size-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  Método Bola de Nieve
                  <Badge variant="secondary" className="text-[10px]">
                    Victorias Rápidas
                  </Badge>
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Ataca primero la deuda de menor saldo total
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border/50">
            <div>
              <p className="text-[11px] text-muted-foreground">Tiempo estimado</p>
              <p className="text-base font-bold font-mono text-sky-400 mt-0.5">
                {snowball.months} meses
              </p>
              <p className="text-[10px] text-muted-foreground">
                Libre en {snowball.payoffDate}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Intereses totales</p>
              <p className="text-base font-bold font-mono text-foreground mt-0.5">
                {formatCurrency(snowball.totalInterest)}
              </p>
              <p className="text-[10px] text-sky-400 font-medium">
                Ideal para motivación psicológica
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Plan & Order of Attack */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Award className="size-4 text-primary" />
                Orden de Ataque: Plan {selectedMethod === "avalanche" ? "Avalancha" : "Bola de Nieve"}
              </CardTitle>
              <CardDescription className="text-xs">
                Secuencia estratégica en la que debes liquidar cada compromiso
              </CardDescription>
            </div>

            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50 text-xs">
              <button
                type="button"
                onClick={() => setSelectedMethod("avalanche")}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                  selectedMethod === "avalanche"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Avalancha
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("snowball")}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                  selectedMethod === "snowball"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Bola de Nieve
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-3">
          {activePlan.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              <ShieldCheck className="w-10 h-10 mx-auto text-emerald-400 mb-2 opacity-80" />
              <p className="font-semibold text-foreground">¡Estás al día con tus deudas!</p>
              <p className="mt-1">No tienes deudas pendientes de pago ni saldos negativos en tarjetas.</p>
            </div>
          ) : (
            activePlan.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3.5 rounded-xl border border-border/60 bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {item.personName}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>Mínimo: {formatCurrency(item.minimumPayment)}/mes</span>
                      <span>&bull;</span>
                      <span className="text-amber-400 font-medium">
                        Tasa: {item.interestRate}% APR
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs shrink-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[11px] text-muted-foreground">Meta de liquidación</p>
                    <p className="font-mono font-bold text-emerald-400">
                      Mes {item.monthsToPay}
                    </p>
                  </div>
                  <Badge
                    variant={idx === 0 ? "default" : "outline"}
                    className="text-[10px] uppercase font-bold"
                  >
                    {idx === 0 ? "🎯 Enfoque Actual" : `Paso #${idx + 1}`}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
