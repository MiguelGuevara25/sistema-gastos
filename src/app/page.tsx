'use client';

import React, { useState } from 'react';
import { FinanceProvider, useFinance } from '../context/FinanceContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { DashboardView } from '../components/dashboard/DashboardView';
import { TransactionList } from '../components/transactions/TransactionList';
import { BudgetView } from '../components/budgets/BudgetView';
import { AnalyticsView } from '../components/analytics/AnalyticsView';
import { SettingsView } from '../components/settings/SettingsView';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, isLoaded } = useFinance();
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'transactions' && <TransactionList />}
          {activeTab === 'budgets' && <BudgetView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Add / Edit Transaction Modal */}
      <TransactionModal />
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
