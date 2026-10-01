"use client";

import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useFinance } from "@/context/FinanceContext";
import { Account, AccountType } from "@/types/finance";
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

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: Account | null;
}

interface AccountFormData {
  name: string;
  type: AccountType;
  balance: number | string;
  color: string;
  accountNumber: string;
}

const ACCOUNT_COLORS = [
  "#8b5cf6", // morado (Yape)
  "#06b6d4", // celeste (Plin)
  "#f97316", // naranja (BCP)
  "#10b981", // verde (Interbank)
  "#2563eb", // azul (BBVA)
  "#f59e0b", // ámbar (Efectivo)
  "#f43f5e", // rojo (Tarjeta)
  "#64748b", // pizarra
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accountToEdit,
}) => {
  const { addAccount, updateAccount } = useFinance();

  const defaultValues: AccountFormData = useMemo(
    () => ({
      name: "",
      type: "wallet",
      balance: "",
      color: "#8b5cf6",
      accountNumber: "",
    }),
    [],
  );

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<AccountFormData>({
      values: accountToEdit
        ? {
            name: accountToEdit.name,
            type: accountToEdit.type,
            balance: accountToEdit.balance,
            color: accountToEdit.color,
            accountNumber: accountToEdit.accountNumber || "",
          }
        : defaultValues,
    });

  const currentColor = watch("color");

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onSubmit = (data: AccountFormData) => {
    if (!data.name.trim()) return;
    const initialBal = parseFloat(String(data.balance)) || 0;

    if (accountToEdit) {
      updateAccount(accountToEdit.id, {
        name: data.name.trim(),
        type: data.type,
        color: data.color,
        accountNumber: data.accountNumber.trim() || undefined,
      });
    } else {
      addAccount({
        name: data.name.trim(),
        type: data.type,
        balance: initialBal,
        color: data.color,
        accountNumber: data.accountNumber.trim() || undefined,
      });
    }

    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {accountToEdit
              ? "Editar Cuenta o Billetera"
              : "Nueva Cuenta o Billetera"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Registra una cuenta bancaria, billetera digital, efectivo o tarjeta
            de crédito
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Nombre de la Cuenta
            </Label>
            <Input
              type="text"
              placeholder="ej: Yape, BBVA Ahorros, Efectivo..."
              {...register("name", { required: true })}
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Tipo de Cuenta
              </Label>
              <select
                {...register("type")}
                className="w-full h-9 rounded-md bg-muted/40 border border-input text-xs px-2.5 text-foreground focus:outline-none"
              >
                <option
                  value="savings"
                  className="bg-popover text-popover-foreground"
                >
                  🐷 Cuenta de Ahorro / Capital Reserva
                </option>
                <option
                  value="wallet"
                  className="bg-popover text-popover-foreground"
                >
                  📱 Billetera Digital (Yape / Plin)
                </option>
                <option
                  value="bank"
                  className="bg-popover text-popover-foreground"
                >
                  🏦 Cuenta Bancaria
                </option>
                <option
                  value="cash"
                  className="bg-popover text-popover-foreground"
                >
                  💵 Efectivo
                </option>
                <option
                  value="credit"
                  className="bg-popover text-popover-foreground"
                >
                  💳 Tarjeta de Crédito
                </option>
              </select>
            </div>

            {!accountToEdit && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Saldo Inicial
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("balance")}
                  className="h-9 text-xs"
                />
              </div>
            )}

            {accountToEdit && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Identificador / Dígitos
                </Label>
                <Input
                  type="text"
                  placeholder="ej: *4821"
                  {...register("accountNumber")}
                  className="h-9 text-xs"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Color de Identificación
            </Label>
            <div className="flex items-center gap-2">
              {ACCOUNT_COLORS.map((c) => (
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
              Guardar Cuenta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
