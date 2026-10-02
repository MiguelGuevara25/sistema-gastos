"use client";

import React, { useState, useMemo } from "react";
import { useFinance } from "../../context/FinanceContext";
import { CategoryIcon } from "../ui/CategoryIcon";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Trash2, Edit2, FileSpreadsheet } from "lucide-react";
import { PAYMENT_METHOD_LABELS } from "../../data/categories";
import { TransactionType } from "../../types/finance";
import {
  compareAsc,
  compareDesc,
  parseISO,
  isToday,
  isYesterday,
  format,
} from "date-fns";
import { es } from "date-fns/locale";

export const TransactionList: React.FC = () => {
  const {
    transactions,
    categories,
    formatCurrency,
    setIsAddModalOpen,
    setEditingTransaction,
    deleteTransaction,
    exportToCSV,
  } = useFinance();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");

  // Filtered and Sorted
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
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

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === "newest")
          return compareDesc(parseISO(a.date), parseISO(b.date));
        if (sortOrder === "oldest")
          return compareAsc(parseISO(a.date), parseISO(b.date));
        if (sortOrder === "highest") return b.amount - a.amount;
        if (sortOrder === "lowest") return a.amount - b.amount;
        return 0;
      });
  }, [
    transactions,
    searchTerm,
    typeFilter,
    categoryFilter,
    methodFilter,
    sortOrder,
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

  const filteredTotal = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
      return curr.type === "income" ? acc + curr.amount : acc - curr.amount;
    }, 0);
  }, [filteredTransactions]);

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
              </div>
            </div>

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

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <div>
          Mostrando{" "}
          <span className="font-semibold text-foreground">
            {filteredTransactions.length}
          </span>{" "}
          {filteredTransactions.length === 1 ? "movimiento" : "movimientos"}
        </div>
        <div>
          Balance filtrado:{" "}
          <span
            className={`font-semibold ${
              filteredTotal >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {formatCurrency(filteredTotal)}
          </span>
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
            {filteredTransactions.map((tx) => {
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
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-32.5 xs:max-w-[180px] sm:max-w-none">
                          {tx.description}
                        </span>
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
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 text-[10px] sm:text-xs text-muted-foreground">
                        <span className="truncate max-w-22.5 sm:max-w-none">
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
                          isExpense ? "text-foreground" : "text-emerald-400"
                        }`}
                      >
                        {isExpense ? "-" : "+"}
                        {formatCurrency(tx.amount)}
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
    </div>
  );
};
