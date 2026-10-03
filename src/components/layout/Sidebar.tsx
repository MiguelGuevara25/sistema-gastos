"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useFinance } from "../../context/FinanceContext";
import { ActiveTab } from "../../types/finance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  Activity,
  Trophy,
  X,
  LogIn,
  LogOut,
  Cloud,
} from "lucide-react";

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  setIsMobileOpen,
}) => {
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
    user,
    setIsAuthModalOpen,
    signOut,
    isCloudSyncing,
  } = useFinance();

  // Mobile swipe and drag gesture state
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const isHorizontalSwipe = useRef<boolean>(false);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isMobileOpen]);

  // Edge swipe to open sidebar from left screen edge on mobile
  useEffect(() => {
    let edgeStartX = 0;
    let edgeStartY = 0;
    let isEdgeEligible = false;

    const onWindowTouchStart = (e: TouchEvent) => {
      if (isMobileOpen) return;
      const touch = e.touches[0];
      // Detect touch starting within the left 28px of the screen
      if (touch && touch.clientX <= 28) {
        edgeStartX = touch.clientX;
        edgeStartY = touch.clientY;
        isEdgeEligible = true;
      }
    };

    const onWindowTouchMove = (e: TouchEvent) => {
      if (!isEdgeEligible) return;
      const touch = e.touches[0];
      if (!touch) return;
      const deltaX = touch.clientX - edgeStartX;
      const deltaY = touch.clientY - edgeStartY;

      // Swiped right by > 45px with predominant horizontal motion
      if (deltaX > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        setIsMobileOpen(true);
        isEdgeEligible = false;
      }
    };

    const onWindowTouchEnd = () => {
      isEdgeEligible = false;
    };

    window.addEventListener("touchstart", onWindowTouchStart, { passive: true });
    window.addEventListener("touchmove", onWindowTouchMove, { passive: true });
    window.addEventListener("touchend", onWindowTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onWindowTouchStart);
      window.removeEventListener("touchmove", onWindowTouchMove);
      window.removeEventListener("touchend", onWindowTouchEnd);
    };
  }, [isMobileOpen, setIsMobileOpen]);

  // Touch handlers on the open sidebar to allow sliding it closed (swipe left)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchCurrentX.current = e.touches[0].clientX;
    isHorizontalSwipe.current = false;
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
    const deltaX = touchCurrentX.current - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Determine gesture direction
    if (!isHorizontalSwipe.current) {
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
        isHorizontalSwipe.current = true;
      }
    }

    if (isHorizontalSwipe.current) {
      // Swiping left (closing gesture)
      if (deltaX < 0) {
        setDragOffset(deltaX);
        setIsDragging(true);
      } else {
        setDragOffset(0);
        setIsDragging(false);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isDragging && isHorizontalSwipe.current) {
      // If dragged left by more than 50px or rapid swipe, close sidebar
      if (dragOffset < -50) {
        setIsMobileOpen(false);
      }
    }
    setDragOffset(0);
    setIsDragging(false);
    isHorizontalSwipe.current = false;
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] =
    [
      { id: "dashboard", label: "Panel General", icon: LayoutDashboard },
      { id: "transactions", label: "Movimientos", icon: ArrowLeftRight },
      { id: "wallets", label: "Billeteras & Tarjetas", icon: Wallet },
      { id: "cashflow", label: "Flujo de Caja", icon: Activity },
      { id: "recurring", label: "Gastos Fijos", icon: Receipt },
      { id: "debts", label: "Deudas & Préstamos", icon: HandCoins },
      { id: "challenges", label: "Retos de Ahorro", icon: Trophy },
      { id: "budgets", label: "Presupuestos", icon: PieChart },
      { id: "goals", label: "Metas de Ahorro", icon: Target },
      { id: "analytics", label: "Estadísticas & Fugas", icon: BarChart3 },
      { id: "advisor", label: "Simulador & Consejos", icon: Sparkles },
      { id: "settings", label: "Configuración", icon: Settings },
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
          style={
            isDragging && dragOffset < 0
              ? {
                  opacity: Math.max(0, 1 - Math.abs(dragOffset) / 280),
                  transition: "none",
                }
              : undefined
          }
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={
          isDragging && dragOffset < 0
            ? {
                transform: `translateX(${dragOffset}px)`,
                transition: "none",
              }
            : undefined
        }
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 md:w-64 max-w-[85vw] h-full bg-sidebar border-r border-sidebar-border flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 overflow-hidden shadow-2xl md:shadow-none select-none md:select-auto ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Swipe Grab Indicator Handle */}
        <div className="md:hidden absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-12 rounded-full bg-muted-foreground/25 pointer-events-none" />

        {/* Fixed Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
                Finanza
                <Badge
                  variant="secondary"
                  className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0"
                >
                  Pro
                </Badge>
              </h1>
              <p className="text-[11px] text-muted-foreground">
                Gestor de Gastos
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Scrollable Content Body with native touch momentum */}
        <div
          className="flex-1 overflow-y-auto overscroll-y-contain p-4 space-y-4"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Quick Action Button with shadcn Button */}
          <div>
            <Button
              onClick={handleOpenAddModal}
              className="w-full flex items-center justify-center gap-2 h-10 font-semibold cursor-pointer shadow-xs"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              <span>Nuevo Movimiento</span>
            </Button>
          </div>

          <Separator />

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
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full justify-start gap-3 h-10 px-3.5 text-sm font-medium cursor-pointer ${
                    isActive
                      ? "font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4.5" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* Quick Access to Monthly Executive Report */}
          <div className="pt-1">
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

          {/* Quick Balance Summary Card */}
          <div className="pt-2">
            <Card className="p-3.5 gap-2 border-border/80 shadow-xs bg-card/60">
              <CardContent className="p-0 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Balance Total</span>
                  <Sparkles className="size-3.5 text-muted-foreground" />
                </div>
                <div
                  className={`text-lg font-bold tracking-tight ${
                    netBalance >= 0 ? "text-foreground" : "text-destructive"
                  }`}
                >
                  {formatCurrency(netBalance)}
                </div>
                <Separator />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <TrendingUp className="size-3" />{" "}
                    {formatCurrency(totalIncome)}
                  </span>
                  <span className="flex items-center gap-1 text-rose-400 font-medium">
                    <TrendingDown className="size-3" />{" "}
                    {formatCurrency(totalExpenses)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* User Profile / Supabase Cloud Status Fixed Footer */}
        <div className="p-3 border-t border-sidebar-border shrink-0 bg-sidebar">
          {user ? (
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="h-8 w-8 border border-border shrink-0">
                  <AvatarFallback className="font-semibold text-xs bg-emerald-500/20 text-emerald-400">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario"}
                  </p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    {isCloudSyncing ? "Sincronizando..." : "Supabase Cloud"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                title="Cerrar sesión"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 px-1">
                <Avatar className="h-7 w-7 border border-border">
                  <AvatarFallback className="font-semibold text-[11px] bg-muted text-muted-foreground">
                    L
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {settings.userName || "Modo Local"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Sin sincronizar en la nube
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsMobileOpen(false);
                }}
                className="w-full h-8 text-xs font-semibold gap-1.5 cursor-pointer border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                <LogIn className="size-3.5" />
                <span>Conectar Nube</span>
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
