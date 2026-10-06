"use client";

import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useFinance } from "@/context/FinanceContext";
import { PaymentMethod, RecurringExpense } from "@/types/finance";
import { PAYMENT_METHOD_LABELS } from "@/data/categories";
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

interface RecurringExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: RecurringExpense | null;
}

interface RecurringExpenseFormData {
  name: string;
  amount: number | string;
  dueDay: number | string;
  categoryId: string;
  paymentMethod: PaymentMethod;
  accountId: string;
  notes: string;
}

export const RecurringExpenseModal: React.FC<RecurringExpenseModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
}) => {
  const {
    addRecurringExpense,
    updateRecurringExpense,
    categories,
    accounts,
    formatCurrency,
  } = useFinance();

  const defaultExpCat = useMemo(
    () => categories.find((c) => c.type === "expense"),
    [categories],
  );

  const defaultValues: RecurringExpenseFormData = useMemo(
    () => ({
      name: "",
      amount: "",
      dueDay: 5,
      categoryId: defaultExpCat?.id || "",
      paymentMethod: "tarjeta_debito",
      accountId: accounts[0]?.id || "",
      notes: "",
    }),
    [defaultExpCat, accounts],
  );

  // React Hook Form se encarga de todo el ciclo de vida sin necesidad de useState manuales
  const { register, handleSubmit, reset } = useForm<RecurringExpenseFormData>({
    values: expenseToEdit
      ? {
          name: expenseToEdit.name,
          amount: expenseToEdit.amount,
          dueDay: expenseToEdit.dueDay,
          categoryId: expenseToEdit.categoryId,
          paymentMethod: expenseToEdit.paymentMethod,
          accountId: expenseToEdit.accountId || "",
          notes: expenseToEdit.notes || "",
        }
      : defaultValues,
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onSubmit = (data: RecurringExpenseFormData) => {
    const amt = parseFloat(String(data.amount));
    const day = parseInt(String(data.dueDay), 10);

    if (isNaN(amt) || amt <= 0 || !data.name.trim() || isNaN(day)) return;

    if (expenseToEdit) {
      updateRecurringExpense(expenseToEdit.id, {
        name: data.name.trim(),
        amount: amt,
        categoryId: data.categoryId,
        dueDay: Math.max(1, Math.min(31, day)),
        paymentMethod: data.paymentMethod,
        accountId: data.accountId || undefined,
        notes: data.notes?.trim() || undefined,
      });
    } else {
      addRecurringExpense({
        name: data.name.trim(),
        amount: amt,
        categoryId: data.categoryId,
        dueDay: Math.max(1, Math.min(31, day)),
        paymentMethod: data.paymentMethod,
        frequency: "monthly",
        accountId: data.accountId || undefined,
        notes: data.notes?.trim() || undefined,
      });
    }

    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {expenseToEdit
              ? "Editar Gasto Fijo"
              : "Nuevo Gasto Fijo / Servicio"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Registra pagos que se repiten cada mes (Alquiler, Luz, Internet,
            Netflix, etc.)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Nombre del Servicio o Gasto
            </Label>
            <Input
              type="text"
              placeholder="ej: Alquiler Departamento, Netflix, Claro..."
              {...register("name", { required: true })}
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Monto Mensual ({formatCurrency(0).split(" ")[0]})
              </Label>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="150.00"
                {...register("amount", { required: true })}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Día de Pago (1 - 31)
              </Label>
              <Input
                type="number"
                min="1"
                max="31"
                {...register("dueDay", { required: true })}
                className="h-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Categoría</Label>
            <select
              {...register("categoryId")}
              className="w-full h-9 rounded-md bg-muted/40 border border-input text-xs px-2.5 text-foreground focus:outline-none"
            >
              {categories
                .filter((c) => c.type === "expense")
                .map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    className="bg-popover text-popover-foreground"
                  >
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Método de Pago
              </Label>
              <select
                {...register("paymentMethod")}
                className="w-full h-9 rounded-md bg-muted/40 border border-input text-xs px-2.5 text-foreground focus:outline-none"
              >
                {Object.entries(PAYMENT_METHOD_LABELS).map(([k, label]) => (
                  <option
                    key={k}
                    value={k}
                    className="bg-popover text-popover-foreground"
                  >
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Cuenta Habitual (Opcional)
              </Label>
              <select
                {...register("accountId")}
                className="w-full h-9 rounded-md bg-muted/40 border border-input text-xs px-2.5 text-foreground focus:outline-none"
              >
                <option value="">-- Sin cuenta asignada --</option>
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

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Notas (Opcional)
            </Label>
            <Input
              type="text"
              placeholder="ej: Recibo vence el 15, plan de 200MB..."
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
              {expenseToEdit ? "Guardar Cambios" : "Guardar Gasto Fijo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
