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
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface GoalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: {
    goal: SavingsGoal;
    type: "deposit" | "withdraw";
  } | null;
}

interface GoalActionFormData {
  amount: number | string;
  accountId: string;
}

export const GoalActionModal: React.FC<GoalActionModalProps> = ({
  isOpen,
  onClose,
  action,
}) => {
  const { contributeToGoal, withdrawFromGoal, accounts, formatCurrency } =
    useFinance();

  const defaultValues: GoalActionFormData = useMemo(
    () => ({
      amount: "",
      accountId: accounts[0]?.id || "",
    }),
    [accounts],
  );

  const { register, handleSubmit, reset } = useForm<GoalActionFormData>({
    values: defaultValues,
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onSubmit = (data: GoalActionFormData) => {
    if (!action) return;
    const amt = parseFloat(String(data.amount));
    if (isNaN(amt) || amt <= 0) return;

    if (action.type === "deposit") {
      contributeToGoal(action.goal.id, amt, data.accountId || undefined);
    } else {
      withdrawFromGoal(action.goal.id, amt, data.accountId || undefined);
    }

    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[92vw] sm:max-w-xs rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold flex items-center gap-2">
            {action?.type === "deposit" ? (
              <>
                <ArrowDownRight className="size-4 text-emerald-400" />
                Aportar a: {action?.goal.name}
              </>
            ) : (
              <>
                <ArrowUpRight className="size-4 text-rose-400" />
                Retirar de: {action?.goal.name}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {action?.type === "deposit"
              ? "Incrementa tus ahorros destinados a este objetivo"
              : "Libera fondos de esta meta para otros usos"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Monto</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              {...register("amount", { required: true })}
              className="h-10 text-base font-bold"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {action?.type === "deposit"
                ? "Debitar de cuenta / billetera (Opcional)"
                : "Depositar en cuenta / billetera (Opcional)"}
            </Label>
            <select
              {...register("accountId")}
              className="w-full h-9 rounded-md bg-muted/40 border border-input text-xs px-2.5 text-foreground focus:outline-none"
            >
              <option value="">-- Sin vincular a cuenta --</option>
              {accounts.map((a) => (
                <option
                  key={a.id}
                  value={a.id}
                  className="bg-popover text-popover-foreground"
                >
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
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
