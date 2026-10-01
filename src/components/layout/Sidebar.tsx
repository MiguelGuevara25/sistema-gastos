'use client';

import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ActiveTab } from '../../types/finance';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  Settings,
  Plus,
  Wallet,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Target,
  Receipt,
  HandCoins,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const {
    activeTab,
    setActiveTab,
    setIsAddModalOpen,
    setIsReportModalOpen,
    setEditingTransaction,
    netBalance,
    totalIncome,
    totalExpenses,
    formatCurrency,
    settings,
  } = useFinance();

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Panel General', icon: LayoutDashboard },
    { id: 'transactions', label: 'Movimientos', icon: ArrowLeftRight },
    { id: 'wallets', label: 'Billeteras & Cuentas', icon: Wallet },
    { id: 'recurring', label: 'Gastos Fijos', icon: Receipt },
    { id: 'debts', label: 'Deudas & Préstamos', icon: HandCoins },
    { id: 'budgets', label: 'Presupuestos', icon: PieChart },
    { id: 'goals', label: 'Metas de Ahorro', icon: Target },
    { id: 'analytics', label: 'Estadísticas', icon: BarChart3 },
    { id: 'advisor', label: 'Simulador & Tips', icon: Sparkles },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 p-4">
          {/* Logo / Brand Header */}
          <div className="flex items-center justify-between px-2 py-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  Finanza
                  <Badge variant="secondary" className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0">
                    Pro
                  </Badge>
                </h1>
                <p className="text-[11px] text-muted-foreground">Gestor de Gastos</p>
              </div>
            </div>
          </div>

          {/* Quick Action Button with shadcn Button */}
          <div className="mb-5">
            <Button
              onClick={handleOpenAddModal}
              className="w-full flex items-center justify-center gap-2 h-10 font-semibold cursor-pointer shadow-xs"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              <span>Nuevo Movimiento</span>
            </Button>
          </div>

          <Separator className="mb-4" />

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Menú Principal
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full justify-start gap-3 h-10 px-3.5 text-sm font-medium cursor-pointer ${
                    isActive ? 'font-semibold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4.5" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* Quick Access to Monthly Executive Report */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsReportModalOpen(true);
                setIsMobileOpen(false);
              }}
              className="w-full justify-start gap-2.5 h-9 px-3 text-xs font-semibold cursor-pointer border-dashed border-primary/40 text-primary hover:bg-primary/10 transition-colors"
            >
              <FileText className="size-4" />
              <span>Reporte Mensual (PDF)</span>
            </Button>
          </div>

          {/* Quick Balance Summary Card with shadcn Card */}
          <div className="mt-auto pt-4">
            <Card className="p-3.5 gap-2 border-border/80 shadow-xs">
              <CardContent className="p-0 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Balance Total</span>
                  <Sparkles className="size-3.5 text-muted-foreground" />
                </div>
                <div
                  className={`text-lg font-bold tracking-tight ${
                    netBalance >= 0 ? 'text-foreground' : 'text-destructive'
                  }`}
                >
                  {formatCurrency(netBalance)}
                </div>
                <Separator />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <TrendingUp className="size-3" /> {formatCurrency(totalIncome)}
                  </span>
                  <span className="flex items-center gap-1 text-rose-400 font-medium">
                    <TrendingDown className="size-3" /> {formatCurrency(totalExpenses)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* User Profile / Status Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-1">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarFallback className="font-semibold text-xs bg-muted text-foreground">
                {settings.userName ? settings.userName.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {settings.userName || 'Usuario'}
              </p>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Local Storage
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
