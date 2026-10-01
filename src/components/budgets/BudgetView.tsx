'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFinance } from '../../context/FinanceContext';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Check,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface BudgetFormData {
  newBudget: number | string;
}

export const BudgetView: React.FC = () => {
  const {
    settings,
    updateSettings,
    totalExpenses,
    categoryBreakdown,
    formatCurrency,
  } = useFinance();

  const [isEditingBudget, setIsEditingBudget] = useState(false);

  const { register, handleSubmit } = useForm<BudgetFormData>({
    values: {
      newBudget: settings.monthlyBudget.toString(),
    },
  });

  const budget = settings.monthlyBudget;
  const remaining = budget - totalExpenses;
  const percentageUsed = budget > 0 ? Math.round((totalExpenses / budget) * 100) : 0;

  const onSaveBudget = (data: BudgetFormData) => {
    const val = parseFloat(String(data.newBudget));
    if (!isNaN(val) && val > 0) {
      updateSettings({ monthlyBudget: val });
    }
    setIsEditingBudget(false);
  };

  const getStatus = () => {
    if (percentageUsed > 100) {
      return {
        label: 'Presupuesto Excedido',
        badgeVariant: 'destructive' as const,
        color: 'text-rose-400',
        bg: 'bg-destructive/10 border-destructive/20',
        icon: ShieldAlert,
        desc: `Has gastado ${formatCurrency(Math.abs(remaining))} más de tu límite establecido.`,
      };
    }
    if (percentageUsed >= 80) {
      return {
        label: 'Cerca del Límite',
        badgeVariant: 'secondary' as const,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/20',
        icon: AlertTriangle,
        desc: `Te queda disponible ${formatCurrency(remaining)} para el resto del mes.`,
      };
    }
    return {
      label: 'Bajo Control',
      badgeVariant: 'default' as const,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      icon: CheckCircle2,
      desc: `Excelente disciplina financiera. Tienes disponible ${formatCurrency(remaining)}.`,
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Top Banner: Main Monthly Budget */}
      <Card className="p-2">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-muted text-foreground">
                <Target className="size-4" />
              </span>
              <CardTitle className="text-base font-bold">
                Presupuesto Mensual Objetivo
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              Establece un techo de gasto para mantener tu salud financiera
            </CardDescription>
          </div>

          <div>
            {isEditingBudget ? (
              <form onSubmit={handleSubmit(onSaveBudget)} className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">
                    {settings.currency}
                  </span>
                  <Input
                    type="number"
                    step="50"
                    min="1"
                    {...register('newBudget', { required: true })}
                    autoFocus
                    className="w-32 pl-8 h-8 text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="size-8 p-0 cursor-pointer"
                >
                  <Check className="size-3.5" />
                </Button>
              </form>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingBudget(true)}
                className="gap-1.5 cursor-pointer text-xs"
              >
                <Edit3 className="size-3" />
                Editar Límite
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Progress Bar & Numerical stats */}
        <CardContent className="space-y-4 pt-2">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium">Consumido</span>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(totalExpenses)}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  de {formatCurrency(budget)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-xl font-extrabold ${
                  percentageUsed > 100
                    ? 'text-rose-400'
                    : percentageUsed > 80
                    ? 'text-amber-400'
                    : 'text-foreground'
                }`}
              >
                {percentageUsed}%
              </span>
            </div>
          </div>

          {/* shadcn Progress component */}
          <div className="w-full">
            <Progress
              value={Math.min(100, percentageUsed)}
              className="h-2.5"
            />
          </div>

          {/* Status Message */}
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${status.bg} ${status.color}`}
          >
            <StatusIcon className="size-4.5 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold mr-1">{status.label}:</span>
              <span>{status.desc}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Expenses & Estimated Consumption */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-muted-foreground" />
            Consumo por Categorías
          </CardTitle>
          <CardDescription className="text-xs">
            Supervisa qué áreas están consumiendo mayor proporción de tus recursos
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          {categoryBreakdown.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No hay gastos registrados para analizar.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryBreakdown.map((item) => {
                const shareOfBudget =
                  budget > 0 ? Math.round((item.amount / budget) * 100) : 0;

                return (
                  <div
                    key={item.category.id}
                    className="p-4 rounded-xl bg-muted/30 border border-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${item.category.color}20` }}
                        >
                          <CategoryIcon
                            name={item.category.icon}
                            color={item.category.color}
                            size={16}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            {item.category.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.count} {item.count === 1 ? 'transacción' : 'transacciones'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-foreground">
                          {formatCurrency(item.amount)}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {shareOfBudget}% del presupuesto
                        </p>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, item.percentage)}%`,
                          backgroundColor: item.category.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
