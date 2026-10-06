"use client";

import { useState, useMemo, useRef } from "react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { useFinance } from "../../context/FinanceContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FileText,
  Wallet,
  PieChart,
  Receipt,
  HandCoins,
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Scale,
  Sparkles,
  TrendingUp,
  Download,
  Loader2,
  ExternalLink,
  X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
}) => {
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
    if (selectedMonth && selectedMonth !== "all") return selectedMonth;
    return format(new Date(), "yyyy-MM");
  }, [selectedMonth]);

  const [reportMonth, setReportMonth] = useState<string>(defaultMonth);

  // Month label
  const monthLabel = useMemo(() => {
    const item = availableMonths.find((m) => m.value === reportMonth);
    if (item) return item.label;
    try {
      const date = parseISO(`${reportMonth}-01`);
      const formatted = format(date, "MMMM yyyy", { locale: es });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return reportMonth;
    }
  }, [reportMonth, availableMonths]);

  // Folio / Reference code
  const folioCode = useMemo(() => {
    const cleanMonth = reportMonth.replace(/[^0-9]/g, "");
    return `FP-${cleanMonth || "2026"}-089`;
  }, [reportMonth]);

  // Transactions of report month
  const monthTransactions = useMemo(() => {
    return allTransactions.filter(
      (tx) => tx.date && tx.date.startsWith(reportMonth),
    );
  }, [allTransactions, reportMonth]);

  // Metrics for report month
  const {
    totalIncome,
    totalExpenses,
    incomeCount,
    expenseCount,
    netBalance,
    savingsRate,
    budgetUsagePercent,
    budgetRemaining,
  } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let inCount = 0;
    let exCount = 0;

    monthTransactions.forEach((tx) => {
      if (tx.type === "income") {
        income += Number(tx.amount) || 0;
        inCount++;
      } else {
        expenses += Number(tx.amount) || 0;
        exCount++;
      }
    });

    const net = income - expenses;
    const rate = income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;
    const budgetUsage =
      settings.monthlyBudget > 0
        ? Math.round((expenses / settings.monthlyBudget) * 100)
        : 0;
    const remaining = settings.monthlyBudget - expenses;

    return {
      totalIncome: income,
      totalExpenses: expenses,
      incomeCount: inCount,
      expenseCount: exCount,
      netBalance: net,
      savingsRate: rate,
      budgetUsagePercent: budgetUsage,
      budgetRemaining: remaining,
    };
  }, [monthTransactions, settings.monthlyBudget]);

  // Category breakdown for report month
  const topCategories = useMemo(() => {
    const expenseTx = monthTransactions.filter((t) => t.type === "expense");
    const totalExp = expenseTx.reduce(
      (acc, curr) => acc + (Number(curr.amount) || 0),
      0,
    );
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
        name: "Sin Categoría",
        icon: "HelpCircle",
        color: "#64748b",
        type: "expense" as const,
      };
      const percentage =
        totalExp > 0 ? Math.round((data.amount / totalExp) * 100) : 0;
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
    const needsCategories = [
      "cat-vivienda",
      "cat-servicios",
      "cat-alimentacion",
      "cat-transporte",
      "cat-salud",
    ];
    let needs = 0;
    let wants = 0;

    monthTransactions.forEach((tx) => {
      if (tx.type === "expense") {
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

    let diagnosis =
      "Estructura saludable: Los gastos operativos y de estilo de vida se mantuvieron dentro de márgenes recomendados.";
    let status: "optimal" | "warning" | "alert" = "optimal";

    if (income === 0 && totalExpenses === 0) {
      diagnosis = "Sin actividad financiera registrada durante el período analizado.";
      status = "optimal";
    } else if (needsPct > 60) {
      diagnosis =
        "Atención en costos fijos: Las necesidades básicas absorbieron más del 60% de los ingresos. Se aconseja auditar contratos y servicios.";
      status = "warning";
    } else if (wantsPct > 35) {
      diagnosis =
        "Alerta de ocio/estilo de vida: Los consumos discrecionales superaron el umbral del 30%. Conviene contener gastos no esenciales.";
      status = "alert";
    } else if (netBalance < 0) {
      diagnosis =
        "Déficit operativo: Los egresos totales superaron los ingresos del mes. Se requiere ajuste de presupuesto.";
      status = "alert";
    }

    return { needs, wants, needsPct, wantsPct, savingsPct, diagnosis, status };
  }, [monthTransactions, totalIncome, totalExpenses, netBalance]);

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
            tx.type === "expense" &&
            tx.description.toLowerCase().trim() ===
              exp.name.toLowerCase().trim(),
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
      if (d.status === "pending") {
        if (d.type === "lent") lent += d.amount;
        if (d.type === "borrowed") borrowed += d.amount;
      }
    });
    return { lent, borrowed, net: lent - borrowed };
  }, [debtsLoans]);

  // Phantom expenses calculation for report month
  const reportPhantomSummary = useMemo(() => {
    const threshold = settings.phantomExpenseThreshold || 20;
    const phantomTx = monthTransactions.filter((t) => {
      if (t.type !== "expense") return false;
      return t.amount <= threshold || t.tags?.includes("gasto-hormiga");
    });
    const total = phantomTx.reduce(
      (sum, t) => sum + (Number(t.amount) || 0),
      0,
    );
    const count = phantomTx.length;
    const percentage =
      totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0;
    return {
      total,
      count,
      percentage,
      annualProjection: total * 12,
      annualSavings50: total * 6,
    };
  }, [monthTransactions, totalExpenses, settings.phantomExpenseThreshold]);

  // Total consolidated liquidity across all accounts
  const totalLiquidity = useMemo(() => {
    return accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  }, [accounts]);

  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Generate real PDF file directly using jsPDF + html-to-image
  const generatePDFDocument = async () => {
    if (!reportRef.current) return null;
    const element = reportRef.current;

    const imgData = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2, // 2x retina sharpness
      backgroundColor: "#ffffff",
      cacheBust: true,
      skipFonts: true,
    });

    const img = new Image();
    img.src = imgData;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const imgWidth = pdfWidth;
    const imgHeight = (img.naturalHeight * imgWidth) / img.naturalWidth;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pdfHeight;
    }

    return pdf;
  };

  const handleDownloadPDF = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      const pdf = await generatePDFDocument();
      if (pdf) {
        pdf.save(`FinanzaPro_Reporte_${reportMonth}.pdf`);
      }
    } catch (err) {
      console.error("Error al exportar PDF:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenPDF = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      const pdf = await generatePDFDocument();
      if (pdf) {
        const blob = pdf.output("blob");
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
      }
    } catch (err) {
      console.error("Error al abrir PDF:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const currentDate = useMemo(() => {
    return format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es });
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[98vw] max-w-5xl max-h-[94vh] overflow-y-auto p-0 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-slate-100 dark:bg-slate-950 print:max-h-none print:overflow-visible print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none print:static print:transform-none print:bg-white">
        {/* Modal Controls Header (Screen only) */}
        <div className="no-print p-4 sm:p-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Informe Financiero Ejecutivo Mensual
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Descarga directa en archivo .PDF oficial o visualización en pantalla
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            {/* Month Picker */}
            <select
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 focus:outline-none cursor-pointer h-9 shadow-xs"
            >
              {availableMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            {/* Direct PDF Download Button */}
            <Button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              size="sm"
              className="gap-2 cursor-pointer font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 text-xs rounded-lg transition-colors"
            >
              {isExporting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  <span>Descargar PDF</span>
                </>
              )}
            </Button>

            {/* Open / Print Button */}
            <Button
              onClick={handleOpenPDF}
              disabled={isExporting}
              variant="outline"
              size="sm"
              className="gap-1.5 cursor-pointer font-semibold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 h-9 px-3 text-xs rounded-lg"
              title="Abrir PDF en una pestaña para imprimir"
            >
              <ExternalLink className="size-3.5" />
              <span className="hidden sm:inline">Abrir / Imprimir</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg cursor-pointer"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Paper Sheet Preview Area */}
        <div className="p-3 sm:p-6 lg:p-8 bg-slate-200/60 dark:bg-slate-950/80 flex justify-center print:p-0 print:bg-white">
          {/* Printable Report Canvas - Strict high-contrast styling */}
          <div ref={reportRef} id="report-canvas" className="printable-report w-full max-w-[850px] bg-white text-slate-900 p-6 sm:p-10 rounded-xl shadow-xl border border-slate-300/80 space-y-6 print:shadow-none print:border-none print:p-0 print:rounded-none print:max-w-none print:space-y-4 print:text-slate-900">
            
            {/* 1. Formal Executive Header */}
            <div className="border-b-2 border-slate-900 pb-5 page-break-avoid">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Brand & Document Name */}
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Wallet className="size-4.5" />
                    </div>
                    <div>
                      <span className="text-xl font-black tracking-tight text-slate-900 block leading-none">
                        FINANZA PRO
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mt-0.5">
                        Financial Management & Intelligence
                      </span>
                    </div>
                  </div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-3 tracking-tight">
                    ESTADO DE SITUACIÓN FINANCIERA MENSUAL
                  </h1>
                  <p className="text-xs text-slate-500">
                    Dictamen de balance mensual, ejecución presupuestaria y flujo de fondos
                  </p>
                </div>

                {/* Metadata Table Box */}
                <div className="w-full sm:w-auto min-w-[240px] bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs space-y-1.5">
                  <div className="flex justify-between items-center pb-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Período:</span>
                    <strong className="text-slate-900 font-bold uppercase">{monthLabel}</strong>
                  </div>
                  <div className="flex justify-between items-center pb-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Titular:</span>
                    <strong className="text-slate-900 font-semibold">{settings.userName || "Usuario Principal"}</strong>
                  </div>
                  <div className="flex justify-between items-center pb-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Moneda Base:</span>
                    <span className="font-mono font-bold text-slate-800">{settings.currency || "PEN"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Emisión:</span>
                    <span className="text-slate-700">{currentDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Folio:</span>
                    <span className="font-mono text-[11px] font-bold text-slate-600">{folioCode}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Executive KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 page-break-avoid">
              {/* Total Income */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      Ingresos Totales
                    </span>
                    <ArrowDownLeft className="size-4 text-emerald-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-700 font-mono tracking-tight">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <p className="text-[10px] text-emerald-700/80 font-medium mt-1.5">
                  {incomeCount} entradas registradas
                </p>
              </div>

              {/* Total Expenses */}
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                      Gastos Totales
                    </span>
                    <ArrowUpRight className="size-4 text-rose-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-rose-700 font-mono tracking-tight">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
                <p className="text-[10px] text-rose-700/80 font-medium mt-1.5">
                  {expenseCount} salidas registradas
                </p>
              </div>

              {/* Net Balance */}
              <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                netBalance >= 0
                  ? "border-blue-200 bg-blue-50/60"
                  : "border-amber-200 bg-amber-50/60"
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${
                      netBalance >= 0 ? "text-blue-800" : "text-amber-800"
                    }`}>
                      Balance Neto
                    </span>
                    <Scale className={`size-4 ${netBalance >= 0 ? "text-blue-600" : "text-amber-600"}`} />
                  </div>
                  <p className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
                    netBalance >= 0 ? "text-blue-800" : "text-amber-900"
                  }`}>
                    {netBalance >= 0 ? "+" : ""}{formatCurrency(netBalance)}
                  </p>
                </div>
                <p className={`text-[10px] font-bold mt-1.5 ${
                  netBalance >= 0 ? "text-blue-700" : "text-amber-800"
                }`}>
                  {netBalance >= 0 ? "Superávit operativo" : "Déficit mensual"}
                </p>
              </div>

              {/* Savings Rate */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Tasa de Ahorro
                    </span>
                    <TrendingUp className="size-4 text-slate-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                    {savingsRate}%
                  </p>
                </div>
                <p className="text-[10px] text-slate-600 font-medium mt-1.5">
                  Meta estándar: 20%+
                </p>
              </div>
            </div>

            {/* 3. Budget vs Actual & 50/30/20 Structural Diagnostic */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/80 space-y-4 page-break-avoid">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <PieChart className="size-4 text-slate-800" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Ejecución Presupuestaria y Diagnóstico 50 / 30 / 20
                  </h2>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    rule503020.status === "optimal"
                      ? "border-emerald-500 text-emerald-800 bg-emerald-50"
                      : rule503020.status === "warning"
                      ? "border-amber-500 text-amber-800 bg-amber-50"
                      : "border-rose-500 text-rose-800 bg-rose-50"
                  }`}
                >
                  {rule503020.status === "optimal"
                    ? "Estructura Saludable"
                    : rule503020.status === "warning"
                    ? "Observación Preventiva"
                    : "Desbalance de Gastos"}
                </Badge>
              </div>

              {/* Monthly Budget Bar */}
              {settings.monthlyBudget > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-medium">
                      Presupuesto Mensual Planeado: <strong>{formatCurrency(settings.monthlyBudget)}</strong>
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      Consumido: {budgetUsagePercent}% ({formatCurrency(totalExpenses)})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all ${
                        budgetUsagePercent > 100
                          ? "bg-rose-500"
                          : budgetUsagePercent > 85
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>
                      {budgetRemaining >= 0
                        ? `Disponible para gastar: ${formatCurrency(budgetRemaining)}`
                        : `Presupuesto excedido por: ${formatCurrency(Math.abs(budgetRemaining))}`}
                    </span>
                    <span>Meta: ≤ 100%</span>
                  </div>
                </div>
              )}

              {/* 50/30/20 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Needs 50% */}
                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Necesidades (Meta 50%)</span>
                    <span className="font-mono font-bold text-blue-700">{rule503020.needsPct}%</span>
                  </div>
                  <p className="text-base font-extrabold text-slate-900 font-mono">
                    {formatCurrency(rule503020.needs)}
                  </p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, rule503020.needsPct)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block pt-0.5">
                    Vivienda, alimentación, servicios, salud
                  </span>
                </div>

                {/* Wants 30% */}
                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Deseos y Ocio (Meta 30%)</span>
                    <span className="font-mono font-bold text-purple-700">{rule503020.wantsPct}%</span>
                  </div>
                  <p className="text-base font-extrabold text-slate-900 font-mono">
                    {formatCurrency(rule503020.wants)}
                  </p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, rule503020.wantsPct)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block pt-0.5">
                    Entretenimiento, salidas, compras personales
                  </span>
                </div>

                {/* Savings 20% */}
                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Ahorro e Inversión (Meta 20%)</span>
                    <span className="font-mono font-bold text-emerald-700">{rule503020.savingsPct}%</span>
                  </div>
                  <p className="text-base font-extrabold text-emerald-700 font-mono">
                    {formatCurrency(Math.max(0, netBalance))}
                  </p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, rule503020.savingsPct)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block pt-0.5">
                    Fondo de emergencia, reservas, metas
                  </span>
                </div>
              </div>

              {/* Narrative Diagnosis */}
              <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                <Sparkles className="size-4 text-slate-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Evaluación Estructural:</strong> {rule503020.diagnosis}
                </p>
              </div>
            </div>

            {/* 4. Top Expense Categories Breakdown */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3 page-break-avoid">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Desglose de Principales Categorías de Gasto
                </h2>
                <span className="text-xs text-slate-500">Top 5 partidas</span>
              </div>

              {topCategories.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No hay gastos registrados en este mes para clasificar.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 bg-slate-50">
                        <th className="py-2 px-3">Categoría</th>
                        <th className="py-2 px-3 text-center">Operaciones</th>
                        <th className="py-2 px-3 text-right">Importe Total</th>
                        <th className="py-2 px-3 text-right">% del Gasto</th>
                        <th className="py-2 px-3 w-36">Distribución</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topCategories.map((item) => (
                        <tr key={item.category.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: item.category.color || "#64748b" }}
                            />
                            {item.category.name}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600 font-mono">
                            {item.count}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-700 font-mono">
                            {item.percentage}%
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${item.percentage}%`,
                                  backgroundColor: item.category.color || "#0f172a",
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 5. Recurring Bills & Debts Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 page-break-avoid">
              {/* Commitments & Subscriptions */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <Receipt className="size-4 text-slate-800" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Compromisos y Gastos Fijos
                    </h3>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex justify-between items-center">
                      <span className="text-slate-600">Presupuesto Fijo Total:</span>
                      <strong className="font-mono font-bold text-slate-900">
                        {formatCurrency(recurringSummary.total)}
                      </strong>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex justify-between items-center">
                      <span className="text-slate-600">Total Liquidado / Pagado:</span>
                      <strong className="font-mono font-bold text-emerald-700">
                        {formatCurrency(recurringSummary.paid)}
                      </strong>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex justify-between items-center">
                      <span className="text-slate-600">Pendiente por Pagar:</span>
                      <strong className="font-mono font-bold text-amber-700">
                        {formatCurrency(recurringSummary.pending)}
                      </strong>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 mt-2">
                  Control de vencimientos mensuales y suscripciones contratadas.
                </p>
              </div>

              {/* Debt & Loan Position */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <HandCoins className="size-4 text-slate-800" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Posición de Deudas y Créditos
                    </h3>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex justify-between items-center">
                      <span className="text-slate-600">Por Cobrar (Activo Exigible):</span>
                      <strong className="font-mono font-bold text-emerald-700">
                        {formatCurrency(debtsSummary.lent)}
                      </strong>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex justify-between items-center">
                      <span className="text-slate-600">Por Pagar (Pasivo Corriente):</span>
                      <strong className="font-mono font-bold text-rose-700">
                        {formatCurrency(debtsSummary.borrowed)}
                      </strong>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex justify-between items-center">
                      <span className="text-slate-600">Posición Neta:</span>
                      <strong className={`font-mono font-bold ${
                        debtsSummary.net >= 0 ? "text-emerald-700" : "text-rose-700"
                      }`}>
                        {debtsSummary.net >= 0 ? "+" : ""}{formatCurrency(debtsSummary.net)}
                      </strong>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 mt-2">
                  {debtsSummary.borrowed === 0
                    ? "Excelente: Sin obligaciones de deuda pendientes con terceros."
                    : "Prioriza la liquidación de pasivos para liberar flujo de caja."}
                </p>
              </div>
            </div>

            {/* 6. Phantom Expenses Audit */}
            <div className="border border-amber-300 rounded-xl p-4 bg-amber-50/70 space-y-2 page-break-avoid">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 pb-2 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="size-4 text-amber-800" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Auditoría de Micro-Gastos y Fugas Silenciosas (Gastos Hormiga)
                  </h3>
                </div>
                <span className="font-mono font-bold text-xs text-amber-950 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                  {formatCurrency(reportPhantomSummary.total)} ({reportPhantomSummary.percentage}% del total de gastos)
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed pt-1">
                Se identificaron <strong>{reportPhantomSummary.count}</strong> micro-transacciones menores o iguales a {formatCurrency(settings.phantomExpenseThreshold || 20)}. Si se optimiza este rubro al 50%, se proyecta una liberación anual de capital de <strong>{formatCurrency(reportPhantomSummary.annualSavings50)}</strong> para canalizar a fondos de inversión o metas patrimoniales.
              </p>
            </div>

            {/* 7. Consolidated Account Balances & Liquidity */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3 page-break-avoid">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-slate-800" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Consolidado de Liquidez y Posición en Cuentas
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 font-medium mr-1.5">Patrimonio Líquido Total:</span>
                  <strong className="text-xs font-mono font-bold text-slate-900">
                    {formatCurrency(totalLiquidity)}
                  </strong>
                </div>
              </div>

              {accounts.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">
                  No hay cuentas registradas en el sistema.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {accounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1"
                    >
                      <p className="font-semibold text-slate-800 truncate" title={acc.name}>
                        {acc.name}
                      </p>
                      <p className="font-mono font-bold text-slate-900">
                        {formatCurrency(acc.balance)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 8. Executive Conclusions & Official Certification */}
            <div className="border-t-2 border-slate-900 pt-4 space-y-4 page-break-avoid">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Dictamen y Conclusiones del Período
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                  <li>
                    {netBalance >= 0
                      ? `Cierre favorable del período con un superávit neto de ${formatCurrency(netBalance)}, alcanzando una tasa de ahorro del ${savingsRate}%.`
                      : `El período cerró con un déficit neto de ${formatCurrency(Math.abs(netBalance))}. Se recomienda reajustar los gastos discrecionales.`}
                  </li>
                  {settings.monthlyBudget > 0 && (
                    <li>
                      {budgetUsagePercent <= 100
                        ? `Alineamiento presupuestario adecuado: Se ejecutó el ${budgetUsagePercent}% del presupuesto mensual establecido (${formatCurrency(settings.monthlyBudget)}).`
                        : `Desvío de presupuesto: Los egresos superaron el límite planeado en un ${budgetUsagePercent - 100}% (${formatCurrency(totalExpenses - settings.monthlyBudget)} adicionales).`}
                    </li>
                  )}
                  <li>
                    {debtsSummary.borrowed > 0
                      ? `Existen compromisos de deuda vigentes por ${formatCurrency(debtsSummary.borrowed)}. Se sugiere mantener control de amortizaciones.`
                      : "La posición de deuda corriente es nula, garantizando solvencia financiera."}
                  </li>
                </ul>
              </div>

              {/* Signature & Seal Block */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs text-slate-600 border-t border-slate-200 mt-6">
                <div>
                  <div className="w-40 border-b border-slate-400 mx-auto mb-1.5 h-8" />
                  <p className="font-semibold text-slate-900">Finanza Pro Engine</p>
                  <p className="text-[10px] text-slate-500">Sistema Automatizado de Control</p>
                </div>
                <div>
                  <div className="w-40 border-b border-slate-400 mx-auto mb-1.5 h-8" />
                  <p className="font-semibold text-slate-900">{settings.userName || "Titular de la Cuenta"}</p>
                  <p className="text-[10px] text-slate-500">Revisión y Aprobación Conforme</p>
                </div>
              </div>

              {/* Official Document Footer Notice */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                <p>Documento oficial emitido por Finanza Pro • Uso privado y confidencial</p>
                <p>Verificación: {folioCode} • {format(new Date(), "yyyy-MM-dd HH:mm")}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Action Footer (Screen only) */}
        <div className="no-print p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
          <p className="text-xs text-slate-500 hidden sm:block">
            Generación directa de archivo .PDF oficial sin cortes ni marcas de navegador.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="cursor-pointer text-xs font-semibold"
            >
              Cerrar
            </Button>
            <Button
              onClick={handleOpenPDF}
              disabled={isExporting}
              variant="outline"
              className="cursor-pointer font-semibold gap-1.5 text-xs border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              <ExternalLink className="size-3.5" />
              <span>Ver en Pestaña</span>
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="cursor-pointer font-bold gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {isExporting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  <span>Descargar Archivo PDF</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
