"use client";

import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useFinance } from "@/context/FinanceContext";
import { Account } from "@/types/finance";
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

interface AdjustBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
}

interface AdjustBalanceFormData {
  newBalance: number | string;
}

export const AdjustBalanceModal: React.FC<AdjustBalanceModalProps> = ({
  isOpen,
  onClose,
  account,
}) => {
  const { adjustAccountBalance } = useFinance();

  const defaultValues: AdjustBalanceFormData = useMemo(
    () => ({
      newBalance: account ? account.balance.toString() : "",
    }),
    [account],
  );

  const { register, handleSubmit, reset } = useForm<AdjustBalanceFormData>({
    values: defaultValues,
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onSubmit = (data: AdjustBalanceFormData) => {
    if (!account) return;
    const val = parseFloat(String(data.newBalance));
    if (isNaN(val)) return;

    adjustAccountBalance(account.id, val);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[92vw] sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">
            Ajustar Saldo: {account?.name}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Sincroniza el monto con el saldo real que ves en tu app bancaria
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Nuevo Saldo</Label>
            <Input
              type="number"
              step="0.01"
              {...register("newBalance", { required: true })}
              className="h-10 text-base font-bold"
              autoFocus
              required
            />
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
              Confirmar Ajuste
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
