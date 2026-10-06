"use client";

import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useFinance } from "@/context/FinanceContext";
import { DebtLoan } from "@/types/finance";
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
import { HandCoins, ArrowUpRight, ArrowDownLeft, Percent, Calculator } from "lucide-react";

interface DebtLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtToEdit?: DebtLoan | null;
}

interface DebtLoanFormData {
  type: "lent" | "borrowed";
  personName: string;
  amount: number | string;
  dueDate: string;
  accountId: string;
  notes: string;
  interestRate?: number | string;
  minimumPayment?: number | string;
}

export const DebtLoanModal: React.FC<DebtLoanModalProps> = ({
  isOpen,
  onClose,
  debtToEdit,
}) => {
  const { addDebtLoan, updateDebtLoan, accounts, formatCurrency } =
    useFinance();

  const defaultValues: DebtLoanFormData = useMemo(
    () => ({
      type: "lent",
      personName: "",
      amount: "",
      dueDate: "",
      accountId: "",
      notes: "",
      interestRate: "0",
      minimumPayment: "",
    }),
    [],
  );

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<DebtLoanFormData>({
      values: debtToEdit
        ? {
            type: debtToEdit.type,
            personName: debtToEdit.personName,
            amount: debtToEdit.amount,
            dueDate: debtToEdit.dueDate || "",
            accountId: debtToEdit.accountId || "",
            notes: debtToEdit.notes || "",
            interestRate: debtToEdit.interestRate !== undefined ? debtToEdit.interestRate.toString() : "0",
            minimumPayment: debtToEdit.minimumPayment !== undefined ? debtToEdit.minimumPayment.toString() : "",
          }
        : defaultValues,
    });

  const currentType = watch("type");

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onSubmit = (data: DebtLoanFormData) => {
    const numAmount = parseFloat(String(data.amount));
    if (!data.personName.trim() || isNaN(numAmount) || numAmount <= 0) return;

    const interestRateVal =
      data.type === "borrowed" && data.interestRate !== undefined && data.interestRate !== ""
        ? parseFloat(String(data.interestRate))
        : 0;

    const minPayVal =
      data.type === "borrowed" && data.minimumPayment !== undefined && data.minimumPayment !== ""
        ? parseFloat(String(data.minimumPayment))
        : undefined;

    if (debtToEdit) {
      updateDebtLoan(debtToEdit.id, {
        type: data.type,
        personName: data.personName.trim(),
        amount: numAmount,
        dueDate: data.dueDate || undefined,
        accountId: data.accountId || undefined,
        notes: data.notes?.trim() || undefined,
        interestRate: !isNaN(interestRateVal) ? interestRateVal : 0,
        minimumPayment: minPayVal && !isNaN(minPayVal) ? minPayVal : undefined,
      });
    } else {
      addDebtLoan({
        type: data.type,
        personName: data.personName.trim(),
        amount: numAmount,
        dueDate: data.dueDate || undefined,
        status: "pending",
        accountId: data.accountId || undefined,
        notes: data.notes?.trim() || undefined,
        interestRate: !isNaN(interestRateVal) ? interestRateVal : 0,
        minimumPayment: minPayVal && !isNaN(minPayVal) ? minPayVal : undefined,
      });
    }

    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="size-5 text-primary" />
            {debtToEdit
              ? "Editar Préstamo o Deuda"
              : "Registrar Préstamo o Deuda"}
          </DialogTitle>
          <DialogDescription>
            {debtToEdit
              ? "Modifica los datos del préstamo o compromiso."
              : "Controla a quién le prestaste dinero o quién te hizo un préstamo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Type selector: Lent vs Borrowed */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Tipo de Operación</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValue("type", "lent")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                  currentType === "lent"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-semibold"
                    : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <ArrowUpRight className="size-5 mb-1 text-emerald-400" />
                <span className="text-xs">Presté Dinero</span>
                <span className="text-[10px] opacity-75">Me deben a mí</span>
              </button>

              <button
                type="button"
                onClick={() => setValue("type", "borrowed")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                  currentType === "borrowed"
                    ? "bg-amber-500/10 border-amber-500 text-amber-400 font-semibold"
                    : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <ArrowDownLeft className="size-5 mb-1 text-amber-400" />
                <span className="text-xs">Me Prestaron Dinero</span>
                <span className="text-[10px] opacity-75">Yo debo pagar</span>
              </button>
            </div>
          </div>

          {/* Persona */}
          <div className="space-y-1.5">
            <Label htmlFor="personName" className="text-xs font-semibold">
              Nombre de la Persona / Entidad
            </Label>
            <Input
              id="personName"
              {...register("personName", { required: true })}
              placeholder="Ej. Carlos Gómez, BCP Préstamo, Juan Pérez..."
              required
              className="text-sm"
            />
          </div>

          {/* Monto & Fecha Límite */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="amount" className="text-xs font-semibold">
                Monto
              </Label>
              <Input
                id="amount"
                type="number"
                step="any"
                min="0.01"
                {...register("amount", { required: true })}
                placeholder="0.00"
                required
                className="h-10 text-sm font-semibold"
              />
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="dueDate" className="text-xs font-semibold">
                Fecha Promesa (Opcional)
              </Label>
              <Input
                id="dueDate"
                type="date"
                {...register("dueDate")}
                className="h-10 px-3 text-xs sm:text-sm bg-muted/40 cursor-pointer w-full min-w-0"
              />
            </div>
          </div>

          {/* Campos exclusivos para Deudas por Pagar (Simulador Bola de Nieve & Avalancha) */}
          {currentType === "borrowed" && (
            <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
              <p className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
                <Calculator className="size-3.5" />
                Datos para Simulador de Deudas (Opcional)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="interestRate" className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Percent className="size-3" /> Tasa Anual (APR %)
                  </Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Ej. 24.5"
                    {...register("interestRate")}
                    className="text-xs h-8 bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="minimumPayment" className="text-[11px] font-medium text-muted-foreground">
                    Pago Mínimo Mensual
                  </Label>
                  <Input
                    id="minimumPayment"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Ej. 100"
                    {...register("minimumPayment")}
                    className="text-xs h-8 bg-background"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cuenta Asociada (Opcional) */}
          <div className="space-y-1.5">
            <Label htmlFor="accountId" className="text-xs font-semibold">
              Cuenta / Billetera Asociada (Opcional)
            </Label>
            <select
              id="accountId"
              {...register("accountId")}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Ninguna / No especificada</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatCurrency(acc.balance)})
                </option>
              ))}
            </select>
          </div>

          {/* Motivo / Notas */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold">
              Motivo / Notas
            </Label>
            <Input
              id="notes"
              {...register("notes")}
              placeholder="Ej. Para repuesto de moto, cena compartida..."
              className="text-sm"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="cursor-pointer font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {debtToEdit ? "Guardar Cambios" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
