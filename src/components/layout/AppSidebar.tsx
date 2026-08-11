import { useState, useEffect } from "react";
import { 
  Printer, Laptop, ShoppingCart, TriangleAlert as AlertTriangle, 
  Monitor, Tv, ChevronRight, Package, Clock, Users, Calendar, Database,
  Ticket, Info, Target, Sparkles
} from "lucide-react";
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
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const SHOW_OBJECTIVES = true; // Mostrar la pestaña de Objetivos posicionada sobre Guardias IT
  const { 
    currentPage, 
    setCurrentPage, 
    stockItems, 
    orders, 
    printers, 
    notebooks, 
    monitors, 
    dataliveTVs,
    guardias,
    setGuardiasViewMode,
    notes,
    officeTickets,
    databaseCredentials,
    objectives,
    specialTasks
  } = useApp();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const criticalStock = stockItems.filter((i) => i.status === "low" || i.status === "out").length;
  
  // Total counts for badges
  const totalNotebooks = notebooks.length;
  const totalPrinters = printers.length;
  const totalMonitors = monitors.length;
  const totalDataliveBranches = new Set(dataliveTVs.map(tv => tv.branch)).size;
  const totalOrders = orders.length;
  const totalGuardias = guardias.length;
  const totalNotes = notes.length;
  const totalOfficeTickets = officeTickets?.length || 0;
  const totalDatabaseCredentials = databaseCredentials?.length || 0;
  const totalActiveObjectives = objectives?.filter(o => o.status === "in-progress" || o.status === "pending").length || 0;
  const totalActiveSpecialTasks = specialTasks?.filter(o => o.status === "in-progress" || o.status === "pending").length || 0;

  const [isStockOpen, setIsStockOpen] = useState(() => {
    return ["notebooks", "printers", "monitors"].includes(currentPage);
  });

  // Auto-expand Stock when navigating to one of its subpages
  useEffect(() => {
    if (["notebooks", "printers", "monitors"].includes(currentPage)) {
      setIsStockOpen(true);
    }
  }, [currentPage]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between gap-1"} w-full`}>
          <div 
            onClick={() => handlePageChange("guardias")}
            className={`flex items-center cursor-pointer hover:bg-muted/50 p-1.5 rounded-lg transition-colors flex-1 min-w-0 ${
              isCollapsed ? "justify-center px-0" : "gap-2.5 px-2"
            } py-2`}
            title="Ir a Guardias IT"
          >
            <div className={`flex ${isCollapsed ? "size-8" : "size-9"} shrink-0 items-center justify-center rounded-lg overflow-hidden bg-white border border-border transition-all`}>
              <img src={`${import.meta.env.BASE_URL}LOGOcircular.png`} alt="Logo" className="size-full object-contain p-0.5" />
            </div>
            {!isCollapsed && (
              <div className="grid leading-tight text-left min-w-0">
                <span className="truncate text-sm font-bold text-foreground">Sistemas IT</span>
                <span className="truncate text-xs text-muted-foreground">Centro de Operaciones</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0 hover:bg-muted/50"
              onClick={(e) => {
                e.stopPropagation();
                handlePageChange("guardias");
                setGuardiasViewMode("calendar");
              }}
              title="Abrir Calendario de Guardias"
            >
              <Calendar className="size-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Objetivos del equipo */}
              {SHOW_OBJECTIVES && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={currentPage === "objectives"}
                    onClick={() => handlePageChange("objectives")}
                    tooltip="Objetivos"
                  >
                    <Target className="size-4" />
                    <span>Objetivos</span>
                  </SidebarMenuButton>
                  {!isCollapsed && totalActiveObjectives > 0 && (
                    <SidebarMenuBadge className="bg-emerald-500/15 font-bold text-emerald-700 dark:text-emerald-400">
                      {totalActiveObjectives}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              )}

              {/* Guardias IT — pantalla principal */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={currentPage === "guardias"}
                  onClick={() => handlePageChange("guardias")}
                  tooltip="Guardias IT"
                >
                  <Clock className="size-4" />
                  <span>Guardias IT</span>
                </SidebarMenuButton>
                {!isCollapsed && totalGuardias > 0 && (
                  <SidebarMenuBadge className="bg-amber-500/15 font-bold text-amber-700 dark:text-amber-400">
                    {totalGuardias}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>

              {/* Tareas Oficina */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={currentPage === "office-tickets"}
                  onClick={() => handlePageChange("office-tickets")}
                  tooltip="Tareas Oficina"
                >
                  <Ticket className="size-4" />
                  <span>Tareas Oficina</span>
                </SidebarMenuButton>
                {!isCollapsed && totalOfficeTickets > 0 && (
                  <SidebarMenuBadge className="bg-indigo-500/10 font-bold text-indigo-600 dark:text-indigo-400">
                    {totalOfficeTickets}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>

              {/* Tareas Promocionales */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={currentPage === "special-tasks"}
                  onClick={() => handlePageChange("special-tasks")}
                  tooltip="Tareas Promocionales"
                >
                  <Sparkles className="size-4 text-orange-500" />
                  <span>Tareas Promocionales</span>
                </SidebarMenuButton>
                {!isCollapsed && totalActiveSpecialTasks > 0 && (
                  <SidebarMenuBadge className="bg-orange-500/15 font-bold text-orange-700 dark:text-orange-400">
                    {totalActiveSpecialTasks}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>

              {/* Stock Collapsible */}
              <Collapsible open={isStockOpen} onOpenChange={setIsStockOpen} className="w-full">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      tooltip="Stock" 
                      isActive={["notebooks", "printers", "monitors"].includes(currentPage)}
                    >
                      <Package className="size-4 shrink-0" />
                      <span>Stock</span>
                      {!isCollapsed && (
                        <ChevronRight className={`ml-auto size-3.5 transition-transform duration-200 ${isStockOpen ? "rotate-90" : ""}`} />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 mt-0.5 space-y-0.5 border-l border-muted/50 ml-4.5">
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={currentPage === "notebooks"}
                          onClick={() => handlePageChange("notebooks")}
                          tooltip="Equipos"
                          className="h-8 text-xs"
                        >
                          <Laptop className="size-3.5" />
                          <span>Equipos</span>
                        </SidebarMenuButton>
                        {!isCollapsed && totalNotebooks > 0 && (
                          <SidebarMenuBadge className="bg-muted-foreground/10 text-[10px] font-bold text-foreground py-0 h-4">
                            {totalNotebooks}
                          </SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={currentPage === "printers"}
                          onClick={() => handlePageChange("printers")}
                          tooltip="Impresoras"
                          className="h-8 text-xs"
                        >
                          <Printer className="size-3.5" />
                          <span>Impresoras</span>
                        </SidebarMenuButton>
                        {!isCollapsed && totalPrinters > 0 && (
                          <SidebarMenuBadge className="bg-muted-foreground/10 text-[10px] font-bold text-foreground py-0 h-4">
                            {totalPrinters}
                          </SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={currentPage === "monitors"}
                          onClick={() => handlePageChange("monitors")}
                          tooltip="Monitores"
                          className="h-8 text-xs"
                        >
                          <Monitor className="size-3.5" />
                          <span>Monitores</span>
                        </SidebarMenuButton>
                        {!isCollapsed && totalMonitors > 0 && (
                          <SidebarMenuBadge className="bg-muted-foreground/10 text-[10px] font-bold text-foreground py-0 h-4">
                            {totalMonitors}
                          </SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* DataliveTV */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={currentPage === "datalive"}
                  onClick={() => handlePageChange("datalive")}
                  tooltip="Credenciales DataliveTV"
                >
                  <Tv className="size-4" />
                  <span>DataliveTV</span>
                </SidebarMenuButton>
                {!isCollapsed && totalDataliveBranches > 0 && (
                  <SidebarMenuBadge className="bg-muted-foreground/10 font-bold text-foreground">
                    {totalDataliveBranches}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>

              {/* Información */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={currentPage === "notes"}
                  onClick={() => handlePageChange("notes")}
                  tooltip="Información y Notas"
                >
                  <Info className="size-4" />
                  <span>Información</span>
                </SidebarMenuButton>
                {!isCollapsed && totalNotes > 0 && (
                  <SidebarMenuBadge className="bg-muted-foreground/10 font-bold text-foreground">
                    {totalNotes}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>

              {/* Databases */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={currentPage === "databases"}
                  onClick={() => handlePageChange("databases")}
                  tooltip="Bases de Datos"
                >
                  <Database className="size-4" />
                  <span>Databases</span>
                </SidebarMenuButton>
                {!isCollapsed && totalDatabaseCredentials > 0 && (
                  <SidebarMenuBadge className="bg-muted-foreground/10 font-bold text-foreground">
                    {totalDatabaseCredentials}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>

              {/* Pedidos a Compras */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={currentPage === "orders"}
                  onClick={() => handlePageChange("orders")}
                  tooltip="Pedidos a Compras"
                >
                  <ShoppingCart className="size-4" />
                  <span>Pedidos a Compras</span>
                </SidebarMenuButton>
                {!isCollapsed && totalOrders > 0 && (
                  <SidebarMenuBadge className="bg-muted-foreground/10 font-bold text-foreground">
                    {totalOrders}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>

              {/* Personal */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={currentPage === "personal"}
                  onClick={() => handlePageChange("personal")}
                  tooltip="Personal"
                >
                  <Users className="size-4" />
                  <span>Personal</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

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
            <div className="text-xs text-muted-foreground text-center font-medium">
              Sistemas IT Center v2.0
            </div>
          )}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
