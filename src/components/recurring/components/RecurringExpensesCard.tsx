import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useFinance } from "@/context/FinanceContext";
import { PAYMENT_METHOD_LABELS } from "@/data/categories";
import { Account, Category, RecurringExpense } from "@/types/finance";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Edit2,
  Receipt,
  Trash2,
  Wallet,
} from "lucide-react";

interface RecurringExpensesCardProps {
  isPaid: boolean;
  exp: RecurringExpense;
  category: Category | { name: string; icon: string; color: string };
  account: Account | undefined;
  handleOpenPayModal: (expense: RecurringExpense) => void;
  handleOpenEditModal: (expense: RecurringExpense) => void;
}

export const RecurringExpensesCard = ({
  isPaid,
  exp,
  category,
  account,
  handleOpenPayModal,
  handleOpenEditModal,
}: RecurringExpensesCardProps) => {
  const { deleteRecurringExpense, formatCurrency } = useFinance();

  return (
    <Card
      className={`relative overflow-hidden border transition-all flex flex-col justify-between ${
        isPaid
          ? "border-emerald-500/20 bg-muted/10"
          : "border-border/70 hover:border-border"
      }`}
    >
      {/* Top Accent Strip */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: isPaid ? "#10b981" : category.color }}
      />

      <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Top line: icon, name and actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${category.color}20`,
                  color: category.color,
                  border: `1px solid ${category.color}40`,
                }}
              >
                <CategoryIcon
                  name={category.icon}
                  color={category.color}
                  size={18}
                />
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground leading-tight">
                  {exp.name}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-muted-foreground">
                    {category.name}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-[11px] text-muted-foreground">
                    Día {exp.dueDay} de cada mes
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenEditModal(exp)}
                className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm(`¿Eliminar el gasto recurrente "${exp.name}"?`)) {
                    deleteRecurringExpense(exp.id);
                  }
                }}
                className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-rose-400"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Amount and Status Pill */}
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium">
                Monto Fijo
              </span>
              <div className="text-2xl font-black text-foreground">
                {formatCurrency(exp.amount)}
              </div>
            </div>

            <div>
              {isPaid ? (
                <Badge
                  variant="default"
                  className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 gap-1 text-xs"
                >
                  <CheckCircle2 className="size-3" />
                  Pagado este mes
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-amber-500/10 text-amber-400 border border-amber-500/20 gap-1 text-xs"
                >
                  <Clock className="size-3" />
                  Pendiente (Día {exp.dueDay})
                </Badge>
              )}
            </div>
          </div>

          {/* Account / Payment Method Info */}
          <div className="mt-3 p-2.5 rounded-lg bg-muted/30 border border-border/50 text-[11px] flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CreditCard className="size-3" />
              {PAYMENT_METHOD_LABELS[exp.paymentMethod] || exp.paymentMethod}
            </span>
            {account && (
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Wallet className="size-3 text-primary" />
                {account.name}
              </span>
            )}
          </div>

          {exp.notes && (
            <p className="text-[11px] text-muted-foreground/80 italic mt-2">
              &quot;{exp.notes}&quot;
            </p>
          )}
        </div>

        {/* Bottom Action: Pay or Confirmed */}
        <div className="pt-3 border-t border-border/50 mt-4">
          {isPaid ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="w-full h-8 text-xs opacity-60 gap-1.5 text-emerald-400"
            >
              <CheckCircle2 className="size-3.5" />
              Cubierto este mes
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => handleOpenPayModal(exp)}
              className="w-full h-8 text-xs cursor-pointer font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
            >
              <Receipt className="size-3.5" />
              Pagar / Registrar este mes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
