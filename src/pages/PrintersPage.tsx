import { useState } from "react";
import { Plus, Search, Printer, Cpu, Calendar, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Wrench, WifiOff, Pencil as Edit, Trash2, Save, Minus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConsumableUnits } from "@/components/shared/ConsumableUnits";
import { PrinterSectorBanner } from "@/components/shared/PrinterSectorBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  formatDate,
  getTonerMinUnits,
  getImageUnitMinUnits,
  getSectorAccent,
  DEFAULT_CONSUMABLE_MIN_UNITS,
  getPrinterStatusBadges,
  getEffectivePrinterBranch,
} from "@/lib/utils-app";
import type { Printer as PrinterType, PrinterStatus } from "@/types";
import { toast } from "sonner";

function PrinterStatusIcon({ status }: { status: PrinterStatus }) {
  if (status === "ok") return <CheckCircle className="size-4 text-emerald-500" />;
  if (status === "maintenance") return <Wrench className="size-4 text-rose-500" />;
  if (status === "offline") return <WifiOff className="size-4 text-slate-400" />;
  if (status === "toner-out" || status === "image-unit-out") return <AlertTriangle className="size-4 text-rose-500" />;
  return <AlertTriangle className="size-4 text-amber-500" />;
}

interface PrinterCardProps {
  printer: PrinterType;
  onEdit: (p: PrinterType) => void;
  onDelete: (id: string) => void;
  onAdjustUnits: (id: string, field: "tonerUnits" | "imageUnitUnits", delta: number) => void;
}

