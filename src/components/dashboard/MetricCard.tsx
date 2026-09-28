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
    <Card className="hover:border-border/80 transition-all shadow-xs flex flex-col justify-between py-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-4">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`size-4.5 ${iconColor}`} />
        </div>
      </CardHeader>

      <CardContent className="px-4 pt-1 space-y-1.5">
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {amount}
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <Badge
              variant={
                badge.type === 'positive'
                  ? 'default'
                  : badge.type === 'negative'
                  ? 'destructive'
                  : 'secondary'
              }
              className={`text-[10px] font-semibold px-2 py-0 ${
                badge.type === 'positive' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : ''
              }`}
            >
              {badge.text}
            </Badge>
          )}
          {subtitle && (
            <span className="text-xs text-muted-foreground truncate">
              {subtitle}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
