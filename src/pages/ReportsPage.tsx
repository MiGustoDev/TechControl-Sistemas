import { Download, TriangleAlert as AlertTriangle, Package, ShoppingCart, Printer, Laptop, ArrowLeftRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConsumableUnits } from "@/components/shared/ConsumableUnits";
import { PrinterSectorBanner } from "@/components/shared/PrinterSectorBanner";
import { getTonerMinUnits, getImageUnitMinUnits, isTonerLow, isImageUnitLow, getPrinterStatusBadges } from "@/lib/utils-app";
import {
  categoryLabel,
  itemStatusLabel,
  itemStatusColor,
  orderStatusLabel,
  orderStatusColor,
  printerStatusLabel,
  notebookStatusLabel,
  notebookStatusColor,
  movementTypeLabel,
  movementTypeColor,
  formatDate,
  formatDateTime,
} from "@/lib/utils-app";

function downloadCSV(filename: string, headers: string[], rows: (string | number | undefined)[]) {
  const csvContent = [
    headers.join(","),
    ...rows,
  ].join("\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const { stockItems, printers, notebooks, orders, movements } = useApp();

  // Stock by category
  const stockByCategory = Object.entries(
    stockItems.reduce<Record<string, { total: number; low: number; out: number }>>((acc, item) => {
      const cat = categoryLabel(item.category);
      if (!acc[cat]) acc[cat] = { total: 0, low: 0, out: 0 };
      acc[cat].total += 1;
      if (item.status === "low") acc[cat].low += 1;
      if (item.status === "out") acc[cat].out += 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1].total - a[1].total);

  const lowStockItems = stockItems.filter((i) => i.status === "low" || i.status === "out")
    .sort((a, b) => a.currentStock - b.currentStock);

  const criticalPrinters = printers.filter((p) => p.status !== "ok" && p.status !== "offline");

  const notebooksByUser = notebooks
    .filter((n) => n.currentAssignment)
    .sort((a, b) => (a.currentAssignment?.area ?? "").localeCompare(b.currentAssignment?.area ?? ""));

  const recentMovements = movements.slice(0, 20);

  const ordersByStatus = Object.entries(
    orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {})
  );

  // CSV Exports
  const exportLowStock = () => {
    const headers = ["Nombre", "Código", "Categoría", "Stock Actual", "Stock Mínimo", "Ubicación", "Estado"];
    const rows = lowStockItems.map((i) =>
      `"${i.name}","${i.internalCode}","${categoryLabel(i.category)}",${i.currentStock},${i.minStock},"${i.location}","${itemStatusLabel(i.status)}"`
    );
    downloadCSV("stock_bajo.csv", headers, rows);
  };

  const exportPrinters = () => {
    const headers = ["Nombre", "Marca", "Modelo", "Sucursal", "Sector", "Estado", "Toners (u)", "Unidad Imagen (u)"];
    const rows = printers.map((p) =>
      `"${p.name}","${p.brand}","${p.model}","${p.branch}","${p.sector}","${printerStatusLabel(p.status)}",${p.tonerUnits},${p.imageUnitUnits}`
    );
    downloadCSV("impresoras.csv", headers, rows);
  };

  const exportNotebooks = () => {
    const headers = ["Código", "Marca", "Modelo", "Estado", "Usuario", "Área", "Fecha Asignación"];
    const rows = notebooks.map((n) =>
      `"${n.internalCode}","${n.brand}","${n.model}","${notebookStatusLabel(n.status)}","${n.currentAssignment?.userName ?? ""}","${n.currentAssignment?.area ?? ""}","${n.currentAssignment ? formatDate(n.currentAssignment.assignedAt) : ""}"`
    );
    downloadCSV("equipos.csv", headers, rows);
  };

  const exportOrders = () => {
    const headers = ["Ítem", "Categoría", "Cantidad", "Prioridad", "Estado", "Solicitante", "Fecha"];
    const rows = orders.map((o) =>
      `"${o.itemName}","${categoryLabel(o.category)}",${o.quantity},"${o.priority}","${orderStatusLabel(o.status)}","${o.requestedBy}","${formatDateTime(o.requestedAt)}"`
    );
    downloadCSV("pedidos.csv", headers, rows);
  };

  const exportMovements = () => {
    const headers = ["Fecha", "Tipo", "Ítem", "Categoría", "Cantidad", "Motivo", "Usuario"];
    const rows = movements.map((m) =>
      `"${formatDateTime(m.date)}","${movementTypeLabel(m.type)}","${m.itemName}","${categoryLabel(m.itemCategory)}",${m.quantity ?? ""},"${m.reason}","${m.user}"`
    );
    downloadCSV("movimientos.csv", headers, rows);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
          <p className="text-sm text-muted-foreground">Análisis y exportación de datos del inventario</p>
        </div>
      </div>

      {/* Export buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={exportLowStock}>
          <Download className="size-3.5" />
          Stock bajo (CSV)
        </Button>
        <Button variant="outline" size="sm" onClick={exportPrinters}>
          <Download className="size-3.5" />
          Impresoras (CSV)
        </Button>
        <Button variant="outline" size="sm" onClick={exportNotebooks}>
          <Download className="size-3.5" />
          Equipos (CSV)
        </Button>
        <Button variant="outline" size="sm" onClick={exportOrders}>
          <Download className="size-3.5" />
          Pedidos (CSV)
        </Button>
        <Button variant="outline" size="sm" onClick={exportMovements}>
          <Download className="size-3.5" />
          Movimientos (CSV)
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stock by category */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Stock por categoría</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Stock bajo</TableHead>
                  <TableHead className="text-center">Sin stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockByCategory.map(([cat, data]) => (
                  <TableRow key={cat}>
                    <TableCell className="font-medium">{cat}</TableCell>
                    <TableCell className="text-center">{data.total}</TableCell>
                    <TableCell className="text-center">
                      {data.low > 0 ? (
                        <span className="text-amber-600 font-semibold">{data.low}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {data.out > 0 ? (
                        <span className="text-rose-600 font-semibold">{data.out}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Orders by status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Pedidos por estado</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ordersByStatus.map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <StatusBadge
                    label={orderStatusLabel(status as any)}
                    colorClass={orderStatusColor(status as any)}
                  />
                  <div className="flex items-center gap-3">
                    <div className="h-2 overflow-hidden rounded-full bg-muted" style={{ width: "120px" }}>
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(count / orders.length) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-semibold">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Critical printers */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Printer className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Impresoras con consumibles críticos</CardTitle>
            </div>
            <CardDescription>{criticalPrinters.length} impresoras requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            {criticalPrinters.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todas las impresoras están en buen estado.</p>
            ) : (
              <div className="space-y-4">
                {criticalPrinters.map((p) => (
                  <div key={p.id} className="space-y-2 rounded-lg border p-2">
                    <PrinterSectorBanner sector={p.sector} branch={p.branch} size="compact" />
                    <div className="flex items-center justify-between gap-2 px-1">
                      <p className="font-medium text-sm">{p.name}</p>
                      <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                        {getPrinterStatusBadges(p).map((badge, idx) => (
                          <StatusBadge key={idx} label={badge.label} colorClass={badge.colorClass} />
                        ))}
                      </div>
                    </div>
                    {isTonerLow(p) && (
                      <ConsumableUnits count={p.tonerUnits} min={getTonerMinUnits(p)} label="Toner" />
                    )}
                    {isImageUnitLow(p) && (
                      <ConsumableUnits count={p.imageUnitUnits} min={getImageUnitMinUnits(p)} label="Unidad de imagen" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notebooks by user/area */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Laptop className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Equipos asignados por área</CardTitle>
            </div>
            <CardDescription>{notebooksByUser.length} equipos con asignación activa</CardDescription>
          </CardHeader>
          <CardContent>
            {notebooksByUser.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin asignaciones activas.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notebooksByUser.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-mono text-xs">{n.internalCode}</TableCell>
                      <TableCell className="text-sm">{n.currentAssignment?.userName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{n.currentAssignment?.area}</TableCell>
                      <TableCell>
                        <StatusBadge
                          label={notebookStatusLabel(n.status)}
                          colorClass={notebookStatusColor(n.status)}
                          className="text-[11px]"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Low stock items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-500" />
                <CardTitle className="text-base">Ítems con stock bajo o sin stock</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={exportLowStock}>
                <Download className="size-3.5" />
                Exportar
              </Button>
            </div>
            <CardDescription>{lowStockItems.length} ítems requieren reposición</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay ítems con stock crítico.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-center">Stock actual</TableHead>
                    <TableHead className="text-center">Stock mínimo</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item) => (
                    <TableRow key={item.id} className={item.status === "out" ? "bg-rose-100/50 dark:bg-rose-950/20" : "bg-amber-100/50 dark:bg-amber-950/20"}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{item.internalCode}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{categoryLabel(item.category)}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${item.currentStock === 0 ? "text-rose-800" : "text-amber-800"}`}>
                          {item.currentStock}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">{item.minStock}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.location}</TableCell>
                      <TableCell>
                        <StatusBadge label={itemStatusLabel(item.status)} colorClass={itemStatusColor(item.status)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent movements */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">Historial de movimientos recientes</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={exportMovements}>
                <Download className="size-3.5" />
                Exportar todo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ítem</TableHead>
                  <TableHead>Cant.</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMovements.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(mov.date)}</TableCell>
                    <TableCell>
                      <StatusBadge label={movementTypeLabel(mov.type)} colorClass={movementTypeColor(mov.type)} />
                    </TableCell>
                    <TableCell className="font-medium text-sm">{mov.itemName}</TableCell>
                    <TableCell className="text-center">{mov.quantity ?? "—"}</TableCell>
                    <TableCell className="max-w-48 text-sm text-muted-foreground truncate">{mov.reason}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{mov.user}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
