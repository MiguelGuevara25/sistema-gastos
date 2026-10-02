"use client";

import { useFinance } from "../../context/FinanceContext";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  HandCoins,
  Plus,
  Menu,
} from "lucide-react";

interface MobileNavProps {
  onOpenMenu: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenMenu }) => {
  const { activeTab, setActiveTab, setIsAddModalOpen, setEditingTransaction } =
    useFinance();

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border md:hidden px-3 py-1.5 safe-area-bottom shadow-lg">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Inicio */}
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === "dashboard"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutDashboard className="size-5 mb-0.5" />
          <span className="text-[10px]">Inicio</span>
        </button>

        {/* Movimientos */}
        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === "transactions"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowLeftRight className="size-5 mb-0.5" />
          <span className="text-[10px]">Movimientos</span>
        </button>

        {/* Floating Center (+) Add Button */}
        <div className="relative -top-3">
          <button
            onClick={handleOpenAdd}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 border-4 border-background cursor-pointer active:scale-95 transition-transform"
            aria-label="Nuevo Movimiento"
          >
            <Plus className="size-6" strokeWidth={2.5} />
          </button>
        </div>

        {/* Cuentas / Billeteras */}
        <button
          onClick={() => setActiveTab("wallets")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === "wallets"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wallet className="size-5 mb-0.5" />
          <span className="text-[10px]">Cuentas</span>
        </button>

        {/* Deudas */}
        <button
          onClick={() => setActiveTab("debts")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === "debts"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <HandCoins className="size-5 mb-0.5" />
          <span className="text-[10px]">Deudas</span>
        </button>

        {/* Más / Menú */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Menu className="size-5 mb-0.5" />
          <span className="text-[10px]">Más</span>
        </button>
      </div>
    </nav>
  );
};
