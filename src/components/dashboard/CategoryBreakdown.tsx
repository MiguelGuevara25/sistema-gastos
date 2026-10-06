"use client";

import React from "react";
import { useFinance } from "../../context/FinanceContext";
import { CategoryIcon } from "../ui/CategoryIcon";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, ArrowRight } from "lucide-react";

export const CategoryBreakdown: React.FC = () => {
  const { categoryBreakdown, formatCurrency, totalExpenses, setActiveTab } =
    useFinance();

  const topCategories = categoryBreakdown.slice(0, 5);

  const donutSlices = topCategories.reduce<
    Array<(typeof topCategories)[number] & { startAngle: number; endAngle: number }>
  >((acc, item) => {
    const lastEndAngle = acc.length > 0 ? acc[acc.length - 1].endAngle : 0;
    const sweep = (item.percentage / 100) * 360;
    acc.push({
      ...item,
      startAngle: lastEndAngle,
      endAngle: lastEndAngle + sweep,
    });
    return acc;
  }, []);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <PieChart className="size-4 text-muted-foreground" />
            Distribución por Categoría
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Gastos distribuidos en este periodo
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("analytics")}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium cursor-pointer h-7 px-2"
        >
          Ver todo
          <ArrowRight className="size-3" />
        </Button>
      </CardHeader>

      <CardContent className="pt-2">
        {topCategories.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-xs">
            No hay gastos registrados aún.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* SVG Donut */}
            <div className="md:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="stroke-muted"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {donutSlices.map((slice) => {
                    const strokeDasharray = `${(slice.percentage * circumference) / 100} ${circumference}`;
                    const strokeDashoffset = -(
                      (slice.startAngle / 360) *
                      circumference
                    );

                    return (
                      <circle
                        key={slice.category.id}
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke={slice.category.color}
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500 hover:opacity-85"
                      />
                    );
                  })}
                </svg>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    Total
                  </span>
                  <span className="text-xs font-bold text-foreground max-w-[85px] truncate">
                    {formatCurrency(totalExpenses)}
                  </span>
                </div>
              </div>
            </div>

            {/* List of Bars */}
            <div className="md:col-span-7 space-y-3">
              {topCategories.map((item) => (
                <div key={item.category.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${item.category.color}20` }}
                      >
                        <CategoryIcon
                          name={item.category.icon}
                          color={item.category.color}
                          size={12}
                        />
                      </div>
                      <span className="text-foreground font-medium truncate">
                        {item.category.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-foreground font-semibold">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className="text-[11px] text-muted-foreground w-8 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  {/* Progress track */}
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.category.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
