"use client";

import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useFinance } from "@/context/FinanceContext";
import { SavingsGoal } from "@/types/finance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingsGoal | null;
}

interface SavingsGoalFormData {
  name: string;
  targetAmount: number | string;
  initialAmount: number | string;
  targetDate: string;
  category: string;
  color: string;
}

const GOAL_COLORS = [
  "#10b981",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#e11d48",
  "#eab308",
];

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
}) => {
  const { addGoal, updateGoal, formatCurrency } = useFinance();

  const defaultValues: SavingsGoalFormData = useMemo(
    () => ({
      name: "",
      targetAmount: "",
      initialAmount: "0",
      targetDate: "",
      category: "General",
      color: "#10b981",
    }),
    [],
  );

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<SavingsGoalFormData>({
      values: goalToEdit
        ? {
            name: goalToEdit.name,
            targetAmount: goalToEdit.targetAmount,
            initialAmount: goalToEdit.currentAmount,
            targetDate: goalToEdit.targetDate || "",
            category: goalToEdit.category || "General",
            color: goalToEdit.color,
          }
        : defaultValues,
    });

  const currentColor = watch("color");

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onSubmit = (data: SavingsGoalFormData) => {
    const target = parseFloat(String(data.targetAmount));
    const initial = parseFloat(String(data.initialAmount)) || 0;
    if (isNaN(target) || target <= 0 || !data.name.trim()) return;

    if (goalToEdit) {
      updateGoal(goalToEdit.id, {
        name: data.name.trim(),
        targetAmount: target,
        targetDate: data.targetDate || undefined,
        category: data.category?.trim() || undefined,
        color: data.color,
      });
    } else {
      addGoal({
        name: data.name.trim(),
        targetAmount: target,
        currentAmount: initial,
        targetDate: data.targetDate || undefined,
        category: data.category?.trim() || undefined,
        color: data.color,
      });
    }

    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {goalToEdit
              ? "Editar Meta de Ahorro"
              : "Crear Nueva Meta de Ahorro"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Define tu objetivo, monto deseado y fecha estimada para cumplirlo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Nombre de la Meta
            </Label>
            <Input
              type="text"
              placeholder="ej: Fondo de Emergencia, Vacaciones, Laptop..."
              {...register("name", { required: true })}
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Monto Objetivo ({formatCurrency(0).split(" ")[0]})
              </Label>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="3000"
                {...register("targetAmount", { required: true })}
                className="h-9 text-xs"
                required
              />
            </div>

            {!goalToEdit && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Ahorro Inicial
                </Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0"
                  {...register("initialAmount")}
                  className="h-9 text-xs"
                />
              </div>
            )}

            {goalToEdit && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Categoría
                </Label>
                <Input
                  type="text"
                  {...register("category")}
                  className="h-9 text-xs"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 min-w-0">
              <Label className="text-xs text-muted-foreground">
                Fecha Límite (Opcional)
              </Label>
              <Input
                type="date"
                {...register("targetDate")}
                className="h-10 px-3 text-xs sm:text-sm bg-muted/40 cursor-pointer w-full min-w-0"
              />
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label className="text-xs text-muted-foreground">Color</Label>
              <div className="flex items-center gap-1.5 pt-1.5">
                {GOAL_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setValue("color", c)}
                    className={`size-6 rounded-full cursor-pointer transition-transform ${
                      currentColor === c
                        ? "scale-125 ring-2 ring-foreground ring-offset-2 ring-offset-background"
                        : "opacity-80 hover:opacity-100"
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
              onClick={handleClose}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="cursor-pointer font-semibold"
            >
              Guardar Meta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
