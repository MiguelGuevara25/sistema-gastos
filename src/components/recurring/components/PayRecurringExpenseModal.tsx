"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useFinance } from "@/context/FinanceContext";
import { RecurringExpense } from "@/types/finance";
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
import { Receipt } from "lucide-react";

interface PayRecurringExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: RecurringExpense | null;
  activeMonthKey: string;
}

interface PayFormData {
  payDate: string;
  payAccountId: string;
}

export const PayRecurringExpenseModal: React.FC<
  PayRecurringExpenseModalProps
> = ({ isOpen, onClose, expense, activeMonthKey }) => {
  const { payRecurringExpense, accounts, formatCurrency } = useFinance();

  const defaultValues: PayFormData = useMemo(() => {
    if (!expense) {
      return {
        payDate: new Date().toISOString().split("T")[0],
        payAccountId: accounts[0]?.id || "",
      };
    }
    const [y, m] = activeMonthKey.split("-");
    const dayStr = String(expense.dueDay).padStart(2, "0");
    return {
      payDate: `${y}-${m}-${dayStr}`,
      payAccountId: expense.accountId || accounts[0]?.id || "",
    };
  }, [expense, activeMonthKey, accounts]);

  const { register, handleSubmit, reset } = useForm<PayFormData>({
    values: defaultValues,
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onSubmit = (data: PayFormData) => {
    if (!expense) return;
    payRecurringExpense(
      expense.id,
      data.payDate,
      data.payAccountId || undefined,
    );
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold flex items-center gap-2">
            <Receipt className="size-4 text-primary" />
            Pagar: {expense?.name}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Se creará un movimiento de{" "}
            {expense ? formatCurrency(expense.amount) : ""} en tu historial del
            mes
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5 min-w-0">
            <Label className="text-xs text-muted-foreground">
              Fecha del Pago
            </Label>
            <Input
              type="date"
              {...register("payDate", { required: true })}
              className="h-10 px-3 text-xs sm:text-sm bg-muted/40 cursor-pointer w-full min-w-0"
              required
            />
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label className="text-xs text-muted-foreground">
              Debitar de Cuenta / Billetera
            </Label>
            <select
              {...register("payAccountId")}
              className="w-full h-10 rounded-md bg-muted/40 border border-input text-xs sm:text-sm px-3 text-foreground focus:outline-none cursor-pointer"
            >
              <option value="">-- Sin debitar de cuenta --</option>
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
              Confirmar Pago
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
