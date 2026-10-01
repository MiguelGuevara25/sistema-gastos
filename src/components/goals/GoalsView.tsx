'use client';

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Coins,
  CheckCircle2,
} from 'lucide-react';

export const GoalsView: React.FC = () => {
  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    withdrawFromGoal,
    totalSavedInGoals,
    totalTargetGoals,
    accounts,
    formatCurrency,
  } = useFinance();

  // Modals state
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Contribution / Withdrawal modal
  const [actionModal, setActionModal] = useState<{
    goal: SavingsGoal;
    type: 'deposit' | 'withdraw';
  } | null>(null);
  const [actionAmount, setActionAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');

  // Form State
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('General');
  const [goalColor, setGoalColor] = useState('#10b981');

  const overallProgress =
    totalTargetGoals > 0 ? Math.min(100, Math.round((totalSavedInGoals / totalTargetGoals) * 100)) : 0;

  const handleOpenAddGoal = () => {
    setEditingGoal(null);
    setGoalName('');
    setTargetAmount('');
    setInitialAmount('0');
    setTargetDate('');
    setCategory('General');
    setGoalColor('#10b981');
    setIsAddGoalOpen(true);
  };

  const handleOpenEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setInitialAmount(goal.currentAmount.toString());
    setTargetDate(goal.targetDate || '');
    setCategory(goal.category || 'General');
    setGoalColor(goal.color);
    setIsAddGoalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const initial = parseFloat(initialAmount) || 0;
    if (isNaN(target) || target <= 0 || !goalName.trim()) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        name: goalName.trim(),
        targetAmount: target,
        targetDate: targetDate || undefined,
        category: category.trim() || undefined,
        color: goalColor,
      });
    } else {
      addGoal({
        name: goalName.trim(),
        targetAmount: target,
        currentAmount: initial,
        targetDate: targetDate || undefined,
        category: category.trim() || undefined,
        color: goalColor,
      });
    }

    setIsAddGoalOpen(false);
    setEditingGoal(null);
  };

  const handleOpenActionModal = (goal: SavingsGoal, type: 'deposit' | 'withdraw') => {
    setActionModal({ goal, type });
    setActionAmount('');
    setSelectedAccountId(accounts[0]?.id || '');
  };

  const handleExecuteAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal) return;
    const amt = parseFloat(actionAmount);
    if (isNaN(amt) || amt <= 0) return;

    if (actionModal.type === 'deposit') {
      contributeToGoal(actionModal.goal.id, amt, selectedAccountId || undefined);
    } else {
      withdrawFromGoal(actionModal.goal.id, amt, selectedAccountId || undefined);
    }

    setActionModal(null);
  };

  // Helper to calculate days or monthly recommended deposit
  const getGoalTimeAdvice = (goal: SavingsGoal) => {
    if (!goal.targetDate) return null;
    const target = new Date(goal.targetDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { label: 'Fecha cumplida', color: 'text-amber-400' };

    const diffMonths = Math.max(1, Math.round(diffDays / 30));
    const remainingMoney = Math.max(0, goal.targetAmount - goal.currentAmount);
    const monthlyNeeded = Math.round(remainingMoney / diffMonths);

    return {
      daysLeft: diffDays,
      monthsLeft: diffMonths,
      monthlyNeeded,
      text: `${diffDays} días restantes (~${formatCurrency(monthlyNeeded)}/mes)`,
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Global Progress */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 via-background to-muted/20 border-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/20 text-primary">
                <Target className="size-4" />
              </span>
              <h3 className="text-base font-bold text-foreground">Progreso Global de Ahorro</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Acumulado en todos tus fondos y proyectos personales
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleOpenAddGoal}
            className="cursor-pointer gap-1.5 shadow-xs font-semibold h-9 self-start sm:self-auto"
          >
            <Plus className="size-3.5" />
            Nueva Meta
          </Button>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium">Total Ahorrado</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {formatCurrency(totalSavedInGoals)}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  de {formatCurrency(totalTargetGoals)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xl sm:text-2xl font-black text-primary">
                {overallProgress}%
              </span>
            </div>
          </div>

          <Progress value={overallProgress} className="h-3 bg-muted/60" />
        </div>
      </Card>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const progress =
            goal.targetAmount > 0
              ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
              : 0;
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const timeAdvice = getGoalTimeAdvice(goal);

          return (
            <Card
              key={goal.id}
              className="relative overflow-hidden border-border/70 hover:border-border transition-all flex flex-col justify-between"
            >
              <div className="h-1.5 w-full" style={{ backgroundColor: goal.color }} />

              <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${goal.color}20`,
                          color: goal.color,
                          border: `1px solid ${goal.color}40`,
                        }}
                      >
                        <Target className="size-4.5" />
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-foreground leading-tight">
                          {goal.name}
                        </h4>
                        {goal.category && (
                          <Badge variant="outline" className="text-[10px] mt-0.5 px-1.5 py-0">
                            {goal.category}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditGoal(goal)}
                        className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`¿Eliminar la meta "${goal.name}"?`)) {
                            deleteGoal(goal.id);
                          }
                        }}
                        className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-rose-400"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="mt-4 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-black text-foreground">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        Meta: {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>

                    <div className="relative pt-1">
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground">
                      <span>{progress}% completado</span>
                      <span>Faltan {formatCurrency(remaining)}</span>
                    </div>
                  </div>

                  {/* Target Date & Advice */}
                  {timeAdvice && (
                    <div className="mt-3 p-2 rounded-lg bg-muted/30 border border-border/50 text-[11px] flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="size-3 text-primary shrink-0" />
                      <span>{timeAdvice.text}</span>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="mt-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>¡Meta completada con éxito! 🎉</span>
                    </div>
                  )}
                </div>

                {/* Actions: Deposit and Withdraw */}
                <div className="flex items-center gap-2 pt-3 border-t border-border/50 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenActionModal(goal, 'deposit')}
                    className="flex-1 h-8 text-xs cursor-pointer gap-1 font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                  >
                    <ArrowDownRight className="size-3.5" />
                    Aportar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenActionModal(goal, 'withdraw')}
                    className="flex-1 h-8 text-xs cursor-pointer gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowUpRight className="size-3.5" />
                    Retirar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Goal Modal */}
      <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingGoal ? 'Editar Meta de Ahorro' : 'Crear Nueva Meta de Ahorro'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Define tu objetivo, monto deseado y fecha estimada para cumplirlo
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveGoal} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nombre de la Meta</Label>
              <Input
                type="text"
                placeholder="ej: Fondo de Emergencia, Vacaciones, Laptop..."
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Monto Objetivo ({formatCurrency(0).split(' ')[0]})</Label>
                <Input
                  type="number"
                  step="10"
                  min="1"
                  placeholder="3000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              {!editingGoal && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Ahorro Inicial</Label>
                  <Input
                    type="number"
                    step="10"
                    placeholder="0"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              )}

              {editingGoal && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Categoría</Label>
                  <Input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Fecha Límite (Opcional)</Label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Color</Label>
                <div className="flex items-center gap-1.5 pt-1.5">
                  {[
                    '#10b981',
                    '#8b5cf6',
                    '#06b6d4',
                    '#f97316',
                    '#e11d48',
                    '#eab308',
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setGoalColor(c)}
                      className={`size-6 rounded-full cursor-pointer transition-transform ${
                        goalColor === c ? 'scale-125 ring-2 ring-foreground ring-offset-2 ring-offset-background' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddGoalOpen(false)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="cursor-pointer font-semibold">
                Guardar Meta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deposit / Withdraw Modal */}
      <Dialog
        open={Boolean(actionModal)}
        onOpenChange={(open) => !open && setActionModal(null)}
      >
        <DialogContent className="w-[92vw] sm:max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              {actionModal?.type === 'deposit' ? (
                <>
                  <ArrowDownRight className="size-4 text-emerald-400" />
                  Aportar a: {actionModal?.goal.name}
                </>
              ) : (
                <>
                  <ArrowUpRight className="size-4 text-rose-400" />
                  Retirar de: {actionModal?.goal.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {actionModal?.type === 'deposit'
                ? 'Incrementa tus ahorros destinados a este objetivo'
                : 'Libera fondos de esta meta para otros usos'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleExecuteAction} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Monto</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={actionAmount}
                onChange={(e) => setActionAmount(e.target.value)}
                className="h-10 text-base font-bold"
                autoFocus
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {actionModal?.type === 'deposit'
                  ? 'Debitar de cuenta / billetera (Opcional)'
                  : 'Depositar en cuenta / billetera (Opcional)'}
              </Label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full h-9 rounded-md bg-muted/40 border border-input text-xs px-2.5 text-foreground focus:outline-none"
              >
                <option value="">-- Sin vincular a cuenta --</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id} className="bg-popover text-popover-foreground">
                    {a.name} ({formatCurrency(a.balance)})
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActionModal(null)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="cursor-pointer font-semibold">
                Confirmar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
