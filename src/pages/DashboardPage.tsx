import { Package, TriangleAlert as AlertTriangle, ShoppingCart, Truck, CircleCheck as CheckCircle, Laptop, Wrench, Clock, Printer, ArrowLeftRight, TrendingDown, CircleAlert as AlertCircle, Monitor, Database, Loader2 } from "lucide-react";
// ... (rest of imports)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LevelBar } from "@/components/shared/LevelBar";
import {
  formatDateTime,
  movementTypeLabel,
  movementTypeColor,
  orderStatusLabel,
  orderStatusColor,
  orderPriorityColor,
  orderPriorityLabel,
  printerStatusColor,
  printerStatusLabel,
} from "@/lib/utils-app";

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  description?: string;
  alert?: boolean;
  colorClass?: string;
  onClick?: () => void;
}

function MetricCard({ title, value, icon: Icon, description, alert, colorClass, onClick }: MetricCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${alert && value > 0 ? "border-amber-400 bg-amber-100 dark:border-amber-800 dark:bg-amber-950/20 shadow-sm" : "border-slate-300 shadow-sm"}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`flex size-9 items-center justify-center rounded-lg border shadow-sm ${colorClass ? `${colorClass} border-black/5` : "bg-slate-100 border-slate-300"}`}>
            <Icon className={`size-4 ${colorClass ? "text-foreground" : "text-slate-600"}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        {alert && value > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="size-3" />
            <span>Requiere atención</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { stockItems, printers, notebooks, orders, movements, dataliveTVs, setCurrentPage, loading, migrateAllData } = useApp();

  const totalItems = stockItems.length;
  const lowStock = stockItems.filter((i) => i.status === "low" || i.status === "out").length;
  const outStock = stockItems.filter((i) => i.status === "out").length;
  const pendingOrders = orders.filter((o) => o.status === "requested").length;
  const inProcessOrders = orders.filter((o) => o.status === "in-process" || o.status === "ordered").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const assignedNotebooks = notebooks.filter((n) => n.status === "in-use" || n.status === "loaned").length;
  const inRepairAssets = notebooks.filter((n) => n.status === "in-repair").length;
  const criticalPrinters = printers.filter(
    (p) => p.status === "toner-low" || p.status === "image-unit-low" || p.status === "maintenance"
  ).length;
  const totalTVs = dataliveTVs.length;
  const activeTVBranches = new Set(dataliveTVs.map((tv) => tv.branch)).size;

  const recentMovements = movements.slice(0, 6);
  const alertItems = stockItems.filter((i) => i.status === "low" || i.status === "out").slice(0, 5);
  const alertPrinters = printers.filter((p) => p.status !== "ok" && p.status !== "offline").slice(0, 4);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Resumen del estado del inventario IT
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right text-xs text-muted-foreground">
            <Clock className="mb-0.5 inline-block size-3" />{" "}
            {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
          </div>
          {orders.length === 0 && !loading && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={migrateAllData}
              disabled={loading}
              className="gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
            >
              {loading ? <Loader2 className="size-3 animate-spin" /> : <Database className="size-3" />}
              Migrar Datos Mockup
            </Button>
          )}
        </div>
      </div>

      {/* Critical Alerts */}
      {(outStock > 0 || criticalPrinters > 0) && (
        <div className="rounded-lg border-2 border-rose-400 bg-rose-100 p-4 shadow-sm dark:border-rose-900 dark:bg-rose-950/30">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400">
            <AlertCircle className="size-4 shrink-0" />
            <span className="font-bold text-sm">Alertas críticas</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {outStock > 0 && (
              <span className="text-sm text-rose-600 dark:text-rose-400">
                • {outStock} {outStock === 1 ? "ítem" : "ítems"} sin stock
              </span>
            )}
            {criticalPrinters > 0 && (
              <span className="text-sm text-rose-600 dark:text-rose-400">
                • {criticalPrinters} {criticalPrinters === 1 ? "impresora" : "impresoras"} requieren atención
              </span>
            )}
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total en Stock"
          value={totalItems}
          icon={Package}
          description="Ítems registrados"
          colorClass="bg-sky-100 dark:bg-sky-900"
          onClick={() => setCurrentPage("catalog")}
        />
        <MetricCard
          title="Stock Bajo / Sin Stock"
          value={lowStock}
          icon={TrendingDown}
          description={`${outStock} sin stock`}
          alert
          colorClass="bg-amber-100 dark:bg-amber-900"
          onClick={() => setCurrentPage("catalog")}
        />
        <MetricCard
          title="Pedidos Pendientes"
          value={pendingOrders}
          icon={ShoppingCart}
          description="Esperando aprobación"
          alert
          colorClass="bg-violet-100 dark:bg-violet-900"
          onClick={() => setCurrentPage("orders")}
        />
        <MetricCard
          title="Pedidos en Proceso"
          value={inProcessOrders}
          icon={Truck}
          description="En proceso / Pedido"
          colorClass="bg-amber-100 dark:bg-amber-900"
          onClick={() => setCurrentPage("orders")}
        />
        <MetricCard
          title="Pedidos Entregados"
          value={deliveredOrders}
          icon={CheckCircle}
          description="Completados"
          colorClass="bg-emerald-100 dark:bg-emerald-900"
          onClick={() => setCurrentPage("orders")}
        />
        <MetricCard
          title="Impresoras con Alerta"
          value={criticalPrinters}
          icon={Printer}
          description="Toner bajo, unid. imagen o mantenimiento"
          alert
          colorClass="bg-orange-100 dark:bg-orange-900"
          onClick={() => setCurrentPage("printers")}
        />
        <MetricCard
          title="Equipos Asignados"
          value={assignedNotebooks}
          icon={Laptop}
          description="En uso o prestadas"
          colorClass="bg-sky-100 dark:bg-sky-900"
          onClick={() => setCurrentPage("notebooks")}
        />
        <MetricCard
          title="Equipos en Reparación"
          value={inRepairAssets}
          icon={Wrench}
          description="PCs y Notebooks en servicio técnico"
          alert
          colorClass="bg-rose-200 dark:bg-rose-900"
          onClick={() => setCurrentPage("notebooks")}
        />
        <MetricCard
          title="DataliveTV Activos"
          value={totalTVs}
          icon={Monitor}
          description={`${activeTVBranches} sucursales con cartelería`}
          colorClass="bg-primary/10 dark:bg-primary/20"
          onClick={() => setCurrentPage("datalive")}
        />
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Movimientos Recientes</CardTitle>
                  <CardDescription>Últimas acciones en el inventario</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage("movements")}
                >
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {recentMovements.map((mov, idx) => (
                  <div key={mov.id}>
                    <div className="flex items-start gap-3 py-3">
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 shadow-sm">
                        <ArrowLeftRight className="size-3.5 text-slate-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium leading-snug">{mov.itemName}</p>
                            <p className="text-xs text-muted-foreground">{mov.reason}</p>
                          </div>
                          <StatusBadge
                            label={movementTypeLabel(mov.type)}
                            colorClass={movementTypeColor(mov.type)}
                            className="shrink-0"
                          />
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{mov.user}</span>
                          <span>·</span>
                          <span>{formatDateTime(mov.date)}</span>
                        </div>
                      </div>
                    </div>
                    {idx < recentMovements.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: alerts */}
        <div className="space-y-6">
          {/* Stock alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Stock Crítico</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage("catalog")}>
                  Ver catálogo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {alertItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin alertas de stock</p>
              ) : (
                <div className="space-y-2">
                  {alertItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.location}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <StatusBadge
                          label={item.currentStock === 0 ? "Sin stock" : `${item.currentStock} un.`}
                          colorClass={item.currentStock === 0 ? "text-rose-800 bg-rose-100 border-rose-300" : "text-amber-800 bg-amber-100 border-amber-300"}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Printer alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Impresoras con Alerta</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage("printers")}>
                  Ver todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {alertPrinters.length === 0 ? (
                <p className="text-sm text-muted-foreground">Todas las impresoras OK</p>
              ) : (
                <div className="space-y-3">
                  {alertPrinters.map((p) => (
                    <div key={p.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.sector} · {p.branch}</p>
                        </div>
                        <StatusBadge
                          label={printerStatusLabel(p.status)}
                          colorClass={printerStatusColor(p.status)}
                          className="shrink-0"
                        />
                      </div>
                      {p.status === "toner-low" && (
                        <LevelBar level={p.tonerLevel} label="Toner" />
                      )}
                      {p.status === "image-unit-low" && (
                        <LevelBar level={p.imageUnitLevel} label="Unidad de imagen" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Pedidos Recientes</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage("orders")}>
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{order.itemName}</p>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge
                          label={orderPriorityLabel(order.priority)}
                          colorClass={orderPriorityColor(order.priority)}
                          className="text-[10px]"
                        />
                        <span className="text-xs text-muted-foreground">x{order.quantity}</span>
                      </div>
                    </div>
                    <StatusBadge
                      label={orderStatusLabel(order.status)}
                      colorClass={orderStatusColor(order.status)}
                      className="shrink-0"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
