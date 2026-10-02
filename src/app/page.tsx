"use client";

import React, { useState } from "react";
import { FinanceProvider, useFinance } from "../context/FinanceContext";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { DashboardView } from "../components/dashboard/DashboardView";
import { DashboardSkeleton } from "../components/dashboard/DashboardSkeleton";
import { TransactionList } from "../components/transactions/TransactionList";
import { WalletView } from "../components/wallets/WalletView";
import { RecurringExpensesView } from "../components/recurring/RecurringExpensesView";
import { DebtsLoansView } from "../components/debts/DebtsLoansView";
import { BudgetView } from "../components/budgets/BudgetView";
import { GoalsView } from "../components/goals/GoalsView";
import { AnalyticsView } from "../components/analytics/AnalyticsView";
import { FinancialAdvisorView } from "../components/advisor/FinancialAdvisorView";
import { SettingsView } from "../components/settings/SettingsView";
import { CashFlowProjectionView } from "../components/cashflow/CashFlowProjectionView";
import { SavingsChallengesView } from "../components/challenges/SavingsChallengesView";
import { TransactionModal } from "../components/transactions/TransactionModal";
import { MonthlyReportModal } from "../components/reports/MonthlyReportModal";
import { AuthModal } from "../components/auth/AuthModal";
import { WelcomeAuthScreen } from "../components/auth/WelcomeAuthScreen";
import { MobileNav } from "../components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

const AppContent: React.FC = () => {
  const {
    activeTab,
    isLoaded,
    user,
    isDemoMode,
    setIsAuthModalOpen,
    isReportModalOpen,
    setIsReportModalOpen,
    isAuthModalOpen,
  } = useFinance();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // 1. Initial Loading Screen with Skeletons
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-zinc-800 animate-pulse" />
            <div className="h-5 w-32 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="h-8 w-24 bg-zinc-800 rounded-lg animate-pulse" />
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  // 2. Welcome / Login Gate Screen (if not logged in and not in demo mode)
  if (!user && !isDemoMode) {
    return <WelcomeAuthScreen />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row antialiased">
      {/* Sidebar (Desktop w-64 fixed & Mobile Drawer) */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        {/* Demo Mode Announcement Banner */}
        {isDemoMode && !user && (
          <div className="no-print bg-gradient-to-r from-amber-500/15 via-primary/20 to-amber-500/15 border-b border-amber-500/30 px-3 py-2 text-xs flex items-center justify-between gap-2 text-foreground">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1 rounded-md bg-amber-500/20 text-amber-400 shrink-0">
                <Sparkles className="size-3.5" />
              </span>
              <p className="truncate text-[11px] sm:text-xs">
                <strong>Modo Demostración:</strong> Explorando datos simulados. Para guardar tus finanzas en la nube, regístrate gratis.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAuthModalOpen(true)}
              className="h-7 px-2.5 text-[11px] font-bold cursor-pointer shrink-0 gap-1 bg-amber-500 hover:bg-amber-600 text-black shadow-xs"
            >
              <ShieldCheck className="size-3" />
              <span>Crear Cuenta</span>
              <ArrowRight className="size-3" />
            </Button>
          </div>
        )}

        {/* Sticky Header */}
        <Header onOpenMobileMenu={() => setIsMobileOpen(true)} />

        {/* Dynamic Content Views */}
        <main className="flex-1 p-3 pb-24 sm:p-6 lg:p-8 sm:pb-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "transactions" && <TransactionList />}
          {activeTab === "wallets" && <WalletView />}
          {activeTab === "cashflow" && <CashFlowProjectionView />}
          {activeTab === "recurring" && <RecurringExpensesView />}
          {activeTab === "debts" && <DebtsLoansView />}
          {activeTab === "challenges" && <SavingsChallengesView />}
          {activeTab === "budgets" && <BudgetView />}
          {activeTab === "goals" && <GoalsView />}
          {activeTab === "analytics" && <AnalyticsView />}
          {activeTab === "advisor" && <FinancialAdvisorView />}
          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>

      {/* Mobile Native Bottom Navigation Bar */}
      <MobileNav onOpenMenu={() => setIsMobileOpen(true)} />

      {/* Global Add / Edit Transaction Modal */}
      <TransactionModal />

      {/* Global Executive PDF Report Modal */}
      <MonthlyReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Global Supabase Cloud Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function Home() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
