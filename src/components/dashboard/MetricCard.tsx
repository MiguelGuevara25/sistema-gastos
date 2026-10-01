'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  badge?: {
    text: string;
    type: 'positive' | 'negative' | 'neutral';
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  iconColor = 'text-foreground',
  iconBg = 'bg-muted',
  badge,
}) => {
  return (
    <Card className="hover:border-border/80 transition-all shadow-xs flex flex-col justify-between py-3 sm:py-4">
      <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 space-y-0 px-3 sm:px-4">
        <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate max-w-[90px] xs:max-w-none">{title}</span>
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`size-3.5 sm:size-4.5 ${iconColor}`} />
        </div>
      </CardHeader>

      <CardContent className="px-3 sm:px-4 pt-1 space-y-1 sm:space-y-1.5">
        <div className="text-lg xs:text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
          {amount}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {badge && (
            <Badge
              variant={
                badge.type === 'positive'
                  ? 'default'
                  : badge.type === 'negative'
                  ? 'destructive'
                  : 'secondary'
              }
              className={`text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0 shrink-0 ${
                badge.type === 'positive' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : ''
              }`}
            >
              {badge.text}
            </Badge>
          )}
          {subtitle && (
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-full">
              {subtitle}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
