import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider, useApp } from "@/context/AppContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { PrintersPage } from "@/pages/PrintersPage";
import { NotebooksPage } from "@/pages/NotebooksPage";
import { CatalogPage } from "@/pages/CatalogPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { MovementsPage } from "@/pages/MovementsPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { DataliveTVPage } from "@/pages/DataliveTVPage";
import { MonitoresPage } from "@/pages/MonitoresPage";
import { PersonalPage } from "@/pages/PersonalPage";
import { GuardiasPage } from "@/pages/GuardiasPage";
import { NotesPage } from "@/pages/NotesPage";
import { OfficeTicketsPage } from "@/pages/OfficeTicketsPage";
import { DatabasesPage } from "@/pages/DatabasesPage";
import { ObjectivesPage } from "@/pages/ObjectivesPage";
import { PricesPage } from "@/pages/PricesPage";
import { SpecialTasksPage } from "@/pages/SpecialTasksPage";
import { LoginPage } from "@/components/layout/LoginPage";

function AppContent() {
  const { currentPage, session, loadingSession, userRole } = useApp();

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent" />
          <span className="text-sm font-semibold text-muted-foreground">Verificando sesión...</span>
        </div>
      </div>
    );
  }

  if (!session || !userRole) {
    return <LoginPage />;
  }

  const renderPage = () => {
    // Marketing can only see campaigns & events
    if (userRole === "marketing") {
      return <SpecialTasksPage />;
    }

    switch (currentPage) {
      case "printers": return <PrintersPage />;
      case "notebooks": return <NotebooksPage />;
      case "monitors": return <MonitoresPage />;
      case "catalog": return <CatalogPage />;
      case "orders": return <OrdersPage />;
      case "movements": return <MovementsPage />;
      case "personal": return <PersonalPage />;
      case "reports": return <ReportsPage />;
      case "datalive": return <DataliveTVPage />;
      case "notes": return <NotesPage />;
      case "databases": return <DatabasesPage />;
      case "office-tickets": return <OfficeTicketsPage />;
      case "objectives": return <ObjectivesPage />;
      case "special-tasks": return <SpecialTasksPage />;
      case "prices": return <PricesPage />;
      case "guardias":
      default:
        return <GuardiasPage />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <main className="flex-1 overflow-auto bg-background/50">
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
