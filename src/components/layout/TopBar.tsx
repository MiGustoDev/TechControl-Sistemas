import { Search, Moon, Sun } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/components/theme-provider";

const pageLabels: Record<string, string> = {
  dashboard: "Dashboard",
  printers: "Impresoras",
  notebooks: "Notebooks",
  catalog: "Catálogo de Stock",
  orders: "Pedidos a Compras",
  movements: "Movimientos",
  reports: "Reportes",
  datalive: "DataliveTV",
};

interface TopBarProps {
  search: string;
  onSearchChange: (v: string) => void;
}

export function TopBar({ search, onSearchChange }: TopBarProps) {
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
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="h-8 w-56 pl-8 text-sm"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

{/* <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="size-4" />
          {pendingOrders > 0 && (
            <Badge className="absolute -right-0.5 -top-0.5 size-4 justify-center rounded-full p-0 text-[10px]">
              {pendingOrders}
            </Badge>
          )}
        </Button> */}
      </div>
    </header>
  );
}
