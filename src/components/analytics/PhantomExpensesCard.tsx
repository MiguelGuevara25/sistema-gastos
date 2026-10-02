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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ShieldAlert,
  Flame,
  Sparkles,
  TrendingDown,
  Coffee,
  HelpCircle,
  SlidersHorizontal,
  Check,
} from "lucide-react";

export const PhantomExpensesCard: React.FC = () => {
  const {
    phantomExpensesSummary,
    settings,
    updateSettings,
    formatCurrency,
  } = useFinance();

  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(
    (settings.phantomExpenseThreshold || 20).toString(),
  );

  const handleSaveThreshold = () => {
    const val = parseFloat(tempThreshold);
    if (!isNaN(val) && val > 0) {
      updateSettings({ phantomExpenseThreshold: val });
    }
    setIsEditingThreshold(false);
  };

  const {
    total,
    count,
    percentage,
    annualProjection,
    annualSavings50,
    topDescriptions,
  } = phantomExpensesSummary;

  return (
    <Card className="border-border/80 shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <ShieldAlert className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                Detector de Gastos Hormiga
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-medium"
                >
                  {percentage}% de tus gastos
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Micro-compras (&le; {formatCurrency(settings.phantomExpenseThreshold || 20)}) que pasan desapercibidas
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditingThreshold ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Límite:</span>
                <Input
                  type="number"
                  value={tempThreshold}
                  onChange={(e) => setTempThreshold(e.target.value)}
                  className="h-7 w-20 text-xs px-2"
                />
                <Button
                  size="sm"
                  onClick={handleSaveThreshold}
                  className="h-7 px-2 text-xs cursor-pointer"
                >
                  <Check className="size-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingThreshold(true)}
                className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1.5"
              >
                <SlidersHorizontal className="size-3" />
                <span>Umbral ({formatCurrency(settings.phantomExpenseThreshold || 20)})</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl border border-border/60 bg-background/50">
            <p className="text-[11px] font-medium text-muted-foreground">
              Total Fuga este Mes
            </p>
            <p className="text-lg font-bold font-mono text-amber-400 mt-1">
              {formatCurrency(total)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {count} micro-compras
            </p>
          </div>

          <div className="p-3 rounded-xl border border-border/60 bg-background/50">
            <p className="text-[11px] font-medium text-muted-foreground">
              Impacto Presupuestal
            </p>
            <p className="text-lg font-bold font-mono text-foreground mt-1">
              {percentage}%
            </p>
            <div className="w-full mt-1.5">
              <Progress value={Math.min(100, percentage * 2)} className="h-1.5 bg-muted" />
            </div>
          </div>

          <div className="p-3 rounded-xl border border-border/60 bg-background/50">
            <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Flame className="size-3 text-rose-400" /> Fuga Anual Proyectada
            </p>
            <p className="text-lg font-bold font-mono text-rose-400 mt-1">
              {formatCurrency(annualProjection)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Si mantienes este ritmo
            </p>
          </div>

          <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <p className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              <Sparkles className="size-3" /> Ahorro Potencial (50%)
            </p>
            <p className="text-lg font-bold font-mono text-emerald-400 mt-1">
              +{formatCurrency(annualSavings50)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Al año para tus metas
            </p>
          </div>
        </div>

        {/* Actionable insight tip */}
        <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
            <Coffee className="size-4" />
          </div>
          <div className="text-xs space-y-1">
            <p className="font-semibold text-foreground">
              Diagnóstico de Fugas Invisibles
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Los pequeños pagos en cafés, snacks, taxis imprevistos y delivery acumulan{" "}
              <strong className="text-amber-300 font-semibold">{formatCurrency(total)}</strong> este mes.
              Reducir tan solo 2 compras pequeñas por semana te liberará{" "}
              <strong className="text-emerald-400 font-semibold">
                {formatCurrency(annualSavings50 / 12)} mensuales
              </strong>{" "}
              para invertir o acelerar tus metas de ahorro.
            </p>
          </div>
        </div>

        {/* Top Phantom items */}
        {topDescriptions.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Principales Fugas Detectadas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topDescriptions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-border/50 bg-background/40 flex items-center justify-between text-xs hover:border-border transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-medium text-foreground truncate">
                      {item.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <span className="font-semibold text-amber-400">
                        {item.count} {item.count === 1 ? "compra" : "compras"}
                      </span>
                      <span>&bull;</span>
                      <span>Prom. {formatCurrency(item.average)}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-foreground">
                      {formatCurrency(item.total)}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {item.categoryName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
