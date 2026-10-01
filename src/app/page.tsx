'use client';

import React, { useState } from 'react';
import { FinanceProvider, useFinance } from '../context/FinanceContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { DashboardView } from '../components/dashboard/DashboardView';
import { TransactionList } from '../components/transactions/TransactionList';
import { WalletView } from '../components/wallets/WalletView';
import { RecurringExpensesView } from '../components/recurring/RecurringExpensesView';
import { DebtsLoansView } from '../components/debts/DebtsLoansView';
import { BudgetView } from '../components/budgets/BudgetView';
import { GoalsView } from '../components/goals/GoalsView';
import { AnalyticsView } from '../components/analytics/AnalyticsView';
import { FinancialAdvisorView } from '../components/advisor/FinancialAdvisorView';
import { SettingsView } from '../components/settings/SettingsView';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { MonthlyReportModal } from '../components/reports/MonthlyReportModal';
import { MobileNav } from '../components/layout/MobileNav';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, isLoaded, isReportModalOpen, setIsReportModalOpen } = useFinance();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-200 mb-3" />
        <p className="text-xs font-medium tracking-wide">Cargando tus finanzas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row antialiased">
      {/* Sidebar (Desktop fixed & Mobile Drawer) */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        {/* Sticky Header */}
        <Header onOpenMobileMenu={() => setIsMobileOpen(true)} />

        {/* Dynamic Content Views */}
        <main className="flex-1 p-3 pb-24 sm:p-6 lg:p-8 sm:pb-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'transactions' && <TransactionList />}
          {activeTab === 'wallets' && <WalletView />}
          {activeTab === 'recurring' && <RecurringExpensesView />}
          {activeTab === 'debts' && <DebtsLoansView />}
          {activeTab === 'budgets' && <BudgetView />}
          {activeTab === 'goals' && <GoalsView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'advisor' && <FinancialAdvisorView />}
          {activeTab === 'settings' && <SettingsView />}
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
