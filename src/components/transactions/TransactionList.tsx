'use client';

import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  Tag,
  FileSpreadsheet,
} from 'lucide-react';
import { PAYMENT_METHOD_LABELS } from '../../data/categories';
import { TransactionType } from '../../types/finance';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Filtered and Sorted
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (
          searchTerm &&
          !tx.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !(tx.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }

        if (typeFilter !== 'all' && tx.type !== typeFilter) {
          return false;
        }

        if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) {
          return false;
        }

        if (methodFilter !== 'all' && tx.paymentMethod !== methodFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortOrder === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortOrder === 'highest') return b.amount - a.amount;
        if (sortOrder === 'lowest') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchTerm, typeFilter, categoryFilter, methodFilter, sortOrder]);

  const filteredTotal = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
      return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
    }, 0);
  }, [filteredTransactions]);

  const getCategory = (catId: string) => {
    return categories.find((c) => c.id === catId) || {
      id: catId,
      name: 'General',
      icon: 'HelpCircle',
      color: '#94a3b8',
      type: 'expense' as const,
    };
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
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border text-xs">
            {/* Type Toggle Pills using shadcn Button variants */}
            <div className="flex items-center p-1 bg-muted rounded-lg gap-1">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1 rounded-md text-xs transition-all cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-background text-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`px-3 py-1 rounded-md text-xs transition-all cursor-pointer ${
                  typeFilter === 'expense'
                    ? 'bg-background text-rose-400 font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Solo Gastos
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`px-3 py-1 rounded-md text-xs transition-all cursor-pointer ${
                  typeFilter === 'income'
                    ? 'bg-background text-emerald-400 font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Solo Ingresos
              </button>
            </div>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 px-2.5 bg-muted/40 border border-input rounded-lg text-foreground text-xs focus:outline-hidden focus:border-ring cursor-pointer"
            >
              <option value="all" className="bg-popover text-popover-foreground">Todas las Categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-popover text-popover-foreground">
                  {c.name}
                </option>
              ))}
            </select>

            {/* Payment Method Dropdown */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-8 px-2.5 bg-muted/40 border border-input rounded-lg text-foreground text-xs focus:outline-hidden focus:border-ring cursor-pointer"
            >
              <option value="all" className="bg-popover text-popover-foreground">Todos los Métodos</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, label]) => (
                <option key={k} value={k} className="bg-popover text-popover-foreground">
                  {label}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <div className="ml-auto">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="h-8 px-2.5 bg-muted/40 border border-input rounded-lg text-foreground text-xs focus:outline-hidden focus:border-ring cursor-pointer"
              >
                <option value="newest" className="bg-popover text-popover-foreground">Más recientes primero</option>
                <option value="oldest" className="bg-popover text-popover-foreground">Más antiguos primero</option>
                <option value="highest" className="bg-popover text-popover-foreground">Mayor monto</option>
                <option value="lowest" className="bg-popover text-popover-foreground">Menor monto</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <div>
          Mostrando <span className="font-semibold text-foreground">{filteredTransactions.length}</span>{' '}
          {filteredTransactions.length === 1 ? 'movimiento' : 'movimientos'}
        </div>
        <div>
          Balance filtrado:{' '}
          <span
            className={`font-semibold ${
              filteredTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'
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
            <p className="text-sm font-medium text-muted-foreground">No se encontraron movimientos</p>
            <p className="text-xs text-muted-foreground mt-1">Prueba cambiando los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTransactions.map((tx) => {
              const cat = getCategory(tx.categoryId);
              const isExpense = tx.type === 'expense';

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:px-6 hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  {/* Left: Icon + Info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-border mt-0.5 sm:mt-0"
                      style={{ backgroundColor: `${cat.color}15` }}
                    >
                      <CategoryIcon name={cat.icon} color={cat.color} size={18} />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {tx.description}
                        </span>
                        <Badge
                          variant={isExpense ? 'destructive' : 'default'}
                          className={`text-[10px] font-semibold px-2 py-0 ${
                            !isExpense ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : ''
                          }`}
                        >
                          {isExpense ? 'Gasto' : 'Ingreso'}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Tag className="size-3 text-muted-foreground" />
                          {cat.name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-muted-foreground" />
                          {tx.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="size-3 text-muted-foreground" />
                          {PAYMENT_METHOD_LABELS[tx.paymentMethod] || tx.paymentMethod}
                        </span>
                      </div>

                      {tx.notes && (
                        <p className="text-xs text-muted-foreground italic line-clamp-1 pt-0.5">
                          "{tx.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-13 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <span
                        className={`text-base font-bold ${
                          isExpense ? 'text-foreground' : 'text-emerald-400'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>

                    {/* Action buttons with shadcn Button */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingTransaction(tx);
                          setIsAddModalOpen(true);
                        }}
                        title="Editar movimiento"
                        className="size-8 cursor-pointer text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`¿Deseas eliminar "${tx.description}"?`)) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        title="Eliminar movimiento"
                        className="size-8 cursor-pointer text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
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
