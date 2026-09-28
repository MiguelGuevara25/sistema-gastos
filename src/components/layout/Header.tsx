'use client';

import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, Plus, Sun, Moon, Calendar } from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { activeTab, setIsAddModalOpen, setEditingTransaction, settings, updateSettings } = useFinance();

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Panel General', subtitle: 'Vista global de tus finanzas e ingresos' };
      case 'transactions':
        return { title: 'Movimientos', subtitle: 'Historial completo y gestión de gastos e ingresos' };
      case 'budgets':
        return { title: 'Presupuestos', subtitle: 'Límites mensuales y control de consumo' };
      case 'analytics':
        return { title: 'Estadísticas', subtitle: 'Distribución y métricas de gastos' };
      case 'settings':
        return { title: 'Configuración', subtitle: 'Ajustes del sistema y copias de seguridad' };
      default:
        return { title: 'Panel', subtitle: 'Sistema de Gastos' };
    }
  };

  const { title, subtitle } = getTabTitle();

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-background/80 backdrop-blur-md border-b border-border transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 text-muted-foreground md:hidden cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </Button>

        <div>
          <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground hidden sm:block mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Date badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border text-xs font-medium text-muted-foreground bg-muted/30">
          <Calendar className="size-3.5" />
          <span>{capitalizedDate}</span>
        </div>

        {/* Theme toggle using shadcn Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          title={settings.theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="cursor-pointer h-8 w-8 p-0"
        >
          {settings.theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        {/* Quick Add Button in Header */}
        <Button
          size="sm"
          onClick={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          className="cursor-pointer font-semibold gap-1.5 h-8 shadow-xs"
        >
          <Plus className="size-3.5" strokeWidth={2.5} />
          <span className="hidden sm:inline">Nuevo Movimiento</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </div>
    </header>
  );
};
