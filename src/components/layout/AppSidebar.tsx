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
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-white border border-border">
            <img src={`${import.meta.env.BASE_URL}LOGOcircular.png`} alt="Logo" className="size-full object-contain p-0.5" />
          </div>
          <div className="grid leading-tight">
            <span className="truncate text-sm font-semibold">StockControl</span>
            <span className="truncate text-xs text-muted-foreground">Control de Inventario</span>
          </div>
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
                      <SidebarMenuBadge>{badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}

              {/* Collapsible Others - Hidden per request */}
              {/* <Collapsible defaultOpen={isOtherActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Otros">
                      <MoreHorizontal />
                      <span>Otros</span>
                      <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {otherNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        let badge: number | null = null;
                        if (item.id === "catalog") badge = criticalStock || null;

                        return (
                          <SidebarMenuSubItem key={item.id}>
                            <SidebarMenuSubButton
                              isActive={isActive}
                              onClick={() => setCurrentPage(item.id)}
                            >
                              <Icon className="size-4" />
                              <span>{item.label}</span>
                              {badge !== null && (
                                <span className="ml-auto rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                                  {badge}
                                </span>
                              )}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-2">
          {criticalStock > 0 && (
            <div className="mb-2 flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-2 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span>{criticalStock} ítems con stock bajo</span>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Sistema IT v1.0.0
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
