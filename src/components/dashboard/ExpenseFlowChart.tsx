"use client";

import { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export const ExpenseFlowChart: React.FC = () => {
  const { monthlyExpenseTrend, formatCurrency } = useFinance();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Find max value to scale chart height
  const maxValue = Math.max(
    ...monthlyExpenseTrend.flatMap((d) => [d.income, d.expenses]),
    100,
  );

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="size-4 text-muted-foreground" />
            Flujo de Ingresos vs Gastos
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Comparativa histórica de los últimos meses
          </CardDescription>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span>Ingresos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
            <span>Gastos</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-56 w-full flex items-end gap-2 sm:gap-6 pt-6 pb-2 border-b border-border">
          {monthlyExpenseTrend.map((item, index) => {
            const incomeHeight = Math.max(
              4,
              Math.round((item.income / maxValue) * 100),
            );
            const expenseHeight = Math.max(
              4,
              Math.round((item.expenses / maxValue) * 100),
            );
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 bg-popover text-popover-foreground border border-border px-2.5 py-1.5 rounded-lg shadow-xl text-[11px] whitespace-nowrap pointer-events-none transition-all">
                    <div className="text-emerald-400 font-semibold">
                      +{formatCurrency(item.income)}
                    </div>
                    <div className="text-rose-400 font-semibold">
                      -{formatCurrency(item.expenses)}
                    </div>
                  </div>
                )}

                {/* Bars Pair */}
                <div className="w-full flex items-end justify-center gap-1.5 h-full">
                  {/* Income Bar */}
                  <div
                    className="w-full max-w-[14px] bg-emerald-500/80 hover:bg-emerald-400 rounded-t-md transition-all duration-300"
                    style={{ height: `${incomeHeight}%` }}
                  />
                  {/* Expense Bar */}
                  <div
                    className="w-full max-w-[14px] bg-rose-500/80 hover:bg-rose-400 rounded-t-md transition-all duration-300"
                    style={{ height: `${expenseHeight}%` }}
                  />
                </div>

                {/* Month label */}
                <span
                  className={`text-[11px] mt-2 transition-colors ${
                    isHovered
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
