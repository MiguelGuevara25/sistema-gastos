'use client';

import React from 'react';
import {
  Utensils,
  Car,
  Home,
  Zap,
  Film,
  HeartPulse,
  GraduationCap,
  ShoppingBag,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  Tag,
  PlusCircle,
  HelpCircle,
  Coffee,
  Plane,
  Gift,
  CreditCard,
  DollarSign,
  ArrowRightLeft,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  Car,
  Home,
  Zap,
  Film,
  HeartPulse,
  GraduationCap,
  ShoppingBag,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  Tag,
  PlusCircle,
  HelpCircle,
  Coffee,
  Plane,
  Gift,
  CreditCard,
  DollarSign,
  ArrowRightLeft,
};

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = 'w-5 h-5',
  color,
  size = 20,
}) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;

  return (
    <IconComponent
      className={className}
      style={{ color: color || undefined }}
      size={size}
    />
  );
};
