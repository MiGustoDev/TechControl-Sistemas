import { Printer, Laptop, ShoppingCart, TriangleAlert as AlertTriangle, Monitor, Tv } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useApp } from "@/context/AppContext";

const mainNavItems = [
  { id: "notebooks", label: "Equipos", icon: Laptop },
  { id: "printers", label: "Impresoras", icon: Printer },
  { id: "monitors", label: "Monitores", icon: Monitor },
  { id: "datalive", label: "Credenciales DataliveTV", icon: Tv },
  { id: "orders", label: "Pedidos a Compras", icon: ShoppingCart },
];


export function AppSidebar() {
  const { currentPage, setCurrentPage, stockItems, orders, printers, notebooks, monitors, dataliveTVs } = useApp();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const criticalStock = stockItems.filter((i) => i.status === "low" || i.status === "out").length;
  
  // Total counts for badges
  const totalNotebooks = notebooks.length;
  const totalPrinters = printers.length;
  const totalMonitors = monitors.length;
  const totalDataliveBranches = new Set(dataliveTVs.map(tv => tv.branch)).size;
  const totalOrders = orders.length;


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className={`flex items-center ${isCollapsed ? "justify-center px-0" : "gap-2.5 px-2"} py-2`}>
          <div className={`flex ${isCollapsed ? "size-8" : "size-9"} shrink-0 items-center justify-center rounded-lg overflow-hidden bg-white border border-border transition-all`}>
            <img src={`${import.meta.env.BASE_URL}LOGOcircular.png`} alt="Logo" className="size-full object-contain p-0.5" />
          </div>
          {!isCollapsed && (
            <div className="grid leading-tight">
              <span className="truncate text-sm font-semibold">StockControl</span>
              <span className="truncate text-xs text-muted-foreground">Control de Inventario</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Main Items */}
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                let badge: number | null = null;
                
                if (item.id === "notebooks") badge = totalNotebooks;
                if (item.id === "printers") badge = totalPrinters;
                if (item.id === "monitors") badge = totalMonitors;
                if (item.id === "datalive") badge = totalDataliveBranches;
                if (item.id === "orders") badge = totalOrders;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setCurrentPage(item.id)}
                      tooltip={item.label}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {badge !== null && (
                      <SidebarMenuBadge className="bg-muted-foreground/10 font-bold text-foreground">
                        {badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-2">
          {criticalStock > 0 && (
            <div className={`mb-2 flex items-center gap-2 rounded-md border border-amber-400 bg-amber-100/80 ${isCollapsed ? "justify-center p-2" : "px-2.5 py-2"} text-[11px] font-bold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 shadow-sm`}>
              <AlertTriangle className="size-3.5 shrink-0" />
              {!isCollapsed && <span>{criticalStock} ítems con stock bajo</span>}
            </div>
          )}
          {!isCollapsed && (
            <div className="text-xs text-muted-foreground">
              Sistema IT v1.0.0
            </div>
          )}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
