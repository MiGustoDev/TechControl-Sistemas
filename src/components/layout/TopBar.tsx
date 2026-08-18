import { Moon, Sun, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/components/theme-provider";

const pageLabels: Record<string, string> = {
  printers: "Impresoras",
  notebooks: "Equipos",
  monitors: "Monitores",
  catalog: "Catálogo de Stock",
  orders: "Pedidos a Compras",
  movements: "Movimientos",
  reports: "Reportes",
  datalive: "DataliveTV",
  guardias: "Guardias IT",
  personal: "Personal",
  notes: "Información",
  databases: "Bases de Datos",
  "office-tickets": "Tareas y Tickets",
  "special-tasks": "Campañas y Eventos",
  "prices": "Lista de Precios",
};

interface TopBarProps {}

export function TopBar({}: TopBarProps) {
  const { currentPage, session, logout } = useApp();
  const { theme, setTheme } = useTheme();
  
  const userEmail = session?.user?.email || "";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{pageLabels[currentPage] ?? currentPage}</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {userEmail && (
          <span className="hidden sm:inline-block text-[11px] font-semibold text-muted-foreground bg-muted/40 border border-border/80 px-2.5 py-1 rounded-full">
            {userEmail}
          </span>
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={logout}
          className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
