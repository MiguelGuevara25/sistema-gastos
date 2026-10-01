'use client';

import { useFinance } from '../../context/FinanceContext';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Plus, Trash2, Edit2 } from 'lucide-react';
import { PAYMENT_METHOD_LABELS } from '../../data/categories';

import { isToday, isYesterday, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const RecentTransactions: React.FC = () => {
  const {
    transactions,
    categories,
    formatCurrency,
    setActiveTab,
    setIsAddModalOpen,
    setEditingTransaction,
    deleteTransaction,
  } = useFinance();

  const recent = transactions.slice(0, 5);

  const getCategory = (catId: string) => {
    return categories.find((c) => c.id === catId) || {
      id: catId,
      name: 'General',
      icon: 'HelpCircle',
      color: '#94a3b8',
      type: 'expense' as const,
    };
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const date = parseISO(dateStr + 'T00:00:00');
      if (isToday(date)) return 'Hoy';
      if (isYesterday(date)) return 'Ayer';
      return format(date, "d 'de' MMM", { locale: es });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            Últimos Movimientos
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Actividad financiera más reciente
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab('transactions')}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium cursor-pointer h-7 px-2"
        >
          Ver historial
          <ArrowRight className="size-3" />
        </Button>
      </CardHeader>

      <CardContent className="pt-2">
        {recent.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground mb-3">No tienes transacciones registradas</p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setEditingTransaction(null);
                setIsAddModalOpen(true);
              }}
              className="gap-1.5 cursor-pointer text-xs"
            >
              <Plus className="size-3.5" /> Registrar primer movimiento
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((tx) => {
              const cat = getCategory(tx.categoryId);
              const isExpense = tx.type === 'expense';

              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between group hover:bg-muted/40 px-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-border"
                      style={{ backgroundColor: `${cat.color}15` }}
                    >
                      <CategoryIcon name={cat.icon} color={cat.color} size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 h-4">
                          {cat.name}
                        </Badge>
                        <span>•</span>
                        <span>{PAYMENT_METHOD_LABELS[tx.paymentMethod] || tx.paymentMethod}</span>
                        <span>•</span>
                        <span>{formatDateLabel(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-xs font-bold ${
                          isExpense ? 'text-foreground' : 'text-emerald-400'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(tx.amount)}
                      </div>
                    </div>

                    {/* Hover Quick Actions with shadcn Button */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingTransaction(tx);
                          setIsAddModalOpen(true);
                        }}
                        title="Editar"
                        className="size-7 cursor-pointer text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTransaction(tx.id)}
                        title="Eliminar"
                        className="size-7 cursor-pointer text-muted-foreground hover:text-destructive"
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
      </CardContent>
    </Card>
  );
};
