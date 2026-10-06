"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useFinance } from "@/context/FinanceContext";
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
import { ArrowRightLeft } from "lucide-react";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFromId?: string;
}

interface TransferFormData {
  fromAccountId: string;
  toAccountId: string;
  amount: number | string;
  date: string;
  notes: string;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  defaultFromId,
}) => {
  const { transferBetweenAccounts, accounts, formatCurrency } = useFinance();
  const [transferError, setTransferError] = useState("");

  const defaultValues: TransferFormData = useMemo(() => {
    const fromId = defaultFromId || accounts[0]?.id || "";
    const other = accounts.find((a) => a.id !== fromId);
    return {
      fromAccountId: fromId,
      toAccountId: other?.id || accounts[1]?.id || "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    };
  }, [defaultFromId, accounts]);

  const { register, handleSubmit, reset } = useForm<TransferFormData>({
    values: defaultValues,
  });

  const handleClose = () => {
    setTransferError("");
    reset(defaultValues);
    onClose();
  };

  const onSubmit = (data: TransferFormData) => {
    const amt = parseFloat(String(data.amount));
    if (isNaN(amt) || amt <= 0) {
      setTransferError("Ingresa un monto válido mayor a 0");
      return;
    }
    if (!data.fromAccountId || !data.toAccountId) {
      setTransferError("Selecciona la cuenta de origen y de destino");
      return;
    }
    if (data.fromAccountId === data.toAccountId) {
      setTransferError("La cuenta de origen y destino deben ser diferentes");
      return;
    }

    transferBetweenAccounts({
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      amount: amt,
      date: data.date,
      notes: data.notes?.trim() || undefined,
    });

    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <ArrowRightLeft className="size-4 text-primary" />
            Transferir Entre Cuentas
          </DialogTitle>
          <DialogDescription className="text-xs">
            Mueve dinero entre tus billeteras (ej: BCP a Yape) sin generar un
            gasto falso
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {transferError && (
            <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
              {transferError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 min-w-0">
              <Label className="text-xs text-muted-foreground">
                Desde (Origen)
              </Label>
              <select
                {...register("fromAccountId")}
                className="w-full h-10 rounded-md bg-muted/40 border border-input text-xs sm:text-sm px-3 text-foreground focus:outline-none cursor-pointer"
              >
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

            <div className="space-y-1.5 min-w-0">
              <Label className="text-xs text-muted-foreground">
                Hacia (Destino)
              </Label>
              <select
                {...register("toAccountId")}
                className="w-full h-10 rounded-md bg-muted/40 border border-input text-xs sm:text-sm px-3 text-foreground focus:outline-none cursor-pointer"
              >
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 min-w-0">
              <Label className="text-xs text-muted-foreground">
                Monto a Transferir
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                {...register("amount", { required: true })}
                className="h-10 text-xs sm:text-sm"
                required
              />
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label className="text-xs text-muted-foreground">Fecha</Label>
              <Input
                type="date"
                {...register("date", { required: true })}
                className="h-10 px-3 text-xs sm:text-sm bg-muted/40 cursor-pointer w-full min-w-0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Nota / Motivo (Opcional)
            </Label>
            <Input
              type="text"
              placeholder="ej: Recarga para compras del mes..."
              {...register("notes")}
              className="h-9 text-xs"
            />
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
              Completar Transferencia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
