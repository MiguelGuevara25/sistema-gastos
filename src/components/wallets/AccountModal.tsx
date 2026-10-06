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
import { CreditCard, Calendar, Percent } from "lucide-react";

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
  currency: string;
  // Credit card specifics
  creditLimit?: number | string;
  closingDay?: number | string;
  dueDay?: number | string;
  apr?: number | string;
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
  const { addAccount, updateAccount, settings } = useFinance();

  const defaultValues: AccountFormData = useMemo(
    () => ({
      name: "",
      type: "wallet",
      balance: "",
      color: "#8b5cf6",
      accountNumber: "",
      currency: settings.currencyCode || "PEN",
      creditLimit: "3000",
      closingDay: "20",
      dueDay: "15",
      apr: "38.5",
    }),
    [settings.currencyCode],
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
            currency: accountToEdit.currency || settings.currencyCode,
            creditLimit: accountToEdit.creditLimit !== undefined ? accountToEdit.creditLimit.toString() : "3000",
            closingDay: accountToEdit.closingDay !== undefined ? accountToEdit.closingDay.toString() : "20",
            dueDay: accountToEdit.dueDay !== undefined ? accountToEdit.dueDay.toString() : "15",
            apr: accountToEdit.apr !== undefined ? accountToEdit.apr.toString() : "38.5",
          }
        : defaultValues,
    });

  const currentColor = watch("color");
  const currentType = watch("type");

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onSubmit = (data: AccountFormData) => {
    if (!data.name.trim()) return;
    const initialBal = parseFloat(String(data.balance)) || 0;

    const isCredit = data.type === "credit";
    const creditLimitVal = isCredit ? parseFloat(String(data.creditLimit)) : undefined;
    const closingDayVal = isCredit ? parseInt(String(data.closingDay), 10) : undefined;
    const dueDayVal = isCredit ? parseInt(String(data.dueDay), 10) : undefined;
    const aprVal = isCredit ? parseFloat(String(data.apr)) : undefined;

    if (accountToEdit) {
      updateAccount(accountToEdit.id, {
        name: data.name.trim(),
        type: data.type,
        color: data.color,
        accountNumber: data.accountNumber.trim() || undefined,
        currency: data.currency || settings.currencyCode,
        creditLimit: !isNaN(creditLimitVal || NaN) ? creditLimitVal : undefined,
        closingDay: !isNaN(closingDayVal || NaN) ? closingDayVal : undefined,
        dueDay: !isNaN(dueDayVal || NaN) ? dueDayVal : undefined,
        apr: !isNaN(aprVal || NaN) ? aprVal : undefined,
      });
    } else {
      addAccount({
        name: data.name.trim(),
        type: data.type,
        balance: isCredit && initialBal > 0 ? -initialBal : initialBal,
        color: data.color,
        accountNumber: data.accountNumber.trim() || undefined,
        currency: data.currency || settings.currencyCode,
        creditLimit: !isNaN(creditLimitVal || NaN) ? creditLimitVal : undefined,
        closingDay: !isNaN(closingDayVal || NaN) ? closingDayVal : undefined,
        dueDay: !isNaN(dueDayVal || NaN) ? dueDayVal : undefined,
        apr: !isNaN(aprVal || NaN) ? aprVal : undefined,
      });
    }

    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {accountToEdit
              ? "Editar Cuenta o Tarjeta"
              : "Nueva Cuenta o Tarjeta"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Registra una cuenta bancaria, billetera digital, efectivo o tarjeta
            de crédito con ciclo de facturación
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Nombre de la Cuenta / Tarjeta
            </Label>
            <Input
              type="text"
              placeholder="ej: Yape, BBVA Ahorros, Tarjeta Visa BCP..."
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
                <option value="wallet" className="bg-popover text-popover-foreground">
                  📱 Billetera Digital (Yape / Plin)
                </option>
                <option value="bank" className="bg-popover text-popover-foreground">
                  🏦 Cuenta Bancaria (Sueldo / Operativa)
                </option>
                <option value="savings" className="bg-popover text-popover-foreground">
                  🐷 Cuenta de Ahorro / Inversión
                </option>
                <option value="cash" className="bg-popover text-popover-foreground">
                  💵 Efectivo
                </option>
                <option value="credit" className="bg-popover text-popover-foreground">
                  💳 Tarjeta de Crédito
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Moneda de la Cuenta
              </Label>
              <select
                {...register("currency")}
                className="w-full h-9 rounded-md bg-muted/40 border border-input text-xs px-2.5 text-foreground focus:outline-none font-semibold"
              >
                <option value="PEN" className="bg-popover text-popover-foreground">
                  S/. Soles (PEN)
                </option>
                <option value="USD" className="bg-popover text-popover-foreground">
                  $ Dólares (USD)
                </option>
                <option value="EUR" className="bg-popover text-popover-foreground">
                  € Euros (EUR)
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {!accountToEdit && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  {currentType === "credit" ? "Saldo Consumido Inicial" : "Saldo Inicial"}
                </Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  {...register("balance")}
                  className="h-9 text-xs font-mono font-semibold"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Identificador / N° Tarjeta (Opcional)
              </Label>
              <Input
                type="text"
                placeholder="ej: *4821"
                {...register("accountNumber")}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Configuración avanzada de Tarjeta de Crédito */}
          {currentType === "credit" && (
            <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-3">
              <p className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                <CreditCard className="size-3.5" />
                Ciclo y Límites de la Tarjeta de Crédito
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Línea de Crédito Total
                  </Label>
                  <Input
                    type="number"
                    min="100"
                    placeholder="3000"
                    {...register("creditLimit")}
                    className="h-8 text-xs font-mono bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Percent className="size-3" /> Tasa Anual (TEA %)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="38.5"
                    {...register("apr")}
                    className="h-8 text-xs font-mono bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" /> Día de Corte (1-31)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="20"
                    {...register("closingDay")}
                    className="h-8 text-xs font-mono bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" /> Día Límite de Pago (1-31)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="15"
                    {...register("dueDay")}
                    className="h-8 text-xs font-mono bg-background"
                  />
                </div>
              </div>
            </div>
          )}

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
