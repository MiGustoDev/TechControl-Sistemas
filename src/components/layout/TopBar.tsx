import { Search, Moon, Sun } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
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
};

interface TopBarProps {}

export function TopBar({}: TopBarProps) {
  const { currentPage } = useApp();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{pageLabels[currentPage] ?? currentPage}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>
    </header>
  );
}
