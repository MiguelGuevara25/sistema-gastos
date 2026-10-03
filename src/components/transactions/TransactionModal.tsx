"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useFinance } from "../../context/FinanceContext";
import {
  TransactionType,
  PaymentMethod,
  SharedExpenseDetails,
  SharedExpenseParticipant,
} from "../../types/finance";
import { generateUUID } from "../../lib/utils";
import { CategoryIcon } from "../ui/CategoryIcon";
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
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Calendar,
  CreditCard,
  Tag,
  FileText,
  Wallet,
  Layers,
  Sparkles,
  ShieldAlert,
  Users,
  Plus,
  Trash2,
} from "lucide-react";
import { PAYMENT_METHOD_LABELS } from "../../data/categories";
import { format } from "date-fns";

interface TransactionFormData {
  type: TransactionType;
  amount: number | string;
  currency: string;
  description: string;
  categoryId: string;
  date: string;
  paymentMethod: PaymentMethod;
  accountId: string;
  notes: string;
  isInstallment: boolean;
  totalInstallments: number | string;
  tagsString: string;
  isShared: boolean;
  myShare: number | string;
}

export const TransactionModal: React.FC = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    editingTransaction,
    setEditingTransaction,
    addTransaction,
    updateTransaction,
    categories,
    settings,
    accounts,
    formatCurrency,
  } = useFinance();

  const defaultExpCat = useMemo(
    () => categories.find((c) => c.type === "expense"),
    [categories],
  );

  const defaultValues: TransactionFormData = useMemo(
    () => ({
      type: "expense",
      amount: "",
      currency: accounts[0]?.currency || settings.currencyCode || "PEN",
      description: "",
      categoryId: defaultExpCat?.id || "",
      date: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: "tarjeta_debito",
      accountId: accounts[0]?.id || "",
      notes: "",
      isInstallment: false,
      totalInstallments: 3,
      tagsString: "",
      isShared: false,
      myShare: "",
    }),
    [defaultExpCat, accounts, settings.currencyCode],
  );

  const [participants, setParticipants] = useState<SharedExpenseParticipant[]>(
    [],
  );
  const [newPartName, setNewPartName] = useState("");
  const [newPartAmount, setNewPartAmount] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    values: editingTransaction
      ? {
          type: editingTransaction.type,
          amount: editingTransaction.amount,
          currency: editingTransaction.currency || settings.currencyCode,
          description: editingTransaction.description,
          categoryId: editingTransaction.categoryId,
          date: editingTransaction.date,
          paymentMethod: editingTransaction.paymentMethod,
          accountId: editingTransaction.accountId || "",
          notes: editingTransaction.notes || "",
          isInstallment: Boolean(
            editingTransaction.installments &&
              editingTransaction.installments.total > 1,
          ),
          totalInstallments:
            editingTransaction.installments?.total || 3,
          tagsString: editingTransaction.tags?.join(", ") || "",
          isShared: Boolean(editingTransaction.sharedDetails),
          myShare: editingTransaction.sharedDetails?.myShare || "",
        }
      : defaultValues,
  });

  const currentType = watch("type");
  const currentCategoryId = watch("categoryId");
  const currentAccountId = watch("accountId");
  const currentAmount = watch("amount");
  const isInstallment = watch("isInstallment");
  const currentTotalInstallments = watch("totalInstallments");
  const currentCurrency = watch("currency");
  const currentTags = watch("tagsString");
  const isShared = watch("isShared");
  const myShare = watch("myShare");

  useEffect(() => {
    if (editingTransaction?.sharedDetails) {
      setParticipants(editingTransaction.sharedDetails.participants || []);
    } else {
      setParticipants([]);
      setNewPartName("");
      setNewPartAmount("");
    }
  }, [editingTransaction]);

  // Keep currency in sync when user switches account
  useEffect(() => {
    if (currentAccountId) {
      const acc = accounts.find((a) => a.id === currentAccountId);
      if (acc?.currency) {
        setValue("currency", acc.currency);
      }
    }
  }, [currentAccountId, accounts, setValue]);

  const handleTypeChange = (newType: TransactionType) => {
    setValue("type", newType);
    const available = categories.filter((c) => c.type === newType);
    if (!available.some((c) => c.id === currentCategoryId)) {
      setValue("categoryId", available[0]?.id || "", { shouldValidate: true });
    }
  };

  const handleClose = () => {
    reset(defaultValues);
    setIsAddModalOpen(false);
    setEditingTransaction(null);
  };

  const togglePresetTag = (tag: string) => {
    const existing = currentTags
      ? currentTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    let updated: string[];
    if (existing.includes(tag)) {
      updated = existing.filter((t) => t !== tag);
    } else {
      updated = [...existing, tag];
    }
    setValue("tagsString", updated.join(", "));
  };

  const numParsedAmount = parseFloat(String(currentAmount)) || 0;

  const handleSplitEvenly = (partsCount: number) => {
    if (numParsedAmount <= 0) return;
    const splitPerPerson = Number((numParsedAmount / partsCount).toFixed(2));
    setValue("myShare", splitPerPerson);
    const newParts: SharedExpenseParticipant[] = [];
    for (let i = 1; i < partsCount; i++) {
      newParts.push({
        id: generateUUID(),
        name: `Persona ${i}`,
        amount: splitPerPerson,
        settled: false,
      });
    }
    setParticipants(newParts);
  };

  const handleAddParticipant = () => {
    if (!newPartName.trim()) return;
    const amt = parseFloat(newPartAmount) || 0;
    setParticipants((prev) => [
      ...prev,
      {
        id: generateUUID(),
        name: newPartName.trim(),
        amount: amt,
        settled: false,
      },
    ]);
    setNewPartName("");
    setNewPartAmount("");
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const onSubmit = (data: TransactionFormData) => {
    const cleanAmountStr = String(data.amount).replace(",", ".");
    const numAmount = parseFloat(cleanAmountStr);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const parsedTags = data.tagsString
      ? data.tagsString
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    const installmentDetails =
      data.type === "expense" && data.isInstallment && Number(data.totalInstallments) > 1
        ? {
            current: editingTransaction?.installments?.current || 1,
            total: Number(data.totalInstallments),
            originalAmount: numAmount,
            monthlyAmount: Number(
              (numAmount / Number(data.totalInstallments)).toFixed(2),
            ),
          }
        : undefined;

    let sharedDetails: SharedExpenseDetails | undefined = undefined;
    if (data.type === "expense" && data.isShared) {
      const myShareNum = Number(data.myShare) || 0;
      const owedTotal = Math.max(0, Number((numAmount - myShareNum).toFixed(2)));
      const parts =
        participants.length > 0
          ? participants
          : [
              {
                id: generateUUID(),
                name: "Amigos / Terceros",
                amount: owedTotal,
                settled: false,
              },
            ];

      sharedDetails = {
        totalPaid: numAmount,
        myShare: myShareNum,
        owedAmount: owedTotal,
        participants: parts,
        isFullySettled: parts.every((p) => p.settled),
      };
    }

    const finalCategoryId =
      data.categoryId ||
      defaultExpCat?.id ||
      filteredCategories[0]?.id ||
      "cat-otros-gastos";

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type: data.type,
        amount: numAmount,
        currency: data.currency || settings.currencyCode,
        description: data.description.trim(),
        categoryId: finalCategoryId,
        date: data.date,
        paymentMethod: data.paymentMethod,
        accountId: data.accountId || undefined,
        notes: data.notes?.trim() || undefined,
        tags: parsedTags,
        installments: installmentDetails,
        sharedDetails,
      });
    } else {
      addTransaction({
        type: data.type,
        amount: numAmount,
        currency: data.currency || settings.currencyCode,
        description: data.description.trim(),
        categoryId: finalCategoryId,
        date: data.date,
        paymentMethod: data.paymentMethod,
        accountId: data.accountId || undefined,
        notes: data.notes?.trim() || undefined,
        tags: parsedTags,
        installments: installmentDetails,
        sharedDetails,
      });
    }

    handleClose();
  };

  const filteredCategories = categories.filter((c) => c.type === currentType);
  const isLikelyPhantom =
    currentType === "expense" &&
    numParsedAmount > 0 &&
    numParsedAmount <= (settings.phantomExpenseThreshold || 20);

  return (
    <Dialog
      open={isAddModalOpen}
      onOpenChange={(open) => !open && handleClose()}
    >
      <DialogContent className="w-[95vw] sm:max-w-lg max-h-[88dvh] overflow-y-auto p-4 sm:p-6 gap-4 sm:gap-5 rounded-2xl overscroll-contain">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold">
            {editingTransaction ? "Editar Movimiento" : "Nuevo Movimiento"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Registra tus finanzas, monedas y cuotas para un control integral
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type Selector (Gasto / Ingreso Tabs) */}
          <div className="grid grid-cols-2 p-1 bg-muted rounded-xl gap-1">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentType === "expense"
                  ? "bg-background text-rose-400 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowDownRight className="size-4" />
              Gasto
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentType === "income"
                  ? "bg-background text-emerald-400 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowUpRight className="size-4" />
              Ingreso
            </button>
          </div>

          {/* Amount Input with Multi-Currency Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">
                Monto y Moneda
              </Label>
              <div className="flex items-center gap-1">
                {(["PEN", "USD", "EUR"] as const).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setValue("currency", curr)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                      currentCurrency === curr
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3 text-lg font-bold text-muted-foreground select-none">
                {currentCurrency === "USD"
                  ? "$"
                  : currentCurrency === "EUR"
                    ? "€"
                    : "S/."}
              </span>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                {...register("amount", {
                  required: "El monto es obligatorio",
                  min: { value: 0.01, message: "El monto debe ser mayor a 0" },
                })}
                className="pl-14 h-12 text-2xl font-bold bg-muted/40 border-input font-mono"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Concept / Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Concepto / Descripción
            </Label>
            <Input
              type="text"
              placeholder={
                currentType === "expense"
                  ? "Ej. Almuerzo, Uber, Factura de luz"
                  : "Ej. Sueldo, Venta freelance"
              }
              {...register("description", {
                required: "La descripción es obligatoria",
              })}
              className="h-10 bg-muted/40"
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Tag className="size-3.5" />
              Categoría
            </Label>
            <input
              type="hidden"
              {...register("categoryId", {
                required: "Selecciona una categoría",
              })}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 max-h-36 overflow-y-auto p-1.5 border border-border rounded-xl bg-muted/20">
              {filteredCategories.map((cat) => {
                const isSelected = currentCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setValue("categoryId", cat.id, { shouldValidate: true })
                    }
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-accent border-border text-foreground shadow-xs font-semibold"
                        : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <CategoryIcon
                        name={cat.icon}
                        color={cat.color}
                        size={13}
                      />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
            {errors.categoryId && (
              <p className="text-xs text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Date, Payment Method & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Fecha
              </Label>
              <Input
                type="date"
                {...register("date", { required: true })}
                className="h-10 bg-muted/40 scheme-dark"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="size-3.5" />
                Método de Pago
              </Label>
              <select
                {...register("paymentMethod")}
                className="w-full h-10 px-3 bg-muted/40 border border-input rounded-lg text-xs text-foreground focus:outline-hidden focus:border-ring cursor-pointer"
              >
                {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                  <option
                    key={key}
                    value={key}
                    className="bg-popover text-popover-foreground"
                  >
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Wallet className="size-3.5" />
                Cuenta / Billetera
              </Label>
              <select
                {...register("accountId")}
                className="w-full h-10 px-3 bg-muted/40 border border-input rounded-lg text-xs text-foreground focus:outline-hidden focus:border-ring cursor-pointer"
              >
                <option value="">-- Sin cuenta --</option>
                {accounts.map((acc) => (
                  <option
                    key={acc.id}
                    value={acc.id}
                    className="bg-popover text-popover-foreground"
                  >
                    {acc.name} ({formatCurrency(acc.balance, acc.currency)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Compras en Cuotas (Solo para Gastos) */}
          {currentType === "expense" && (
            <div className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isInstallment")}
                    className="rounded border-border text-primary size-4"
                  />
                  <span className="flex items-center gap-1.5 text-foreground font-semibold">
                    <Layers className="size-3.5 text-primary" /> Compra financiada en Cuotas
                  </span>
                </label>
              </div>

              {isInstallment && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      Número de Cuotas
                    </Label>
                    <select
                      {...register("totalInstallments")}
                      className="w-full h-8 px-2 bg-background border border-input rounded text-xs"
                    >
                      {[2, 3, 4, 6, 9, 12, 18, 24, 36].map((num) => (
                        <option key={num} value={num}>
                          {num} Cuotas
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      Cuota Mensual Estimada
                    </Label>
                    <p className="text-xs font-mono font-bold text-foreground mt-1.5">
                      {numParsedAmount > 0
                        ? `${formatCurrency(
                            Number(
                              (
                                numParsedAmount /
                                Number(currentTotalInstallments || 1)
                              ).toFixed(2),
                            ),
                            currentCurrency,
                          )} / mes`
                        : "0.00 / mes"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cuentas Compartidas / Gastos a Medias (Solo para Gastos) */}
          {currentType === "expense" && (
            <div className="p-3 border border-border/80 rounded-xl bg-muted/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register("isShared")}
                    className="rounded border-input text-primary focus:ring-primary size-4"
                  />
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Users className="size-4 text-primary" />
                    <span>¿Gasto compartido? (Te deben dinero)</span>
                  </div>
                </label>
                {isShared && (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-primary/10 text-primary border-primary/20"
                  >
                    A medias
                  </Badge>
                )}
              </div>

              {isShared && (
                <div className="space-y-3 pt-1 border-t border-border/60 animate-in fade-in-50">
                  {/* Quick Split Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground mr-1">
                      Repartir:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSplitEvenly(2)}
                      className="px-2 py-0.5 rounded text-[11px] font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border cursor-pointer transition-colors"
                    >
                      50 / 50 (2 pers.)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSplitEvenly(3)}
                      className="px-2 py-0.5 rounded text-[11px] font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border cursor-pointer transition-colors"
                    >
                      Entre 3
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSplitEvenly(4)}
                      className="px-2 py-0.5 rounded text-[11px] font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border cursor-pointer transition-colors"
                    >
                      Entre 4
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">
                        Tu consumo real
                      </Label>
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="0.00"
                        {...register("myShare")}
                        className="h-8 text-xs bg-muted/40 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">
                        Monto por cobrar
                      </Label>
                      <div className="h-8 px-2.5 rounded-lg border border-border bg-muted/30 flex items-center text-xs font-bold text-amber-400 font-mono">
                        {formatCurrency(
                          Math.max(
                            0,
                            Number(
                              (
                                numParsedAmount - (Number(myShare) || 0)
                              ).toFixed(2),
                            ),
                          ),
                          currentCurrency,
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add participant */}
                  <div className="space-y-1.5 pt-1">
                    <Label className="text-[11px] text-muted-foreground">
                      ¿Quiénes te deben?
                    </Label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="text"
                        placeholder="Nombre (ej. Carlos)"
                        value={newPartName}
                        onChange={(e) => setNewPartName(e.target.value)}
                        className="h-8 text-xs bg-muted/40 flex-1"
                      />
                      <Input
                        type="number"
                        step="any"
                        placeholder="Monto"
                        value={newPartAmount}
                        onChange={(e) => setNewPartAmount(e.target.value)}
                        className="h-8 text-xs bg-muted/40 w-20 font-mono"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddParticipant}
                        className="h-8 px-2 text-xs cursor-pointer shrink-0"
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>

                    {participants.length > 0 && (
                      <div className="space-y-1 pt-1 max-h-28 overflow-y-auto">
                        {participants.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-background border border-border text-xs"
                          >
                            <span className="font-medium text-foreground truncate max-w-[120px]">
                              {p.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-amber-400 font-semibold">
                                {formatCurrency(p.amount, currentCurrency)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveParticipant(p.id)}
                                className="text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tags & Gastos Hormiga Helper */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Tag className="size-3" /> Etiquetas (#tags)
              </Label>
              {isLikelyPhantom && (
                <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                  <ShieldAlert className="size-3" /> Posible Gasto Hormiga (&le; {formatCurrency(settings.phantomExpenseThreshold || 20)})
                </span>
              )}
            </div>

            <Input
              type="text"
              placeholder="ej: gasto-hormiga, vacaciones, trabajo..."
              {...register("tagsString")}
              className="h-8 text-xs bg-muted/40"
            />

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {["gasto-hormiga", "vacaciones", "trabajo", "salud", "antojo"].map(
                (preset) => {
                  const isChecked = currentTags?.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => togglePresetTag(preset)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      #{preset}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <FileText className="size-3.5" />
              Notas adicionales (opcional)
            </Label>
            <textarea
              rows={2}
              placeholder="Detalles adicionales o recordatorios..."
              {...register("notes")}
              className="w-full px-3 py-2 bg-muted/40 border border-input rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-ring transition-colors resize-none"
            />
          </div>

          {/* Dialog Footer Actions */}
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
              className="cursor-pointer font-semibold gap-1.5"
            >
              <Check className="size-4" />
              {editingTransaction ? "Guardar Cambios" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
