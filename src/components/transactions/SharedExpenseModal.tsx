"use client";

import React, { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import { Transaction } from "../../types/finance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle2, Clock, Wallet, Check } from "lucide-react";

interface SharedExpenseModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SharedExpenseModal: React.FC<SharedExpenseModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const { settleSharedExpenseParticipant, accounts, formatCurrency } =
    useFinance();

  const [selectedParticipantId, setSelectedParticipantId] = useState<
    string | null
  >(null);
  const [targetAccountId, setTargetAccountId] = useState<string>(
    accounts[0]?.id || "",
  );

  if (!transaction || !transaction.sharedDetails) return null;

  const { sharedDetails } = transaction;

  const handleSettle = (participantId: string) => {
    settleSharedExpenseParticipant(
      transaction.id,
      participantId,
      targetAccountId || undefined,
    );
    setSelectedParticipantId(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Users className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold">
                Cuentas Compartidas & Reembolsos
              </DialogTitle>
              <DialogDescription className="text-xs">
                {transaction.description} • {transaction.date}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Financial Breakdown */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-muted/40 rounded-xl border border-border text-center">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Total Pagado
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground">
              {formatCurrency(sharedDetails.totalPaid, transaction.currency)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Tu Gasto Real
            </span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400">
              {formatCurrency(sharedDetails.myShare, transaction.currency)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Por Cobrar
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-400">
              {formatCurrency(sharedDetails.owedAmount, transaction.currency)}
            </span>
          </div>
        </div>

        {/* Account Selector for Reimbursement Deposit */}
        {selectedParticipantId && accounts.length > 0 && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-2 animate-in fade-in-50">
            <LabelWithIcon icon={Wallet} label="¿En qué billetera o cuenta recibiste este pago?" />
            <select
              value={targetAccountId}
              onChange={(e) => setTargetAccountId(e.target.value)}
              className="w-full h-9 px-3 bg-background border border-input rounded-lg text-xs font-medium text-foreground cursor-pointer focus:outline-none"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency || "PEN"} - Saldo: {formatCurrency(acc.balance, acc.currency)})
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedParticipantId(null)}
                className="h-7 text-xs"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={() => handleSettle(selectedParticipantId)}
                className="h-7 text-xs font-semibold gap-1"
              >
                <Check className="size-3.5" />
                Confirmar Cobro
              </Button>
            </div>
          </div>
        )}

        {/* Participants List */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground block">
            Participantes ({sharedDetails.participants.length})
          </span>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {sharedDetails.participants.map((p) => {
              const isSettlingThis = selectedParticipantId === p.id;
              const isSettled = p.settled;

              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${
                    isSettled
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-background border-border hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isSettled
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      {isSettled ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <Clock className="size-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {isSettled
                          ? `Reembolsado el ${p.settledDate || "recientemente"}`
                          : "Pendiente de pago"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs sm:text-sm font-bold font-mono ${
                        isSettled ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {formatCurrency(p.amount, transaction.currency)}
                    </span>

                    {!isSettled && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (accounts.length > 0) {
                            setSelectedParticipantId(p.id);
                          } else {
                            handleSettle(p.id);
                          }
                        }}
                        disabled={isSettlingThis}
                        className="h-7 px-2 text-[11px] font-semibold text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
                      >
                        Cobrar
                      </Button>
                    )}

                    {isSettled && (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      >
                        Pagado
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto cursor-pointer"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const LabelWithIcon = ({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) => (
  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
    <Icon className="size-3.5 text-primary" />
    {label}
  </label>
);
