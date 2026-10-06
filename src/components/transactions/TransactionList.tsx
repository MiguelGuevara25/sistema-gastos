"use client";

import React, { useState, useMemo } from "react";
import { useFinance } from "../../context/FinanceContext";
import { CategoryIcon } from "../ui/CategoryIcon";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Users,
  Calendar,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingDown,
  TrendingUp,
  Scale,
} from "lucide-react";
import { PAYMENT_METHOD_LABELS } from "../../data/categories";
import { Transaction, TransactionType } from "../../types/finance";
import { SharedExpenseModal } from "./SharedExpenseModal";
import {
  parseISO,
  isToday,
  isYesterday,
  format,
} from "date-fns";
import { es } from "date-fns/locale";

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, "...", total];
  }
  if (current >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export const TransactionList: React.FC = () => {
  const {
    transactions,
    categories,
    formatCurrency,
    setIsAddModalOpen,
    setEditingTransaction,
    deleteTransaction,
    exportToCSV,
    convertAmount,
    settings,
  } = useFinance();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");
  const [onlyShared, setOnlyShared] = useState(false);

  // Date filters
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "yesterday" | "week" | "custom" | "range"
  >("all");
  const [customDate, setCustomDate] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [selectedSharedTx, setSelectedSharedTx] = useState<Transaction | null>(
    null,
  );
  const [isSharedModalOpen, setIsSharedModalOpen] = useState(false);

  // Reset pagination when filters change (React pattern for adjusting state based on other state)
  const filterKey = `${searchTerm}_${typeFilter}_${categoryFilter}_${methodFilter}_${sortOrder}_${onlyShared}_${dateFilter}_${customDate}_${rangeStart}_${rangeEnd}_${pageSize}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setCurrentPage(1);
  }

  // Filtered and Sorted
  const filteredTransactions = useMemo(() => {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = format(yesterday, "yyyy-MM-dd");

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = format(sevenDaysAgo, "yyyy-MM-dd");

    return transactions
      .filter((tx) => {
        if (onlyShared && !tx.sharedDetails) {
          return false;
        }
        if (
          searchTerm &&
          !tx.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !(tx.notes || "").toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }

        if (typeFilter !== "all" && tx.type !== typeFilter) {
          return false;
        }

        if (categoryFilter !== "all" && tx.categoryId !== categoryFilter) {
          return false;
        }

        if (methodFilter !== "all" && tx.paymentMethod !== methodFilter) {
          return false;
        }

        // Date filters
        if (dateFilter === "today" && tx.date !== todayStr) {
          return false;
        }
        if (dateFilter === "yesterday" && tx.date !== yesterdayStr) {
          return false;
        }
        if (
          dateFilter === "week" &&
          (tx.date < sevenDaysAgoStr || tx.date > todayStr)
        ) {
          return false;
        }
        if (dateFilter === "custom" && customDate && tx.date !== customDate) {
          return false;
        }
        if (dateFilter === "range") {
          if (rangeStart && tx.date < rangeStart) return false;
          if (rangeEnd && tx.date > rangeEnd) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === "newest") {
          const dateComp = (b.date || "").localeCompare(a.date || "");
          if (dateComp !== 0) return dateComp;
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        }
        if (sortOrder === "oldest") {
          const dateComp = (a.date || "").localeCompare(b.date || "");
          if (dateComp !== 0) return dateComp;
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeA - timeB;
        }
        if (sortOrder === "highest") {
          const amtB = convertAmount(b.amount, b.currency || settings.currencyCode, settings.currencyCode);
          const amtA = convertAmount(a.amount, a.currency || settings.currencyCode, settings.currencyCode);
          return amtB - amtA;
        }
        if (sortOrder === "lowest") {
          const amtB = convertAmount(b.amount, b.currency || settings.currencyCode, settings.currencyCode);
          const amtA = convertAmount(a.amount, a.currency || settings.currencyCode, settings.currencyCode);
          return amtA - amtB;
        }
        return 0;
      });
  }, [
    transactions,
    searchTerm,
    typeFilter,
    categoryFilter,
    methodFilter,
    sortOrder,
    onlyShared,
    dateFilter,
    customDate,
    rangeStart,
    rangeEnd,
    convertAmount,
    settings.currencyCode,
  ]);

  const formatDateLabel = (dateStr: string) => {
    try {
      const date = parseISO(dateStr + "T00:00:00");
      if (isToday(date)) return "Hoy";
      if (isYesterday(date)) return "Ayer";
      return format(date, "d 'de' MMM, yyyy", { locale: es });
    } catch {
      return dateStr;
    }
  };

  const dateFilterLabel = useMemo(() => {
    switch (dateFilter) {
      case "today":
        return "de hoy";
      case "yesterday":
        return "de ayer";
      case "week":
        return "de los últimos 7 días";
      case "custom":
        return customDate
          ? `del ${formatDateLabel(customDate)}`
          : "del día seleccionado";
      case "range":
        return rangeStart && rangeEnd
          ? `del ${formatDateLabel(rangeStart)} al ${formatDateLabel(rangeEnd)}`
          : "del rango seleccionado";
      default:
        return "del período";
    }
  }, [dateFilter, customDate, rangeStart, rangeEnd]);

  const { totalIncome, totalExpense, filteredNet } = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of filteredTransactions) {
      if (tx.isTransfer) continue;
      const amt = convertAmount
        ? convertAmount(tx.amount, tx.currency || settings.currencyCode, settings.currencyCode)
        : tx.amount;
      if (tx.type === "income") {
        income += amt;
      } else {
        expense += amt;
      }
    }
    return {
      totalIncome: income,
      totalExpense: expense,
      filteredNet: income - expense,
    };
  }, [filteredTransactions, convertAmount, settings.currencyCode]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / pageSize),
  );
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedTransactions = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, safeCurrentPage, pageSize]);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredTransactions.length);

  const getCategory = (catId: string) => {
    return (
      categories.find((c) => c.id === catId) || {
        id: catId,
        name: "General",
        icon: "HelpCircle",
        color: "#94a3b8",
        type: "expense" as const,
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Controls with shadcn Card */}
      <Card className="p-4 space-y-4">
        <CardContent className="p-0 space-y-3">
          {/* Search Bar + Main Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por concepto o notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-muted/30"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="flex-1 sm:flex-initial gap-2 h-10 text-xs font-medium cursor-pointer"
                title="Descargar en Excel/CSV"
              >
                <FileSpreadsheet className="size-4" />
                <span>Exportar CSV</span>
              </Button>

              <Button
                onClick={() => {
                  setEditingTransaction(null);
                  setIsAddModalOpen(true);
                }}
                className="flex-1 sm:flex-initial gap-2 h-10 text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Plus className="size-4" strokeWidth={2.5} />
                <span>Nuevo</span>
              </Button>
            </div>
          </div>

          {/* Filter Pills & Selects */}
          <div className="space-y-2.5 pt-2 border-t border-border text-xs">
            {/* Type Toggle Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              <div className="flex items-center p-1 bg-muted rounded-lg gap-1 shrink-0">
                <button
                  onClick={() => setTypeFilter("all")}
                  className={`px-3 py-1 rounded-md text-xs transition-all cursor-pointer ${
                    typeFilter === "all"
                      ? "bg-background text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setTypeFilter("expense")}
                  className={`px-3 py-1 rounded-md text-xs transition-all cursor-pointer ${
                    typeFilter === "expense"
                      ? "bg-background text-rose-400 font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Gastos
                </button>
                <button
                  onClick={() => setTypeFilter("income")}
                  className={`px-3 py-1 rounded-md text-xs transition-all cursor-pointer ${
                    typeFilter === "income"
                      ? "bg-background text-emerald-400 font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Ingresos
                </button>
                <button
                  onClick={() => setOnlyShared(!onlyShared)}
                  className={`px-3 py-1 rounded-md text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    onlyShared
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Users className="size-3.5" />
                  <span>Compartidos</span>
                </button>
              </div>
            </div>

            {/* Date Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              <div className="flex items-center p-1 bg-muted rounded-lg gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter("all");
                    setCustomDate("");
                    setRangeStart("");
                    setRangeEnd("");
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
                    dateFilter === "all"
                      ? "bg-background text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Todo el mes
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter("today")}
                  className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
                    dateFilter === "today"
                      ? "bg-background text-primary font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter("yesterday")}
                  className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
                    dateFilter === "yesterday"
                      ? "bg-background text-primary font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Ayer
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter("week")}
                  className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
                    dateFilter === "week"
                      ? "bg-background text-primary font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Últimos 7 días
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter("custom")}
                  className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    dateFilter === "custom"
                      ? "bg-background text-primary font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Calendar className="size-3" />
                  <span>Día puntual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter("range")}
                  className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    dateFilter === "range"
                      ? "bg-background text-primary font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CalendarRange className="size-3" />
                  <span>Rango</span>
                </button>
              </div>
            </div>

            {/* Custom Day Input */}
            {dateFilter === "custom" && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/80 text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5 shrink-0">
                  <Calendar className="size-3.5 text-primary" />
                  Elegir fecha:
                </span>
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="h-8 text-xs bg-background max-w-[170px] cursor-pointer"
                />
                {customDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCustomDate("")}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3 mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>
            )}

            {/* Custom Range Inputs */}
            {dateFilter === "range" && (
              <div className="flex flex-wrap items-center gap-2.5 p-2 rounded-lg bg-muted/40 border border-border/80 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-medium">Desde:</span>
                  <Input
                    type="date"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    className="h-8 text-xs bg-background max-w-[145px] cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-medium">Hasta:</span>
                  <Input
                    type="date"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    className="h-8 text-xs bg-background max-w-[145px] cursor-pointer"
                  />
                </div>
                {(rangeStart || rangeEnd) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRangeStart("");
                      setRangeEnd("");
                    }}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3 mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>
            )}

            {/* Dropdowns in responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Category Dropdown */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-8 px-2.5 bg-muted/40 border border-input rounded-lg text-foreground text-xs focus:outline-hidden focus:border-ring cursor-pointer"
              >
                <option
                  value="all"
                  className="bg-popover text-popover-foreground"
                >
                  Todas las Categorías
                </option>
                {categories.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                    className="bg-popover text-popover-foreground"
                  >
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Payment Method Dropdown */}
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full h-8 px-2.5 bg-muted/40 border border-input rounded-lg text-foreground text-xs focus:outline-hidden focus:border-ring cursor-pointer"
              >
                <option
                  value="all"
                  className="bg-popover text-popover-foreground"
                >
                  Todos los Métodos
                </option>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([k, label]) => (
                  <option
                    key={k}
                    value={k}
                    className="bg-popover text-popover-foreground"
                  >
                    {label}
                  </option>
                ))}
              </select>

              {/* Sort Order */}
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(
                    e.target.value as
                      | "newest"
                      | "oldest"
                      | "highest"
                      | "lowest",
                  )
                }
                className="w-full h-8 px-2.5 bg-muted/40 border border-input rounded-lg text-foreground text-xs focus:outline-hidden focus:border-ring cursor-pointer"
              >
                <option
                  value="newest"
                  className="bg-popover text-popover-foreground"
                >
                  Más recientes primero
                </option>
                <option
                  value="oldest"
                  className="bg-popover text-popover-foreground"
                >
                  Más antiguos primero
                </option>
                <option
                  value="highest"
                  className="bg-popover text-popover-foreground"
                >
                  Mayor monto
                </option>
                <option
                  value="lowest"
                  className="bg-popover text-popover-foreground"
                >
                  Menor monto
                </option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPI Strip for Current Date / Period Filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-card border border-border shadow-2xs">
        <div className="space-y-0.5">
          <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
            <TrendingDown className="size-3 text-rose-400" />
            Gastos {dateFilterLabel}
          </span>
          <p className="text-sm sm:text-base font-bold font-mono text-rose-400 truncate">
            -{formatCurrency(totalExpense)}
          </p>
        </div>
        <div className="space-y-0.5">
          <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
            <TrendingUp className="size-3 text-emerald-400" />
            Ingresos {dateFilterLabel}
          </span>
          <p className="text-sm sm:text-base font-bold font-mono text-emerald-400 truncate">
            +{formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="space-y-0.5">
          <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
            <Scale className="size-3 text-primary" />
            Balance neto
          </span>
          <p
            className={`text-sm sm:text-base font-bold font-mono truncate ${
              filteredNet >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {filteredNet > 0 ? "+" : ""}
            {formatCurrency(filteredNet)}
          </p>
        </div>
        <div className="space-y-0.5">
          <span className="text-[11px] text-muted-foreground font-medium">
            Total movimientos
          </span>
          <p className="text-sm sm:text-base font-bold font-mono text-foreground">
            {filteredTransactions.length}
          </p>
        </div>
      </div>

      {/* Transactions List with shadcn Card */}
      <Card className="overflow-hidden shadow-xs">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No se encontraron movimientos
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Prueba cambiando los filtros de búsqueda
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedTransactions.map((tx) => {
              const cat = getCategory(tx.categoryId);
              const isExpense = tx.type === "expense";

              return (
                <div
                  key={tx.id}
                  className="p-3 sm:p-4 sm:px-6 hover:bg-muted/40 transition-colors flex items-center justify-between gap-2.5 sm:gap-4 group"
                >
                  {/* Left: Icon + Info */}
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border border-border"
                      style={{ backgroundColor: `${cat.color}15` }}
                    >
                      <CategoryIcon
                        name={cat.icon}
                        color={cat.color}
                        size={16}
                      />
                    </div>

                    <div className="min-w-0 space-y-0.5 sm:space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
                          {tx.description}
                        </span>
                        {tx.isTransfer ? (
                          <Badge
                            variant="secondary"
                            className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0 shrink-0 bg-blue-500/15 text-blue-400 border border-blue-500/20"
                          >
                            Transferencia
                          </Badge>
                        ) : (
                          <Badge
                            variant={isExpense ? "destructive" : "default"}
                            className={`text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0 shrink-0 ${
                              !isExpense
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                : ""
                            }`}
                          >
                            {isExpense ? "Gasto" : "Ingreso"}
                          </Badge>
                        )}
                        {tx.sharedDetails && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSharedTx(tx);
                              setIsSharedModalOpen(true);
                            }}
                            className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                              tx.sharedDetails.isFullySettled
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                            }`}
                            title="Gestionar cobros a terceros"
                          >
                            <Users className="size-2.5 sm:size-3" />
                            <span>
                              {tx.sharedDetails.isFullySettled
                                ? "Reembolsado"
                                : `Te deben ${formatCurrency(
                                    tx.sharedDetails.participants
                                      .filter((p) => !p.settled)
                                      .reduce((s, p) => s + p.amount, 0),
                                    tx.currency,
                                  )}`}
                            </span>
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 text-[10px] sm:text-xs text-muted-foreground">
                        <span className="truncate max-w-[90px] sm:max-w-none">
                          {cat.name}
                        </span>
                        <span>•</span>
                        <span>{formatDateLabel(tx.date)}</span>
                        <span className="hidden xs:inline">•</span>
                        <span className="hidden xs:inline">
                          {PAYMENT_METHOD_LABELS[tx.paymentMethod] ||
                            tx.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-xs sm:text-base font-bold whitespace-nowrap ${
                          tx.isTransfer
                            ? "text-blue-400"
                            : isExpense
                            ? "text-foreground"
                            : "text-emerald-400"
                        }`}
                      >
                        {tx.isTransfer ? "⇄ " : isExpense ? "-" : "+"}
                        {formatCurrency(tx.amount, tx.currency)}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingTransaction(tx);
                          setIsAddModalOpen(true);
                        }}
                        title="Editar movimiento"
                        className="size-7 sm:size-8 cursor-pointer text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="size-3 sm:size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (
                            confirm(`¿Deseas eliminar "${tx.description}"?`)
                          ) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        title="Eliminar movimiento"
                        className="size-7 sm:size-8 cursor-pointer text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3 sm:size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Pagination Controls */}
      {filteredTransactions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-card border border-border rounded-xl text-xs shadow-2xs">
          {/* Left: Range text & page size selector */}
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3 text-muted-foreground">
            <span>
              Mostrando{" "}
              <strong className="text-foreground">
                {startIndex + 1} - {endIndex}
              </strong>{" "}
              de <strong className="text-foreground">{filteredTransactions.length}</strong>
            </span>

            <div className="flex items-center gap-1.5">
              <span className="hidden xs:inline text-[11px]">Por pág:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-muted/40 border border-input rounded-md px-2 py-1 text-xs text-foreground focus:outline-none cursor-pointer"
              >
                <option value={10} className="bg-popover text-popover-foreground">10</option>
                <option value={15} className="bg-popover text-popover-foreground">15</option>
                <option value={25} className="bg-popover text-popover-foreground">25</option>
                <option value={50} className="bg-popover text-popover-foreground">50</option>
              </select>
            </div>
          </div>

          {/* Right: Page navigation buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* Previous page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="h-8 px-2.5 text-xs gap-1 cursor-pointer disabled:opacity-30"
              >
                <ChevronLeft className="size-3.5" />
                <span className="hidden xs:inline">Anterior</span>
              </Button>

              {/* Page numbers (visible on sm+ screens) */}
              <div className="hidden sm:flex items-center gap-1 px-1">
                {getPageNumbers(safeCurrentPage, totalPages).map((p, idx) =>
                  p === "..." ? (
                    <span key={`dots-${idx}`} className="px-1 text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={safeCurrentPage === p ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(Number(p))}
                      className="h-8 w-8 p-0 text-xs font-semibold cursor-pointer"
                    >
                      {p}
                    </Button>
                  )
                )}
              </div>

              {/* Mobile page indicator */}
              <span className="sm:hidden px-2 text-xs font-semibold text-foreground">
                {safeCurrentPage} / {totalPages}
              </span>

              {/* Next page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="h-8 px-2.5 text-xs gap-1 cursor-pointer disabled:opacity-30"
              >
                <span className="hidden xs:inline">Siguiente</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Shared Expense Management Modal */}
      <SharedExpenseModal
        transaction={selectedSharedTx}
        isOpen={isSharedModalOpen}
        onClose={() => {
          setIsSharedModalOpen(false);
          setSelectedSharedTx(null);
        }}
      />
    </div>
  );
};
