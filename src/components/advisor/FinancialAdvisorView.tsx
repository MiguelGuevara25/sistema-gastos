"use client";

import { useState, useMemo } from "react";
import { useFinance } from "../../context/FinanceContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sparkles,
  Calculator,
  Compass,
  TrendingUp,
  ShieldCheck,
  Lightbulb,
  Target,
  Flame,
  Info,
  Clock,
  Coins,
  AlertTriangle,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";

export const FinancialAdvisorView: React.FC = () => {
  const {
    transactions,
    allTransactions,
    totalIncome,
    totalExpenses,
    totalLiquidAssets,
    totalSavingsCapital,
    savingsRate,
    budgetUsagePercent,
    goals,
    addGoal,
    settings,
    formatCurrency,
  } = useFinance();

  // Investment Simulator State
  const [initialCapital, setInitialCapital] = useState("1000");
  const [monthlyContribution, setMonthlyContribution] = useState("300");
  const [annualRate, setAnnualRate] = useState("10"); // 10% S&P500 average
  const [investmentYears, setInvestmentYears] = useState("10");

  // Average or detected monthly income fallback
  const detectedIncome = useMemo(() => {
    if (totalIncome > 0) return totalIncome;
    const incomeTxs = allTransactions.filter((t) => t.type === "income");
    if (incomeTxs.length > 0) {
      const months = new Set(incomeTxs.map((t) => t.date.substring(0, 7)));
      const sum = incomeTxs.reduce((s, t) => s + t.amount, 0);
      return Math.round(sum / Math.max(1, months.size));
    }
    if (settings.monthlyBudget > 0) return settings.monthlyBudget;
    return 2500;
  }, [totalIncome, allTransactions, settings.monthlyBudget]);

  // Scratchpad (Simulador Arenero) State
  const [purchaseName, setPurchaseName] = useState("Nueva Laptop / Viaje");
  const [purchaseAmount, setPurchaseAmount] = useState("2400");
  const [purchaseCurrency, setPurchaseCurrency] = useState(
    settings.currencyCode || "PEN",
  );
  const [purchaseIncome, setPurchaseIncome] = useState<string>("");
  const [purchasePaymentType, setPurchasePaymentType] = useState<
    "contado" | "cuotas"
  >("cuotas");
  const [purchaseInstallments, setPurchaseInstallments] = useState("6");
  const [purchaseInterestRate, setPurchaseInterestRate] = useState("0");

  const scratchpadAnalysis = useMemo(() => {
    const rawAmt = parseFloat(purchaseAmount) || 0;
    const n = Math.max(1, parseInt(purchaseInstallments) || 1);
    const annualRate = parseFloat(purchaseInterestRate) || 0;

    let monthlyPayment = 0;
    let totalCost = rawAmt;
    let totalInterest = 0;

    if (purchasePaymentType === "contado") {
      monthlyPayment = rawAmt;
      totalCost = rawAmt;
      totalInterest = 0;
    } else {
      if (annualRate > 0) {
        const monthlyRate = annualRate / 100 / 12;
        monthlyPayment =
          rawAmt *
          ((monthlyRate * Math.pow(1 + monthlyRate, n)) /
            (Math.pow(1 + monthlyRate, n) - 1));
        totalCost = monthlyPayment * n;
        totalInterest = Math.max(0, totalCost - rawAmt);
      } else {
        monthlyPayment = rawAmt / n;
        totalCost = rawAmt;
        totalInterest = 0;
      }
    }

    const activeIncome =
      purchaseIncome !== "" && !isNaN(parseFloat(purchaseIncome))
        ? parseFloat(purchaseIncome)
        : detectedIncome;

    const currentSurplus = activeIncome - totalExpenses;
    const projectedSurplus = currentSurplus - monthlyPayment;

    const currentSavingsRate =
      activeIncome > 0
        ? Math.max(0, Math.round((currentSurplus / activeIncome) * 100))
        : 0;
    const projectedSavingsRate =
      activeIncome > 0
        ? Math.max(0, Math.round((projectedSurplus / activeIncome) * 100))
        : 0;

    // Hours of work: activeIncome / 160
    const hourlyWage = activeIncome > 0 ? activeIncome / 160 : 20;
    const hoursOfWork = Math.round(totalCost / hourlyWage);
    const daysOfWork = (hoursOfWork / 8).toFixed(1);

    // Micro-expense check (e.g. galleta de S/. 1, taxi de S/. 12)
    const isMicroExpense =
      rawAmt > 0 && rawAmt <= (settings.phantomExpenseThreshold || 20);
    const hasLiquidity = totalLiquidAssets >= rawAmt;

    // Verdict calculation
    let verdict: "safe" | "caution" | "danger" = "safe";
    let verdictTitle = "Compra Financieramente Segura 🟢";
    let verdictDesc =
      "Tu flujo de caja mensual puede absorber esta cuota cómodamente sin comprometer tu capacidad de ahorro básico.";

    if (isMicroExpense && (hasLiquidity || rawAmt <= 10)) {
      verdict = "safe";
      verdictTitle = "Gasto Menor Cotidiano 🟢";
      verdictDesc = `Es una compra mínima (${formatCurrency(
        rawAmt,
        purchaseCurrency,
      )}) que no compromete tu flujo de caja mensual y está cubierta por tu liquidez disponible.`;
    } else if (currentSurplus <= 0) {
      verdict = "danger";
      verdictTitle = "Tu mes ya registra déficit 🔴";
      verdictDesc = `Actualmente tus gastos del mes ya superan tus ingresos (déficit de ${formatCurrency(
        Math.abs(currentSurplus),
      )}). Esta compra añadirá ${formatCurrency(
        monthlyPayment,
        purchaseCurrency,
      )} más a ese saldo negativo.`;
    } else if (projectedSurplus < 0) {
      verdict = "danger";
      verdictTitle = "Esta compra causa Déficit 🔴";
      verdictDesc = `Tus ingresos no alcanzan para cubrir tus gastos habituales MÁS esta cuota de ${formatCurrency(
        monthlyPayment,
        purchaseCurrency,
      )}/mes. Quedarías en rojo por ${formatCurrency(
        Math.abs(projectedSurplus),
      )}.`;
    } else if (
      projectedSavingsRate < 8 ||
      monthlyPayment > currentSurplus * 0.55
    ) {
      verdict = "caution";
      verdictTitle = "Impacto Elevado / Precaución 🟡";
      verdictDesc =
        "La cuota consumirá más de la mitad de tu margen libre mensual. Te dejará muy vulnerable ante cualquier imprevisto de salud, hogar o vehículo.";
    }

    // 6-month projected comparison
    const timeline = [];
    for (let m = 1; m <= 6; m++) {
      const isStillPaying =
        purchasePaymentType === "contado" ? m === 1 : m <= n;
      const monthPayment = isStillPaying ? monthlyPayment : 0;
      timeline.push({
        monthIndex: m,
        monthLabel: `Mes +${m}`,
        payment: monthPayment,
        surplusWithout: currentSurplus,
        surplusWith: currentSurplus - monthPayment,
      });
    }

    return {
      rawAmt,
      n,
      monthlyPayment,
      totalCost,
      totalInterest,
      activeIncome,
      currentSurplus,
      projectedSurplus,
      currentSavingsRate,
      projectedSavingsRate,
      hoursOfWork,
      daysOfWork,
      verdict,
      verdictTitle,
      verdictDesc,
      timeline,
    };
  }, [
    purchaseAmount,
    purchasePaymentType,
    purchaseInstallments,
    purchaseInterestRate,
    purchaseIncome,
    detectedIncome,
    totalExpenses,
    totalLiquidAssets,
    settings.phantomExpenseThreshold,
    formatCurrency,
    purchaseCurrency,
  ]);

  // Calculate 50/30/20 Rule distribution based on active transactions
  const rule503020 = useMemo(() => {
    // Categories classification:
    // Needs: Vivienda, Alimentación, Servicios, Transporte, Salud
    // Wants: Entretenimiento, Restaurantes, Compras, Viajes
    // Savings: Income minus expenses or savings rate
    let needs = 0;
    let wants = 0;

    transactions.forEach((tx) => {
      if (tx.type !== "expense") return;
      const id = tx.categoryId.toLowerCase();
      if (
        id.includes("vivienda") ||
        id.includes("alimentacion") ||
        id.includes("servicios") ||
        id.includes("transporte") ||
        id.includes("salud")
      ) {
        needs += tx.amount;
      } else {
        wants += tx.amount;
      }
    });

    const totalSpent = needs + wants;
    const isDeficit = totalIncome > 0 && totalSpent > totalIncome;
    const hasNoIncome = totalIncome === 0;

    let needsPercent = 0;
    let wantsPercent = 0;
    let savingsPercent = 0;
    let savingsAmount = 0;

    if (totalSpent === 0 && totalIncome === 0) {
      needsPercent = 0;
      wantsPercent = 0;
      savingsPercent = 0;
      savingsAmount = 0;
    } else if (isDeficit || hasNoIncome) {
      // If expenses exceed income or no income registered, calculate distribution
      // relative to total spent so percentages add to 100% and don't distort.
      needsPercent = totalSpent > 0 ? Math.round((needs / totalSpent) * 100) : 0;
      wantsPercent = totalSpent > 0 ? Math.round((wants / totalSpent) * 100) : 0;
      if (needsPercent + wantsPercent > 100) {
        wantsPercent = Math.max(0, 100 - needsPercent);
      }
      savingsPercent = 0;
      savingsAmount = 0;
    } else {
      // Normal case: totalIncome >= totalSpent
      needsPercent = Math.round((needs / totalIncome) * 100);
      wantsPercent = Math.round((wants / totalIncome) * 100);
      savingsPercent = Math.max(0, 100 - needsPercent - wantsPercent);
      savingsAmount = Math.max(0, totalIncome - totalSpent);
    }

    return {
      needsAmount: needs,
      needsPercent,
      wantsAmount: wants,
      wantsPercent,
      savingsAmount,
      savingsPercent,
      isDeficit,
      hasNoIncome,
      totalSpent,
      totalIncome,
    };
  }, [transactions, totalIncome, totalExpenses]);

  // Financial Health Score (0 - 100)
  const healthScore = useMemo(() => {
    let score = 30; // base score

    // Savings rate effect (up to 35 pts)
    if (savingsRate >= 20) score += 35;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate > 0) score += 10;

    // Budget control effect (up to 25 pts)
    if (budgetUsagePercent <= 80 && budgetUsagePercent > 0) score += 25;
    else if (budgetUsagePercent <= 100) score += 15;
    else if (budgetUsagePercent > 100) score -= 15;

    // Goals active (up to 10 pts)
    if (goals.length > 0) score += 10;

    return Math.min(100, Math.max(10, score));
  }, [savingsRate, budgetUsagePercent, goals]);

  // Investment calculation
  const simulationResults = useMemo(() => {
    const p = parseFloat(initialCapital) || 0;
    const pmt = parseFloat(monthlyContribution) || 0;
    const r = (parseFloat(annualRate) || 0) / 100 / 12;
    const months = (parseInt(investmentYears, 10) || 1) * 12;

    let futureValue = p;
    let totalInvested = p;

    for (let i = 1; i <= months; i++) {
      futureValue = futureValue * (1 + r) + pmt;
      totalInvested += pmt;
    }

    const totalInterest = Math.max(0, futureValue - totalInvested);

    return {
      futureValue: Math.round(futureValue),
      totalInvested: Math.round(totalInvested),
      totalInterest: Math.round(totalInterest),
      multiplier:
        totalInvested > 0 ? (futureValue / totalInvested).toFixed(1) : "1.0",
    };
  }, [initialCapital, monthlyContribution, annualRate, investmentYears]);

  // Emergency Fund calculations
  const monthlyExpenseBase = totalExpenses > 0 ? totalExpenses : 2000;
  const emergency3Months = monthlyExpenseBase * 3;
  const emergency6Months = monthlyExpenseBase * 6;
  const emergency12Months = monthlyExpenseBase * 12;

  const handleCreateEmergencyGoal = (months: number, amount: number) => {
    addGoal({
      name: `Fondo de Emergencia (${months} meses)`,
      targetAmount: amount,
      currentAmount: 0,
      color: "#10b981",
      category: "Seguridad",
    });
    alert(
      `¡Meta de ahorro "Fondo de Emergencia (${months} meses)" creada con éxito!`,
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Financial Health Score */}
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-muted/40 via-card to-primary/5 border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/20 text-primary">
                <Sparkles className="size-4" />
              </span>
              <h3 className="text-base font-bold text-foreground">
                Asesor Financiero & Simulador Inteligente
              </h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              Analizamos tus números reales para darte claridad: optimiza tus
              gastos, calcula tu fondo de emergencia y descubre cuánto dinero
              puedes acumular invirtiendo a largo plazo.
            </p>
          </div>

          {/* Health Score Pill */}
          <div className="flex items-center gap-4 bg-muted/40 border border-border p-3.5 rounded-xl self-start md:self-auto">
            <div className="text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                Salud Financiera
              </span>
              <div className="text-2xl font-black text-primary">
                {healthScore}/100
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <Badge
                variant={
                  healthScore >= 70
                    ? "default"
                    : healthScore >= 45
                      ? "secondary"
                      : "destructive"
                }
                className="text-xs"
              >
                {healthScore >= 70
                  ? "Salud Excelente 🚀"
                  : healthScore >= 45
                    ? "Bajo Control 👍"
                    : "Atención Requerida ⚠️"}
              </Badge>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {savingsRate}% tasa de ahorro actual
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs navigation */}
      <Tabs defaultValue="diagnosis" className="space-y-4">
        <div className="overflow-x-auto no-scrollbar pb-1">
          <TabsList className="w-max min-w-full flex justify-start bg-muted/40 p-1 border border-border gap-1">
            <TabsTrigger
              value="diagnosis"
              className="gap-1.5 text-xs shrink-0 cursor-pointer"
            >
              <Compass className="size-3.5" />
              <span>Regla 50/30/20 & Diagnóstico</span>
            </TabsTrigger>
            <TabsTrigger
              value="simulator"
              className="gap-1.5 text-xs shrink-0 cursor-pointer"
            >
              <Calculator className="size-3.5" />
              <span>Simulador de Inversión</span>
            </TabsTrigger>
            <TabsTrigger
              value="emergency"
              className="gap-1.5 text-xs shrink-0 cursor-pointer"
            >
              <ShieldCheck className="size-3.5" />
              <span>Fondo de Emergencia</span>
            </TabsTrigger>
            <TabsTrigger
              value="strategies"
              className="gap-1.5 text-xs shrink-0 cursor-pointer"
            >
              <Lightbulb className="size-3.5" />
              <span>Estrategias Maestras</span>
            </TabsTrigger>
            <TabsTrigger
              value="scratchpad"
              className="gap-1.5 text-xs shrink-0 cursor-pointer font-semibold text-amber-400 data-[state=active]:text-foreground"
            >
              <Sparkles className="size-3.5 text-amber-400" />
              <span>Simulador Arenero (¿Compro esto?)</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: 50/30/20 Rule Diagnosis */}
        <TabsContent value="diagnosis" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Compass className="size-4 text-primary" />
                Tu Distribución Real vs Regla 50 / 30 / 20
              </CardTitle>
              <CardDescription className="text-xs">
                La regla de oro de las finanzas personales divide tus ingresos
                en: 50% Necesidades, 30% Deseos y 20% Ahorro o Inversión.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Deficit Alert Banner */}
              {rule503020.isDeficit && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs">
                  <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-amber-300">
                      Gastos ({formatCurrency(rule503020.totalSpent)}) superan tus ingresos registrados ({formatCurrency(rule503020.totalIncome)})
                    </p>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      Tus gastos en este mes exceden los ingresos registrados en Movimientos.
                      Para mantener la coherencia financiera y que los porcentajes no sumen cifras distorsionadas (mayores al 100%), 
                      la distribución se calcula sobre el <strong>total de lo gastado</strong> ({rule503020.needsPercent}% en necesidades y {rule503020.wantsPercent}% en deseos). 
                      Apenas registres tu sueldo o ingresos completos del mes en Movimientos, la regla se calculará sobre el 100% de tus ingresos.
                    </p>
                  </div>
                </div>
              )}

              {/* No Income Registered Banner */}
              {rule503020.hasNoIncome && rule503020.totalSpent > 0 && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs">
                  <Info className="size-4 text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-blue-300">
                      Sin ingresos registrados en este mes
                    </p>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      No has registrado ingresos para este periodo todavía. Mostramos cómo se reparten tus necesidades y deseos sobre tu total gastado ({formatCurrency(rule503020.totalSpent)}).
                    </p>
                  </div>
                </div>
              )}

              {/* 3 Pillars Progress Bars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Needs */}
                <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      1. Necesidades Básicas
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      Ideal: 50%
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(rule503020.needsAmount)}
                    <span className="text-xs font-normal text-muted-foreground ml-1.5">
                      ({rule503020.needsPercent}%)
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, rule503020.needsPercent)}
                    className="h-2 bg-muted/60"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Alquiler, comida de supermercado, luz, agua, transporte y
                    salud.
                  </p>
                </div>

                {/* Wants */}
                <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      2. Deseos & Estilo de Vida
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      Ideal: 30%
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(rule503020.wantsAmount)}
                    <span className="text-xs font-normal text-muted-foreground ml-1.5">
                      ({rule503020.wantsPercent}%)
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, rule503020.wantsPercent)}
                    className="h-2 bg-muted/60"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Restaurantes, salidas con amigos, compras personales y
                    entretenimiento.
                  </p>
                </div>

                {/* Savings */}
                <div className="p-4 rounded-xl border border-border/70 bg-emerald-500/5 border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400">
                      3. Ahorro & Inversión (Mes)
                    </span>
                    <Badge
                      variant="default"
                      className="text-[10px] bg-emerald-500/20 text-emerald-400 border-0"
                    >
                      Ideal: 20%
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(rule503020.savingsAmount)}
                    <span className="text-xs font-normal text-emerald-400/80 ml-1.5">
                      ({rule503020.savingsPercent}%)
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, rule503020.savingsPercent)}
                    className="h-2 bg-emerald-950"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Ahorro nuevo generado con tus ingresos netos de este mes.
                  </p>

                  {/* Clarification about accumulated savings in wallets */}
                  {totalSavingsCapital > 0 && (
                    <div className="pt-2 border-t border-emerald-500/20 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Colchón en Billeteras:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {formatCurrency(totalSavingsCapital)}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/80 leading-tight">
                        Tu saldo acumulado en cuentas de reserva (como &quot;Guarda&quot;) está seguro e intacto en Billeteras.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actionable Advice based on numbers */}
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Lightbulb className="size-4 text-primary" />
                  Diagnóstico y Recomendación Personalizada:
                </h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  {rule503020.isDeficit && (
                    <p className="text-amber-400 font-medium">
                      • <strong>Balance en déficit este mes:</strong> Has gastado{" "}
                      {formatCurrency(rule503020.totalSpent)} vs{" "}
                      {formatCurrency(rule503020.totalIncome)} de ingresos registrados.
                      Si aún no has registrado tu sueldo o ingresos completos del mes en Movimientos,
                      regístralos para reflejar tu ahorro real.
                    </p>
                  )}
                  {rule503020.needsPercent > 60 ? (
                    <p>
                      • <strong>Tus necesidades absorben más del 60%</strong> de
                      tus recursos. No te culpes: los costos fijos suelen ser
                      altos. Revisa si puedes reducir costos en planes de
                      telefonía/internet o buscar compras mayoristas en víveres.
                    </p>
                  ) : (
                    <p>
                      • <strong>Excelente control en tus costos fijos:</strong>{" "}
                      Tus necesidades están por debajo del 60%, lo cual te deja
                      suficiente oxígeno para disfrutar y ahorrar.
                    </p>
                  )}

                  {rule503020.wantsPercent > 35 ? (
                    <p>
                      • <strong>Tus gastos en deseos superan el 35%:</strong>{" "}
                      Los pequeños gustos frecuentes (cafés, delivery, salidas
                      constantes) son &quot;gastos hormiga&quot; que podrías
                      convertir en un potente fondo de inversión.
                    </p>
                  ) : (
                    <p>
                      • <strong>Tus gustos están equilibrados:</strong>{" "}
                      Mantienes los deseos bajo control sin privarte de calidad
                      de vida.
                    </p>
                  )}

                  {rule503020.savingsPercent >= 20 ? (
                    <p className="text-emerald-400 font-semibold">
                      • ¡Felicitaciones! Cumples con la meta del 20% de ahorro.
                      Ahora el siguiente paso es poner ese dinero a trabajar (ve
                      a la pestaña del Simulador).
                    </p>
                  ) : (
                    <p>
                      • <strong>Tu ahorro está por debajo del 20%:</strong>{" "}
                      Intenta la técnica de
                      <strong> &quot;Pagarte a ti primero&quot;</strong>: apenas
                      recibas tu sueldo o ingresos, separa el 10% a 15%
                      automáticamente a una meta de ahorro antes de empezar a
                      gastar.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Compound Interest & Investment Simulator */}
        <TabsContent value="simulator" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Controls */}
            <Card className="lg:col-span-5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Calculator className="size-4 text-primary" />
                  Simulador de Inversión (Interés Compuesto)
                </CardTitle>
                <CardDescription className="text-xs">
                  Proyecta cómo crece tu dinero si inviertes de forma constante
                  a lo largo del tiempo
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Capital Inicial ({settings.currency})
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Aporte Mensual ({settings.currency})
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Rendimiento Anual Estimado:{" "}
                    <strong className="text-foreground">{annualRate}%</strong>
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(e.target.value)}
                    className="h-9 text-xs"
                  />
                  {/* Presets */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAnnualRate("6")}
                      className="text-[10px] h-7 px-1.5 cursor-pointer"
                    >
                      🏦 Cuenta Ahorro (6%)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAnnualRate("8")}
                      className="text-[10px] h-7 px-1.5 cursor-pointer"
                    >
                      📦 Depósito Plazo (8%)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAnnualRate("11")}
                      className="text-[10px] h-7 px-1.5 cursor-pointer text-primary"
                    >
                      📈 S&P 500 / ETFs (11%)
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Horizonte de Tiempo:{" "}
                    <strong className="text-foreground">
                      {investmentYears} años
                    </strong>
                  </Label>
                  <div className="flex items-center gap-2">
                    {["3", "5", "10", "15", "20", "25"].map((y) => (
                      <Button
                        key={y}
                        type="button"
                        variant={investmentYears === y ? "default" : "outline"}
                        size="sm"
                        onClick={() => setInvestmentYears(y)}
                        className="flex-1 h-7 text-xs cursor-pointer px-0"
                      >
                        {y}a
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Simulation Results Display */}
            <Card className="lg:col-span-7 bg-muted/20 border-border flex flex-col justify-between">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="size-4 text-emerald-400" />
                  Resultado en {investmentYears} Años
                </CardTitle>
                <CardDescription className="text-xs">
                  El efecto bola de nieve: los intereses generan más intereses
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Big Future Value */}
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">
                    Patrimonio Final Estimado
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                    {formatCurrency(simulationResults.futureValue)}
                  </div>
                  <span className="text-xs text-primary font-semibold">
                    Multiplicas tu dinero x{simulationResults.multiplier} veces
                  </span>
                </div>

                {/* Breakdown comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-border bg-background space-y-1">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Dinero de tu bolsillo
                    </span>
                    <div className="text-lg font-bold text-foreground">
                      {formatCurrency(simulationResults.totalInvested)}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Tu esfuerzo de ahorro mensual
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
                    <span className="text-[11px] text-emerald-400 font-medium">
                      Ganancia por Intereses
                    </span>
                    <div className="text-lg font-bold text-emerald-400">
                      +{formatCurrency(simulationResults.totalInterest)}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Dinero que trabajó solo para ti
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground flex items-center gap-2">
                  <Info className="size-4 text-primary shrink-0" />
                  <span>
                    Invertir de manera periódica (DCA) elimina el riesgo de
                    intentar adivinar el mejor momento del mercado. La
                    disciplina supera al azar.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Emergency Fund Calculator */}
        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-400" />
                Tu Fondo de Emergencia: El Escudo Financiero
              </CardTitle>
              <CardDescription className="text-xs">
                Antes de invertir o asumir riesgos, necesitas un colchón en
                dinero líquido para afrontar imprevistos sin endeudarte con
                tarjetas ni préstamos.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Gasto Mensual Base Estimado
                  </span>
                  <div className="text-xl font-bold text-foreground">
                    {formatCurrency(monthlyExpenseBase)}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Calculado con tus movimientos
                </Badge>
              </div>

              {/* 3 Fund Tiers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 3 Months */}
                <div className="p-4 rounded-xl border border-border bg-card flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <Badge
                      variant="secondary"
                      className="text-xs font-semibold"
                    >
                      3 Meses (Básico)
                    </Badge>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(emergency3Months)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ideal para jóvenes sin personas dependientes o con empleo
                      muy estable.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleCreateEmergencyGoal(3, emergency3Months)
                    }
                    className="w-full text-xs cursor-pointer"
                  >
                    Crear Meta (3 Meses)
                  </Button>
                </div>

                {/* 6 Months */}
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="default"
                        className="text-xs font-semibold"
                      >
                        6 Meses (Recomendado ⭐)
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(emergency6Months)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      El estándar de oro. Te permite sobrevivir medio año
                      completo ante despidos o emergencias médicas.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      handleCreateEmergencyGoal(6, emergency6Months)
                    }
                    className="w-full text-xs cursor-pointer font-semibold"
                  >
                    Crear Meta (6 Meses)
                  </Button>
                </div>

                {/* 12 Months */}
                <div className="p-4 rounded-xl border border-border bg-card flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <Badge
                      variant="secondary"
                      className="text-xs font-semibold"
                    >
                      12 Meses (Máxima Paz)
                    </Badge>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(emergency12Months)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Para emprendedores, freelancers con ingresos variables o
                      con familia a cargo.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleCreateEmergencyGoal(12, emergency12Months)
                    }
                    className="w-full text-xs cursor-pointer"
                  >
                    Crear Meta (12 Meses)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Master Financial Strategies */}
        <TabsContent value="strategies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strategy 1: Debt Repayment */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <Flame className="size-4" />
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  1. Método Avalancha vs Bola de Nieve (Deudas)
                </h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Si tienes deudas en tarjetas de crédito, ningún depósito ni
                fondo te pagará lo que la tarjeta te cobra de interés (hasta
                40%-80% anual).
              </p>
              <div className="p-3 rounded-lg bg-muted/40 text-[11px] text-muted-foreground space-y-1">
                <p>
                  • <strong>Avalancha:</strong> Paga el mínimo en todas y ataca
                  con todo a la deuda de <em>mayor interés</em>. Ahorras la
                  máxima cantidad de dinero.
                </p>
                <p>
                  • <strong>Bola de nieve:</strong> Ataca la de{" "}
                  <em>menor saldo</em> para liquidarla rápido. Te da una
                  victoria psicológica inmediata.
                </p>
              </div>
            </Card>

            {/* Strategy 2: Pay Yourself First */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Coins className="size-4" />
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  2. Págate a Ti Mismo Primero
                </h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                La mayoría comete el error de:{" "}
                <em>Ingresos - Gastos = Lo que sobra para ahorrar</em>. La
                realidad es que casi nunca sobra nada.
              </p>
              <div className="p-3 rounded-lg bg-muted/40 text-[11px] text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">
                  Fórmula correcta: Ingresos - Ahorro (10-20%) = Dinero
                  disponible para gastar.
                </p>
                <p>
                  Apenas recibas tu pago, transfiérelo de inmediato a tu meta de
                  ahorro o cuenta separada. Te adaptarás a vivir con el saldo
                  restante sin esfuerzo.
                </p>
              </div>
            </Card>

            {/* Strategy 3: 48-Hour Rule */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Clock className="size-4" />
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  3. La Regla de las 48 Horas
                </h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cuando sientas el impulso de comprar algo que no necesitas
                (ropa, gadgets, caprichos online), espera 48 horas antes de
                pagar.
              </p>
              <div className="p-3 rounded-lg bg-muted/40 text-[11px] text-muted-foreground">
                El 70% de las veces, la emoción de dopamina se disipa en 2 días
                y te darás cuenta de que en realidad no lo necesitabas,
                ahorrándote cientos de soles o dólares al mes.
              </div>
            </Card>

            {/* Strategy 4: High Yield Accounts */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Target className="size-4" />
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  4. Dónde Guardar el Dinero de Ahorro
                </h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nunca dejes el dinero del fondo de ahorro en tu cuenta de uso
                diario (donde tienes la tarjeta con la que pagas el almuerzo o
                las compras).
              </p>
              <div className="p-3 rounded-lg bg-muted/40 text-[11px] text-muted-foreground space-y-1">
                <p>
                  • Abre una cuenta en una entidad que pague rendimiento
                  (cuentas remuneradas al 5%-7% con seguro de depósitos FSD) sin
                  costo de mantenimiento.
                </p>
                <p>
                  • Al no tener la tarjeta a mano en la calle, no caerás en la
                  tentación de gastarlo.
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 5: Scratchpad (Simulador Arenero) */}
        <TabsContent value="scratchpad" className="space-y-4">
          <Card className="border-border/80 bg-gradient-to-br from-background via-muted/10 to-muted/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      Simulador Arenero: ¿Qué pasa si compro esto?
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Experimenta y proyecta el impacto de una compra antes de comprometer tu dinero real.
                    </CardDescription>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold px-2 py-0.5 shrink-0 ${
                    scratchpadAnalysis.verdict === "safe"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : scratchpadAnalysis.verdict === "caution"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}
                >
                  {scratchpadAnalysis.verdict === "safe"
                    ? "Segura 🟢"
                    : scratchpadAnalysis.verdict === "caution"
                      ? "Precaución 🟡"
                      : "Peligro 🔴"}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Input Form Card */}
            <Card className="p-4 sm:p-5 lg:col-span-5 space-y-4">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="size-3.5 text-primary" />
                Parámetros de la Compra
              </h4>

              {/* Purchase Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  ¿Qué estás pensando comprar?
                </Label>
                <Input
                  type="text"
                  value={purchaseName}
                  onChange={(e) => setPurchaseName(e.target.value)}
                  placeholder="ej. iPhone 16 Pro, Laptop M3, Viaje..."
                  className="h-9 text-xs bg-muted/40"
                />
              </div>

              {/* Purchase Amount & Currency */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Precio Total
                  </Label>
                  <div className="flex items-center gap-1">
                    {(["PEN", "USD", "EUR"] as const).map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => setPurchaseCurrency(curr)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          purchaseCurrency === curr
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative flex items-center">
                  <span className="absolute left-3 text-sm font-bold text-muted-foreground select-none">
                    {purchaseCurrency === "USD"
                      ? "$"
                      : purchaseCurrency === "EUR"
                        ? "€"
                        : "S/."}
                  </span>
                  <Input
                    type="number"
                    step="any"
                    min="1"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    className="pl-12 h-10 text-base font-bold bg-muted/40 font-mono"
                  />
                </div>
              </div>

              {/* Estimated Monthly Income for simulation */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-muted/20 border border-border/70">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                    <Coins className="size-3.5 text-emerald-400" />
                    Tu Ingreso Mensual Base
                  </Label>
                  <span className="text-[10px] text-primary font-medium">
                    {totalIncome > 0 ? "Mes en curso" : "Base estimada"}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-muted-foreground select-none">
                    {purchaseCurrency === "USD"
                      ? "$"
                      : purchaseCurrency === "EUR"
                        ? "€"
                        : "S/."}
                  </span>
                  <Input
                    type="number"
                    step="any"
                    placeholder={String(detectedIncome)}
                    value={purchaseIncome}
                    onChange={(e) => setPurchaseIncome(e.target.value)}
                    className="pl-10 h-8 text-xs font-mono font-semibold bg-background"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Usamos {formatCurrency(scratchpadAnalysis.activeIncome, purchaseCurrency)}/mes para medir si esta compra causa déficit. Puedes ajustarlo a tu sueldo real.
                </p>
              </div>

              {/* Payment Type: Contado vs Cuotas */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Modalidad de Pago
                </Label>
                <div className="grid grid-cols-2 p-1 bg-muted rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setPurchasePaymentType("contado")}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      purchasePaymentType === "contado"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Al Contado (1 Mes)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurchasePaymentType("cuotas")}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      purchasePaymentType === "cuotas"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    En Cuotas
                  </button>
                </div>
              </div>

              {/* Installments Options */}
              {purchasePaymentType === "cuotas" && (
                <div className="space-y-3 p-3 bg-muted/20 border border-border/80 rounded-xl animate-in fade-in-50">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">
                        Número de Cuotas
                      </Label>
                      <select
                        value={purchaseInstallments}
                        onChange={(e) => setPurchaseInstallments(e.target.value)}
                        className="w-full h-8 px-2.5 bg-background border border-input rounded-lg text-xs font-medium text-foreground cursor-pointer focus:outline-none"
                      >
                        {[2, 3, 4, 6, 9, 12, 18, 24, 36].map((n) => (
                          <option key={n} value={n}>
                            {n} cuotas
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">
                        Interés Anual (TEA %)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={purchaseInterestRate}
                        onChange={(e) => setPurchaseInterestRate(e.target.value)}
                        className="h-8 text-xs bg-background font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Pon 0% si tu banco ofrece cuotas sin intereses. Si usas tarjeta estándar, la TEA suele rondar 30%-45%.
                  </p>
                </div>
              )}
            </Card>

            {/* Right: Results, Verdict & Timeline */}
            <div className="lg:col-span-7 space-y-4">
              {/* Verdict Card */}
              <Card
                className={`p-4 sm:p-5 border transition-all ${
                  scratchpadAnalysis.verdict === "safe"
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : scratchpadAnalysis.verdict === "caution"
                      ? "bg-amber-500/5 border-amber-500/20"
                      : "bg-rose-500/5 border-rose-500/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      scratchpadAnalysis.verdict === "safe"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : scratchpadAnalysis.verdict === "caution"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-rose-500/15 text-rose-400"
                    }`}
                  >
                    {scratchpadAnalysis.verdict === "safe" ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <AlertTriangle className="size-5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm sm:text-base font-bold text-foreground">
                      {scratchpadAnalysis.verdictTitle}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {scratchpadAnalysis.verdictDesc}
                    </p>
                  </div>
                </div>
              </Card>

              {/* 3 Metric Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Cuota Mensual */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Cuota Mensual
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-foreground">
                      {formatCurrency(
                        scratchpadAnalysis.monthlyPayment,
                        purchaseCurrency,
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground">/ mes</span>
                  </div>
                  {scratchpadAnalysis.totalInterest > 0 && (
                    <span className="text-[10px] text-rose-400 block font-mono">
                      +{formatCurrency(scratchpadAnalysis.totalInterest, purchaseCurrency)} interés
                    </span>
                  )}
                </div>

                {/* Tasa de Ahorro */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Tasa de Ahorro
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs line-through text-muted-foreground">
                      {scratchpadAnalysis.currentSavingsRate}%
                    </span>
                    <span className="text-lg font-bold font-mono text-primary">
                      {scratchpadAnalysis.projectedSavingsRate}%
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block">
                    Caída de {Math.max(0, scratchpadAnalysis.currentSavingsRate - scratchpadAnalysis.projectedSavingsRate)}% mensual
                  </span>
                </div>

                {/* Horas de Trabajo */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block flex items-center gap-1">
                    <Clock className="size-3 text-amber-400" />
                    Horas de Trabajo
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-amber-400">
                      {scratchpadAnalysis.hoursOfWork} hrs
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block">
                    {scratchpadAnalysis.daysOfWork} días enteros de tu sueldo
                  </span>
                </div>
              </div>

              {/* 6-Month Projected Cash Flow Timeline */}
              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">
                    Proyección de Flujo de Caja (Próximos 6 Meses)
                  </h4>
                  <span className="text-[10px] text-muted-foreground">
                    Saldo libre al final de cada mes
                  </span>
                </div>

                <div className="space-y-2">
                  {scratchpadAnalysis.timeline.map((item) => {
                    const isDeficit = item.surplusWith < 0;
                    return (
                      <div
                        key={item.monthIndex}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/50 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground w-16">
                            {item.monthLabel}
                          </span>
                          {item.payment > 0 ? (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-amber-400 border-amber-500/20">
                              Cuota: {formatCurrency(item.payment, purchaseCurrency)}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-muted-foreground">
                              Sin cuota
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-[11px] text-muted-foreground hidden sm:inline">
                            Sin compra: {formatCurrency(item.surplusWithout)}
                          </span>
                          <span
                            className={`font-bold ${
                              isDeficit ? "text-rose-400" : "text-emerald-400"
                            }`}
                          >
                            Con compra: {formatCurrency(item.surplusWith)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
