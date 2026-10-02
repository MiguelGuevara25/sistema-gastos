"use client";

import React, { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import { SavingsGoal } from "../../types/finance";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from "lucide-react";
import { SavingsGoalModal } from "./SavingsGoalModal";
import { GoalActionModal } from "./GoalActionModal";
import { differenceInCalendarDays, parseISO, startOfToday } from "date-fns";

export const GoalsView: React.FC = () => {
  const {
    goals,
    deleteGoal,
    totalSavedInGoals,
    totalTargetGoals,
    formatCurrency,
  } = useFinance();

  // Modals state
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Contribution / Withdrawal modal
  const [actionModal, setActionModal] = useState<{
    goal: SavingsGoal;
    type: "deposit" | "withdraw";
  } | null>(null);

  const overallProgress =
    totalTargetGoals > 0
      ? Math.min(100, Math.round((totalSavedInGoals / totalTargetGoals) * 100))
      : 0;

  const handleOpenAddGoal = () => {
    setEditingGoal(null);
    setIsAddGoalOpen(true);
  };

  const handleOpenEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsAddGoalOpen(true);
  };

  const handleOpenActionModal = (
    goal: SavingsGoal,
    type: "deposit" | "withdraw",
  ) => {
    setActionModal({ goal, type });
  };

  // Helper to calculate days or monthly recommended deposit
  const getGoalTimeAdvice = (goal: SavingsGoal) => {
    if (!goal.targetDate) return null;
    const target = parseISO(
      goal.targetDate.includes("T")
        ? goal.targetDate
        : goal.targetDate + "T00:00:00",
    );
    const diffDays = differenceInCalendarDays(target, startOfToday());

    if (diffDays <= 0)
      return { label: "Fecha cumplida", color: "text-amber-400" };

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
              <h3 className="text-base font-bold text-foreground">
                Progreso Global de Ahorro
              </h3>
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
              <span className="text-xs text-muted-foreground font-medium">
                Total Ahorrado
              </span>
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
      {goals.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center border-dashed border-border/80">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <Target className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No tienes metas de ahorro</h3>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto">
            Crea metas financieras como fondo de emergencia, vacaciones, estudios o compras importantes para medir tu progreso.
          </p>
          <Button
            size="sm"
            onClick={handleOpenAddGoal}
            className="mt-4 gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Plus className="size-3.5" />
            Crear mi primera meta
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
          const progress =
            goal.targetAmount > 0
              ? Math.min(
                  100,
                  Math.round((goal.currentAmount / goal.targetAmount) * 100),
                )
              : 0;
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const timeAdvice = getGoalTimeAdvice(goal);

          return (
            <Card
              key={goal.id}
              className="relative overflow-hidden border-border/70 hover:border-border transition-all flex flex-col justify-between"
            >
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: goal.color }}
              />

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
                          <Badge
                            variant="outline"
                            className="text-[10px] mt-0.5 px-1.5 py-0"
                          >
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
                    onClick={() => handleOpenActionModal(goal, "deposit")}
                    className="flex-1 h-8 text-xs cursor-pointer gap-1 font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                  >
                    <ArrowDownRight className="size-3.5" />
                    Aportar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenActionModal(goal, "withdraw")}
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
      )}

      {/* Add / Edit Goal Modal */}
      {/* Add / Edit Goal Modal */}
      <SavingsGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => {
          setIsAddGoalOpen(false);
          setEditingGoal(null);
        }}
        goalToEdit={editingGoal}
      />

      {/* Deposit / Withdraw Modal */}
      <GoalActionModal
        isOpen={Boolean(actionModal)}
        onClose={() => setActionModal(null)}
        action={actionModal}
      />
    </div>
  );
};