function UnitStepper({
  value,
  min,
  onChange,
}: {
  value: number;
  min: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        disabled={value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        aria-label="Quitar una unidad"
      >
        <Minus className="size-3" />
      </Button>
      <span className="min-w-[4.5rem] text-center text-sm font-semibold tabular-nums">{value}</span>
      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        onClick={() => onChange(value + 1)}
        aria-label="Agregar una unidad"
      >
        <Plus className="size-3" />
      </Button>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap">mín. {min}</span>
    </div>
  );
}

function PrinterCard({ printer, onEdit, onDelete, onAdjustUnits }: PrinterCardProps) {
  const tonerMin = getTonerMinUnits(printer);
  const imageMin = getImageUnitMinUnits(printer);

  return (
    <Card
      className="flex flex-col overflow-hidden p-0 transition-shadow hover:shadow-md border border-border"
    >
      <PrinterSectorBanner sector={printer.sector} branch={printer.branch} size="card" />

      <CardHeader className="pb-3 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
              <PrinterStatusIcon status={printer.status} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold leading-tight truncate">{printer.name}</h3>
              {printer.name.toLowerCase() !== `${printer.brand} ${printer.model}`.toLowerCase() && (
                <p className="text-xs text-muted-foreground truncate">{printer.brand} {printer.model}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon-xs" onClick={() => onEdit(printer)}>
              <Edit className="size-3" />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={() => onDelete(printer.id)}>
              <Trash2 className="size-3 text-rose-400" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 px-6 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {getPrinterStatusBadges(printer).map((badge, idx) => (
              <StatusBadge key={idx} label={badge.label} colorClass={badge.colorClass} />
            ))}
          </div>
          {printer.serialNumber && (
            <span className="text-xs text-muted-foreground">S/N: {printer.serialNumber}</span>
          )}
        </div>

        {printer.ipAddress && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Cpu className="size-3" />
            <span>{printer.ipAddress}</span>
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wide">Toner</span>
              <span className="text-xs font-semibold text-foreground bg-secondary/80 dark:bg-secondary/40 px-2 py-0.5 rounded border border-border/50 shadow-sm max-w-[70%] truncate">
                {printer.tonerModel}
              </span>
            </div>
            <ConsumableUnits count={printer.tonerUnits} min={tonerMin} />
            <UnitStepper
              value={printer.tonerUnits}
              min={tonerMin}
              onChange={(next) => onAdjustUnits(printer.id, "tonerUnits", next - printer.tonerUnits)}
            />
          </div>
          {printer.imageUnitModel !== "N/A" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-muted-foreground text-xs font-bold uppercase tracking-wide">Unidad de imagen</span>
                <span className="text-xs font-semibold text-foreground bg-secondary/80 dark:bg-secondary/40 px-2 py-0.5 rounded border border-border/50 shadow-sm max-w-[70%] truncate">
                  {printer.imageUnitModel}
                </span>
              </div>
              <ConsumableUnits count={printer.imageUnitUnits} min={imageMin} />
              <UnitStepper
                value={printer.imageUnitUnits}
                min={imageMin}
                onChange={(next) =>
                  onAdjustUnits(printer.id, "imageUnitUnits", next - printer.imageUnitUnits)
                }
              />
            </div>
          )}
        </div>

        {printer.lastTonerChange && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            <span>Último cambio toner: {formatDate(printer.lastTonerChange)}</span>
          </div>
        )}

        {printer.notes && (
          <div className="rounded-md bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
            {printer.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const defaultForm = {
  name: "",
  code: "",
  brand: "",
  model: "",
  branch: "",
  sector: "",
  status: "ok" as PrinterStatus,
  tonerModel: "",
  tonerUnits: 2,
  tonerMinUnits: DEFAULT_CONSUMABLE_MIN_UNITS,
  imageUnitModel: "N/A",
  imageUnitUnits: 0,
  imageUnitMinUnits: DEFAULT_CONSUMABLE_MIN_UNITS,
  lastTonerChange: "",
  lastImageUnitChange: "",
  ipAddress: "",
  serialNumber: "",
  notes: "",
};

export function PrintersPage() {
  const { printers, addPrinter, updatePrinter, deletePrinter } = useApp();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterSector, setFilterSector] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterType | null>(null);
  const [form, setForm] = useState(defaultForm);

  const branches = Array.from(new Set(printers.map((p) => p.branch).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "es")
  );
  const sectors = Array.from(new Set(printers.map((p) => p.sector?.trim() || "Sin área"))).sort((a, b) =>
    a.localeCompare(b, "es")
  );

  const filtered = printers
    .filter((p) => {
      const area = p.sector?.trim() || "Sin área";
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.model.toLowerCase().includes(search.toLowerCase()) ||
        area.toLowerCase().includes(search.toLowerCase()) ||
        p.branch.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === "all" ||
        getPrinterStatusBadges(p).some((badge) => badge.statusKey === filterStatus);
      const matchBranch = filterBranch === "all" || p.branch === filterBranch;
      const matchSector = filterSector === "all" || area === filterSector;
      return matchSearch && matchStatus && matchBranch && matchSector;
    })
    .sort(
      (a, b) =>
        (a.sector?.trim() || "Sin área").localeCompare(b.sector?.trim() || "Sin área", "es") ||
        a.branch.localeCompare(b.branch, "es") ||
        a.name.localeCompare(b.name, "es")
    );

  const sectorCounts = sectors.reduce<Record<string, number>>((acc, s) => {
    acc[s] = printers.filter((p) => (p.sector?.trim() || "Sin área") === s).length;
    return acc;
  }, {});

  const stats = {
    ok: printers.filter((p) => p.status === "ok").length,
    alert: printers.filter((p) => p.status !== "ok" && p.status !== "offline").length,
    maintenance: printers.filter((p) => p.status === "maintenance").length,
    offline: printers.filter((p) => p.status === "offline").length,
  };

  const openCreate = () => {
    setEditingPrinter(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (p: PrinterType) => {
    setEditingPrinter(p);
    setForm({
      name: p.name,
      code: p.code,
      brand: p.brand,
      model: p.model,
      branch: p.branch,
      sector: p.sector,
      status: p.status,
      tonerModel: p.tonerModel,
      tonerUnits: p.tonerUnits,
      tonerMinUnits: getTonerMinUnits(p),
      imageUnitModel: p.imageUnitModel,
      imageUnitUnits: p.imageUnitUnits,
      imageUnitMinUnits: getImageUnitMinUnits(p),
      lastTonerChange: p.lastTonerChange ?? "",
      lastImageUnitChange: p.lastImageUnitChange ?? "",
      ipAddress: p.ipAddress ?? "",
      serialNumber: p.serialNumber ?? "",
      notes: p.notes ?? "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deletePrinter(id);
    toast.success("Impresora eliminada");
  };

  const handleAdjustUnits = (
    id: string,
    field: "tonerUnits" | "imageUnitUnits",
    delta: number
  ) => {
    const printer = printers.find((p) => p.id === id);
    if (!printer || delta === 0) return;
    const current = printer[field];
    const next = Math.max(0, current + delta);
    if (next === current) return;
    updatePrinter(id, { [field]: next });
    toast.success("Stock actualizado");
  };

  const handleSave = () => {
    if (!form.name || !form.brand || !form.model) {
      toast.error("Completá los campos obligatorios");
      return;
    }
    const payload = {
      ...form,
      branch: getEffectivePrinterBranch(form.sector),
      tonerUnits: Math.max(0, form.tonerUnits),
      imageUnitUnits: Math.max(0, form.imageUnitUnits),
      tonerMinUnits: Math.max(0, form.tonerMinUnits),
      imageUnitMinUnits: Math.max(0, form.imageUnitMinUnits),
    };
    if (editingPrinter) {
      updatePrinter(editingPrinter.id, payload);
      toast.success("Impresora actualizada");
    } else {
      addPrinter({ ...payload, code: form.code || form.name });
      toast.success("Impresora creada");
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Impresoras</h1>
          <p className="text-sm text-muted-foreground">
            {printers.length} impresoras registradas · stock por unidades físicas
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "OK", value: stats.ok, color: "text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/20" },
          { label: "Con alerta", value: stats.alert, color: "text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/20" },
          { label: "Mantenimiento", value: stats.maintenance, color: "text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/20" },
          { label: "Sin conexión", value: stats.offline, color: "text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-500/10 border-slate-300 dark:border-slate-500/20" },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-3 rounded-xl border px-5 h-14 shadow-sm transition-all hover:shadow-md ${s.color}`}>
            <span className="text-2xl font-bold">{s.value}</span>
            <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filtro rápido por área */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Filtrar por área
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={filterSector === "all" ? "default" : "outline"}
            onClick={() => setFilterSector("all")}
          >
            Todas ({printers.length})
          </Button>
          {sectors.map((s) => {
            const accent = getSectorAccent(s);
            const active = filterSector === s;
            return (
              <Button
                key={s}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                className={!active ? accent.chip : undefined}
                onClick={() => setFilterSector(active ? "all" : s)}
              >
                {s} ({sectorCounts[s]})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-lg">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por área, sucursal, nombre o modelo..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterSector} onValueChange={setFilterSector}>
          <SelectTrigger className="w-52 font-medium">
            <SelectValue placeholder="Área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las áreas</SelectItem>
            {sectors.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="ok">OK</SelectItem>
            <SelectItem value="toner-low">Toner bajo</SelectItem>
            <SelectItem value="image-unit-low">Unidad imagen baja</SelectItem>
            <SelectItem value="toner-out">Sin stock de toner</SelectItem>
            <SelectItem value="image-unit-out">Sin stock de unidad de imagen</SelectItem>
            <SelectItem value="maintenance">Mantenimiento</SelectItem>
            <SelectItem value="offline">Sin conexión</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterBranch} onValueChange={setFilterBranch}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sucursal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las sucursales</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={openCreate} className="ml-auto">
          <Plus className="size-4" />
          Nueva impresora
        </Button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Printer}
          title="Sin impresoras"
          description="No se encontraron impresoras con los filtros aplicados."
          action={<Button onClick={openCreate}><Plus className="size-4" />Nueva impresora</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <PrinterCard
              key={p.id}
              printer={p}
              onEdit={openEdit}
              onDelete={handleDelete}
              onAdjustUnits={handleAdjustUnits}
            />
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPrinter ? "Editar impresora" : "Nueva impresora"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nombre <span className="text-red-500">*</span></Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="IMP-ADMIN-01" />
              </div>
              <div className="space-y-1.5">
                <Label>Código</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="IMP-001" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Marca <span className="text-red-500">*</span></Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="HP" />
              </div>
              <div className="space-y-1.5">
                <Label>Modelo <span className="text-red-500">*</span></Label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="LaserJet Pro M404n" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">Área / Sector</Label>
              <Input
                value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                placeholder="Ej: Administración, RRHH, Logística..."
                className="h-11 text-lg font-semibold"
              />
              {form.sector.trim() && (
                <PrinterSectorBanner sector={form.sector} branch={getEffectivePrinterBranch(form.sector)} size="compact" />
              )}
              <p className="text-xs text-muted-foreground">
                Se muestra destacado en la tarjeta para ubicar la impresora rápidamente.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Sucursal</Label>
                <Input
                  value={getEffectivePrinterBranch(form.sector)}
                  disabled
                  readOnly
                  className="bg-muted text-muted-foreground font-semibold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as PrinterStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ok">OK</SelectItem>
                    <SelectItem value="toner-low">Toner bajo</SelectItem>
                    <SelectItem value="image-unit-low">Unidad imagen baja</SelectItem>
                    <SelectItem value="toner-out">Sin stock de toner</SelectItem>
                    <SelectItem value="image-unit-out">Sin stock de unidad de imagen</SelectItem>
                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                    <SelectItem value="offline">Sin conexión</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>IP</Label>
                <Input value={form.ipAddress} onChange={(e) => setForm({ ...form, ipAddress: e.target.value })} placeholder="192.168.1.100" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Número de serie</Label>
                <Input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Modelo de toner</Label>
                <Input value={form.tonerModel} onChange={(e) => setForm({ ...form, tonerModel: e.target.value })} placeholder="HP 85A" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cantidad de toners (unidades)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.tonerUnits}
                  onChange={(e) => setForm({ ...form, tonerUnits: Math.max(0, Number(e.target.value) || 0) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Stock mínimo toner (alerta)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.tonerMinUnits}
                  onChange={(e) => setForm({ ...form, tonerMinUnits: Math.max(0, Number(e.target.value) || 0) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Modelo unidad de imagen</Label>
                <Input value={form.imageUnitModel} onChange={(e) => setForm({ ...form, imageUnitModel: e.target.value })} placeholder="N/A" />
              </div>
              <div className="space-y-1.5">
                <Label>Cantidad unidades de imagen</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.imageUnitUnits}
                  disabled={form.imageUnitModel === "N/A"}
                  onChange={(e) => setForm({ ...form, imageUnitUnits: Math.max(0, Number(e.target.value) || 0) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Stock mínimo unidad imagen (alerta)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.imageUnitMinUnits}
                  disabled={form.imageUnitModel === "N/A"}
                  onChange={(e) => setForm({ ...form, imageUnitMinUnits: Math.max(0, Number(e.target.value) || 0) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Último cambio toner</Label>
                <Input type="date" value={form.lastTonerChange} onChange={(e) => setForm({ ...form, lastTonerChange: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Observaciones</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button onClick={handleSave}><Save className="size-4" />{editingPrinter ? "Guardar" : "Registrar impresora"}</Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
