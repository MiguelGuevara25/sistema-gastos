'use client';

import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sparkles,
  Calculator,
  Compass,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Target,
  ArrowRight,
  Flame,
  Info,
  Clock,
  Coins,
} from 'lucide-react';

export const FinancialAdvisorView: React.FC = () => {
  const {
    transactions,
    totalIncome,
    totalExpenses,
    netBalance,
    savingsRate,
    budgetUsagePercent,
    goals,
    addGoal,
    settings,
    formatCurrency,
    setActiveTab,
  } = useFinance();

  // Investment Simulator State
  const [initialCapital, setInitialCapital] = useState('1000');
  const [monthlyContribution, setMonthlyContribution] = useState('300');
  const [annualRate, setAnnualRate] = useState('10'); // 10% S&P500 average
  const [investmentYears, setInvestmentYears] = useState('10');

  // Calculate 50/30/20 Rule distribution based on active transactions
  const rule503020 = useMemo(() => {
    // Categories classification:
    // Needs: Vivienda, Alimentación, Servicios, Transporte, Salud
    // Wants: Entretenimiento, Restaurantes, Compras, Viajes
    // Savings: Income minus expenses or savings rate
    let needs = 0;
    let wants = 0;

    transactions.forEach((tx) => {
      if (tx.type !== 'expense') return;
      const id = tx.categoryId.toLowerCase();
      if (
        id.includes('vivienda') ||
        id.includes('alimentacion') ||
        id.includes('servicios') ||
        id.includes('transporte') ||
        id.includes('salud')
      ) {
        needs += tx.amount;
      } else {
        wants += tx.amount;
      }
    });

    const income = totalIncome > 0 ? totalIncome : totalExpenses;
    const needsPercent = income > 0 ? Math.round((needs / income) * 100) : 0;
    const wantsPercent = income > 0 ? Math.round((wants / income) * 100) : 0;
    const savingsPercent = Math.max(0, 100 - needsPercent - wantsPercent);

    return {
      needsAmount: needs,
      needsPercent,
      wantsAmount: wants,
      wantsPercent,
      savingsAmount: Math.max(0, income - needs - wants),
      savingsPercent,
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
      multiplier: totalInvested > 0 ? (futureValue / totalInvested).toFixed(1) : '1.0',
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
      color: '#10b981',
      category: 'Seguridad',
    });
    alert(`¡Meta de ahorro "Fondo de Emergencia (${months} meses)" creada con éxito!`);
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
              Analizamos tus números reales para darte claridad: optimiza tus gastos, calcula tu
              fondo de emergencia y descubre cuánto dinero puedes acumular invirtiendo a largo plazo.
            </p>
          </div>

          {/* Health Score Pill */}
          <div className="flex items-center gap-4 bg-muted/40 border border-border p-3.5 rounded-xl self-start md:self-auto">
            <div className="text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                Salud Financiera
              </span>
              <div className="text-2xl font-black text-primary">{healthScore}/100</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <Badge
                variant={healthScore >= 70 ? 'default' : healthScore >= 45 ? 'secondary' : 'destructive'}
                className="text-xs"
              >
                {healthScore >= 70
                  ? 'Salud Excelente 🚀'
                  : healthScore >= 45
                  ? 'Bajo Control 👍'
                  : 'Atención Requerida ⚠️'}
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
            <TabsTrigger value="diagnosis" className="gap-1.5 text-xs shrink-0 cursor-pointer">
              <Compass className="size-3.5" />
              <span>Regla 50/30/20 & Diagnóstico</span>
            </TabsTrigger>
            <TabsTrigger value="simulator" className="gap-1.5 text-xs shrink-0 cursor-pointer">
              <Calculator className="size-3.5" />
              <span>Simulador de Inversión</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="gap-1.5 text-xs shrink-0 cursor-pointer">
              <ShieldCheck className="size-3.5" />
              <span>Fondo de Emergencia</span>
            </TabsTrigger>
            <TabsTrigger value="strategies" className="gap-1.5 text-xs shrink-0 cursor-pointer">
              <Lightbulb className="size-3.5" />
              <span>Estrategias Maestras</span>
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
                La regla de oro de las finanzas personales divide tus ingresos en: 50% Necesidades,
                30% Deseos y 20% Ahorro o Inversión.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
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
                    Alquiler, comida de supermercado, luz, agua, transporte y salud.
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
                    Restaurantes, salidas con amigos, compras personales y entretenimiento.
                  </p>
                </div>

                {/* Savings */}
                <div className="p-4 rounded-xl border border-border/70 bg-emerald-500/5 border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400">
                      3. Ahorro & Inversión
                    </span>
                    <Badge variant="default" className="text-[10px] bg-emerald-500/20 text-emerald-400 border-0">
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
                    Dinero reservado para tu fondo de emergencia, proyectos e inversiones futuras.
                  </p>
                </div>
              </div>

              {/* Actionable Advice based on numbers */}
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Lightbulb className="size-4 text-primary" />
                  Diagnóstico y Recomendación Personalizada:
                </h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  {rule503020.needsPercent > 60 ? (
                    <p>
                      • <strong>Tus necesidades absorben más del 60%</strong> de tus recursos. No te
                      culpes: los costos fijos suelen ser altos. Revisa si puedes reducir costos en
                      planes de telefonía/internet o buscar compras mayoristas en víveres.
                    </p>
                  ) : (
                    <p>
                      • <strong>Excelente control en tus costos fijos:</strong> Tus necesidades están
                      por debajo del 60%, lo cual te deja suficiente oxígeno para disfrutar y ahorrar.
                    </p>
                  )}

                  {rule503020.wantsPercent > 35 ? (
                    <p>
                      • <strong>Tus gastos en deseos superan el 35%:</strong> Los pequeños gustos
                      frecuentes (cafés, delivery, salidas constantes) son "gastos hormiga" que
                      podrías convertir en un potente fondo de inversión.
                    </p>
                  ) : (
                    <p>
                      • <strong>Tus gustos están equilibrados:</strong> Mantienes los deseos bajo
                      control sin privarte de calidad de vida.
                    </p>
                  )}

                  {rule503020.savingsPercent >= 20 ? (
                    <p className="text-emerald-400 font-semibold">
                      • ¡Felicitaciones! Cumples con la meta del 20% de ahorro. Ahora el siguiente paso
                      es poner ese dinero a trabajar (ve a la pestaña del Simulador).
                    </p>
                  ) : (
                    <p>
                      • <strong>Tu ahorro está por debajo del 20%:</strong> Intenta la técnica de
                      <strong> "Pagarte a ti primero"</strong>: apenas recibas tu sueldo o ingresos,
                      separa el 10% a 15% automáticamente a una meta de ahorro antes de empezar a
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
                  Proyecta cómo crece tu dinero si inviertes de forma constante a lo largo del tiempo
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Capital Inicial ({settings.currency})</Label>
                  <Input
                    type="number"
                    step="100"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Aporte Mensual ({settings.currency})</Label>
                  <Input
                    type="number"
                    step="50"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Rendimiento Anual Estimado: <strong className="text-foreground">{annualRate}%</strong>
                  </Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="1"
                    max="50"
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
                      onClick={() => setAnnualRate('6')}
                      className="text-[10px] h-7 px-1.5 cursor-pointer"
                    >
                      🏦 Cuenta Ahorro (6%)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAnnualRate('8')}
                      className="text-[10px] h-7 px-1.5 cursor-pointer"
                    >
                      📦 Depósito Plazo (8%)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAnnualRate('11')}
                      className="text-[10px] h-7 px-1.5 cursor-pointer text-primary"
                    >
                      📈 S&P 500 / ETFs (11%)
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Horizonte de Tiempo: <strong className="text-foreground">{investmentYears} años</strong>
                  </Label>
                  <div className="flex items-center gap-2">
                    {['3', '5', '10', '15', '20', '25'].map((y) => (
                      <Button
                        key={y}
                        type="button"
                        variant={investmentYears === y ? 'default' : 'outline'}
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
                    Invertir de manera periódica (DCA) elimina el riesgo de intentar adivinar el mejor
                    momento del mercado. La disciplina supera al azar.
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
                Antes de invertir o asumir riesgos, necesitas un colchón en dinero líquido para
                afrontar imprevistos sin endeudarte con tarjetas ni préstamos.
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
                    <Badge variant="secondary" className="text-xs font-semibold">
                      3 Meses (Básico)
                    </Badge>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(emergency3Months)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ideal para jóvenes sin personas dependientes o con empleo muy estable.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCreateEmergencyGoal(3, emergency3Months)}
                    className="w-full text-xs cursor-pointer"
                  >
                    Crear Meta (3 Meses)
                  </Button>
                </div>

                {/* 6 Months */}
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="text-xs font-semibold">
                        6 Meses (Recomendado ⭐)
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(emergency6Months)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      El estándar de oro. Te permite sobrevivir medio año completo ante despidos o
                      emergencias médicas.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCreateEmergencyGoal(6, emergency6Months)}
                    className="w-full text-xs cursor-pointer font-semibold"
                  >
                    Crear Meta (6 Meses)
                  </Button>
                </div>

                {/* 12 Months */}
                <div className="p-4 rounded-xl border border-border bg-card flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs font-semibold">
                      12 Meses (Máxima Paz)
                    </Badge>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(emergency12Months)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Para emprendedores, freelancers con ingresos variables o con familia a cargo.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCreateEmergencyGoal(12, emergency12Months)}
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
                Si tienes deudas en tarjetas de crédito, ningún depósito ni fondo te pagará lo que
                la tarjeta te cobra de interés (hasta 40%-80% anual).
              </p>
              <div className="p-3 rounded-lg bg-muted/40 text-[11px] text-muted-foreground space-y-1">
                <p>
                  • <strong>Avalancha:</strong> Paga el mínimo en todas y ataca con todo a la deuda
                  de <em>mayor interés</em>. Ahorras la máxima cantidad de dinero.
                </p>
                <p>
                  • <strong>Bola de nieve:</strong> Ataca la de <em>menor saldo</em> para liquidarla
                  rápido. Te da una victoria psicológica inmediata.
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
                La mayoría comete el error de: <em>Ingresos - Gastos = Lo que sobra para ahorrar</em>.
                La realidad es que casi nunca sobra nada.
              </p>
              <div className="p-3 rounded-lg bg-muted/40 text-[11px] text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">
                  Fórmula correcta: Ingresos - Ahorro (10-20%) = Dinero disponible para gastar.
                </p>
                <p>
                  Apenas recibas tu pago, transfiérelo de inmediato a tu meta de ahorro o cuenta
                  separada. Te adaptarás a vivir con el saldo restante sin esfuerzo.
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
                Cuando sientas el impulso de comprar algo que no necesitas (ropa, gadgets, caprichos
                online), espera 48 horas antes de pagar.
              </p>
              <div className="p-3 rounded-lg bg-muted/40 text-[11px] text-muted-foreground">
                El 70% de las veces, la emoción de dopamina se disipa en 2 días y te darás cuenta
                de que en realidad no lo necesitabas, ahorrándote cientos de soles o dólares al mes.
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
                Nunca dejes el dinero del fondo de ahorro en tu cuenta de uso diario (donde tienes la
                tarjeta con la que pagas el almuerzo o las compras).
              </p>
              <div className="p-3 rounded-lg bg-muted/40 text-[11px] text-muted-foreground space-y-1">
                <p>
                  • Abre una cuenta en una entidad que pague rendimiento (cuentas remuneradas al 5%-7%
                  con seguro de depósitos FSD) sin costo de mantenimiento.
                </p>
                <p>
                  • Al no tener la tarjeta a mano en la calle, no caerás en la tentación de gastarlo.
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
