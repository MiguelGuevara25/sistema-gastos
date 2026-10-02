"use client";

import { useFinance } from "../../context/FinanceContext";
import { PwaInstallPrompt } from "../pwa/PwaInstallPrompt";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Plus,
  Sun,
  Moon,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Cloud,
  LogIn,
} from "lucide-react";

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    activeTab,
    setIsAddModalOpen,
    setIsReportModalOpen,
    setEditingTransaction,
    settings,
    updateSettings,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    goToPreviousMonth,
    goToNextMonth,
    user,
    setIsAuthModalOpen,
    isCloudSyncing,
  } = useFinance();

  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return {
          title: "Panel General",
          subtitle: "Vista global de tus finanzas e ingresos",
        };
      case "transactions":
        return {
          title: "Movimientos",
          subtitle: "Historial completo y gestión de gastos e ingresos",
        };
      case "wallets":
        return {
          title: "Billeteras & Tarjetas",
          subtitle: "Control de saldos en bancos, multi-divisa y ciclo de tarjetas",
        };
      case "cashflow":
        return {
          title: "Flujo de Caja Futuro",
          subtitle: "Proyección predictiva de liquidez a 30, 60 y 90 días",
        };
      case "recurring":
        return {
          title: "Gastos Fijos & Servicios",
          subtitle: "Obligaciones mensuales, suscripciones y vencimientos",
        };
      case "debts":
        return {
          title: "Deudas & Préstamos",
          subtitle: "Control de cobros y simulador Bola de Nieve vs Avalancha",
        };
      case "challenges":
        return {
          title: "Retos de Ahorro",
          subtitle: "Desafíos gamificados de 52 semanas, anti-fugas y medallas",
        };
      case "budgets":
        return {
          title: "Presupuestos",
          subtitle: "Límites mensuales y control de consumo",
        };
      case "goals":
        return {
          title: "Metas de Ahorro",
          subtitle: "Alcanza tus objetivos y fondos de emergencia",
        };
      case "analytics":
        return {
          title: "Estadísticas",
          subtitle: "Distribución y métricas de gastos",
        };
      case "advisor":
        return {
          title: "Simulador & Consejos",
          subtitle: "Diagnóstico 50/30/20, interés compuesto e inversión",
        };
      case "settings":
        return {
          title: "Configuración",
          subtitle: "Ajustes del sistema y copias de seguridad",
        };
      default:
        return { title: "Finanzas", subtitle: "Sistema de Gastos" };
    }
  };

  const { title, subtitle } = getTabTitle();

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" });
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-background/85 backdrop-blur-md border-b border-border transition-colors">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenMobileMenu}
          className="p-1.5 -ml-1 text-muted-foreground md:hidden cursor-pointer shrink-0"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </Button>

        <div className="min-w-0">
          <h2 className="text-sm sm:text-lg md:text-xl font-bold text-foreground tracking-tight truncate max-w-32.5 sm:max-w-none">
            {title}
          </h2>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto shrink-0">
        {/* Month Navigation & Selector */}
        <div className="flex items-center bg-muted/40 border border-border rounded-lg p-0.5 shadow-2xs shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            disabled={selectedMonth === "all"}
            title="Mes anterior"
            className="h-7 w-6 sm:w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="size-3.5" />
          </Button>

          <div className="relative flex items-center px-1">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-[11px] sm:text-xs font-semibold text-foreground cursor-pointer focus:outline-none appearance-none pr-3 sm:pr-4 pl-0.5 sm:pl-1.5 py-1 max-w-19.5 sm:max-w-none truncate"
            >
              {availableMonths.map((m) => (
                <option
                  key={m.value}
                  value={m.value}
                  className="bg-popover text-popover-foreground"
                >
                  {m.label}
                </option>
              ))}
              <option
                value="all"
                className="bg-popover text-popover-foreground"
              >
                📅 Histórico completo
              </option>
            </select>
            <Calendar className="size-3 text-muted-foreground pointer-events-none absolute right-0.5 sm:right-1" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            disabled={selectedMonth === "all"}
            title="Mes siguiente"
            className="h-7 w-6 sm:w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>

        {/* Monthly PDF Report Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsReportModalOpen(true)}
          title="Generar e imprimir reporte ejecutivo del mes (PDF)"
          className="cursor-pointer gap-1.5 h-8 px-2 sm:px-2.5 text-xs font-medium border-border/80 hover:bg-muted/60"
        >
          <FileText className="size-3.5 text-primary" />
          <span className="hidden sm:inline">Reporte</span>
        </Button>

        {/* PWA Install Button / Prompt */}
        <div className="hidden xs:block">
          <PwaInstallPrompt />
        </div>

        {/* Supabase Cloud Auth Button */}
        {user ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAuthModalOpen(true)}
            title={`Conectado a la nube: ${user.email}`}
            className="cursor-pointer gap-1.5 h-8 px-2 sm:px-2.5 text-xs font-medium text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
          >
            <Cloud className="size-3.5 shrink-0" />
            <span className="hidden sm:inline truncate max-w-[100px]">
              {user.user_metadata?.full_name || user.email?.split("@")[0]}
            </span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAuthModalOpen(true)}
            className="cursor-pointer gap-1.5 h-8 px-2 sm:px-2.5 text-xs font-semibold border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          >
            <LogIn className="size-3.5 shrink-0" />
            <span className="hidden sm:inline">Iniciar Sesión</span>
          </Button>
        )}

        {/* Theme toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          title={
            settings.theme === "dark"
              ? "Cambiar a modo claro"
              : "Cambiar a modo oscuro"
          }
          className="cursor-pointer h-8 w-8 p-0 shrink-0"
        >
          {settings.theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>

        {/* Quick Add Button (Desktop only, mobile uses bottom floating button) */}
        <Button
          size="sm"
          onClick={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          className="hidden md:inline-flex cursor-pointer font-semibold gap-1.5 h-8 shadow-xs"
        >
          <Plus className="size-3.5" strokeWidth={2.5} />
          <span>Nuevo Movimiento</span>
        </Button>
      </div>
    </header>
  );
};
