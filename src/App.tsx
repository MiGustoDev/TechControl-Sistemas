import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider, useApp } from "@/context/AppContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { DashboardPage } from "@/pages/DashboardPage";
import { PrintersPage } from "@/pages/PrintersPage";
import { NotebooksPage } from "@/pages/NotebooksPage";
import { CatalogPage } from "@/pages/CatalogPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { MovementsPage } from "@/pages/MovementsPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { DataliveTVPage } from "@/pages/DataliveTVPage";
import { MonitoresPage } from "@/pages/MonitoresPage";
import { PersonalPage } from "@/pages/PersonalPage";

function AppContent() {
  const { currentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard": return <DashboardPage />;
      case "printers": return <PrintersPage />;
      case "notebooks": return <NotebooksPage />;
      case "monitors": return <MonitoresPage />;
      case "catalog": return <CatalogPage />;
      case "orders": return <OrdersPage />;
      case "movements": return <MovementsPage />;
      case "personal": return <PersonalPage />;
      case "reports": return <ReportsPage />;
      case "datalive": return <DataliveTVPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster position="bottom-right" richColors />
    </AppProvider>
  );
}

export default App;
