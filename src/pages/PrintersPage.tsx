import { useState } from "react";
import { Plus, Search, Printer, MapPin, Cpu, Calendar, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Wrench, WifiOff, Pencil as Edit, Trash2, Save } from "lucide-react";
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
import { LevelBar } from "@/components/shared/LevelBar";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  printerStatusLabel,
  printerStatusColor,
  formatDate,
} from "@/lib/utils-app";
import type { Printer as PrinterType, PrinterStatus } from "@/types";
import { toast } from "sonner";

function PrinterStatusIcon({ status }: { status: PrinterStatus }) {
  if (status === "ok") return <CheckCircle className="size-4 text-emerald-500" />;
  if (status === "maintenance") return <Wrench className="size-4 text-rose-500" />;
  if (status === "offline") return <WifiOff className="size-4 text-slate-400" />;
  return <AlertTriangle className="size-4 text-amber-500" />;
}

interface PrinterCardProps {
  printer: PrinterType;
  onEdit: (p: PrinterType) => void;
  onDelete: (id: string) => void;
}

function PrinterCard({ printer, onEdit, onDelete }: PrinterCardProps) {
  const isAlert = printer.status !== "ok" && printer.status !== "offline";
  const statusColor = printerStatusColor(printer.status);

  return (
    <Card
      className={`flex flex-col transition-shadow hover:shadow-md ${isAlert ? "border-amber-200 dark:border-amber-800" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`flex size-9 items-center justify-center rounded-lg border ${isAlert ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30" : "bg-muted"}`}>
              <PrinterStatusIcon status={printer.status} />
            </div>
            <div>
              <h3 className="font-semibold leading-tight">{printer.name}</h3>
              <p className="text-xs text-muted-foreground">{printer.brand} {printer.model}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-xs" onClick={() => onEdit(printer)}>
              <Edit className="size-3" />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={() => onDelete(printer.id)}>
              <Trash2 className="size-3 text-rose-400" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-center justify-between">
          <StatusBadge label={printerStatusLabel(printer.status)} colorClass={statusColor} />
          {printer.serialNumber && (
            <span className="text-xs text-muted-foreground">S/N: {printer.serialNumber}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          <span>{printer.sector} · {printer.branch}</span>
        </div>

        {printer.ipAddress && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Cpu className="size-3" />
            <span>{printer.ipAddress}</span>
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Toner: {printer.tonerModel}</div>
            <LevelBar level={printer.tonerLevel} />
          </div>
          {printer.imageUnitModel !== "N/A" && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Unidad de imagen: {printer.imageUnitModel}</div>
              <LevelBar level={printer.imageUnitLevel} />
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
  tonerLevel: 100,
  imageUnitModel: "N/A",
  imageUnitLevel: 100,
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterType | null>(null);
  const [form, setForm] = useState(defaultForm);

  const branches = Array.from(new Set(printers.map((p) => p.branch)));

  const filtered = printers.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.model.toLowerCase().includes(search.toLowerCase()) ||
      p.sector.toLowerCase().includes(search.toLowerCase()) ||
      p.branch.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchBranch = filterBranch === "all" || p.branch === filterBranch;
    return matchSearch && matchStatus && matchBranch;
  });

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
      tonerLevel: p.tonerLevel,
      imageUnitModel: p.imageUnitModel,
      imageUnitLevel: p.imageUnitLevel,
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

  const handleSave = () => {
    if (!form.name || !form.brand || !form.model) {
      toast.error("Completá los campos obligatorios");
      return;
    }
    if (editingPrinter) {
      updatePrinter(editingPrinter.id, form);
      toast.success("Impresora actualizada");
    } else {
      addPrinter({ ...form, code: form.code || form.name });
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
            {printers.length} impresoras registradas
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nueva impresora
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "OK", value: stats.ok, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
          { label: "Con alerta", value: stats.alert, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20" },
          { label: "Mantenimiento", value: stats.maintenance, color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20" },
          { label: "Sin conexión", value: stats.offline, color: "text-slate-500 dark:text-slate-400 bg-slate-500/10 border-slate-500/20" },
        ].map((s) => (
          <div key={s.label} className={`flex flex-col rounded-lg border px-4 py-3 ${s.color}`}>
            <span className="text-2xl font-bold">{s.value}</span>
            <span className="text-xs font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, sector, sucursal..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="ok">OK</SelectItem>
            <SelectItem value="toner-low">Toner bajo</SelectItem>
            <SelectItem value="image-unit-low">Unidad imagen baja</SelectItem>
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
            <PrinterCard key={p.id} printer={p} onEdit={openEdit} onDelete={handleDelete} />
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
                <Label>Nombre *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="IMP-ADMIN-01" />
              </div>
              <div className="space-y-1.5">
                <Label>Código</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="IMP-001" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Marca *</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="HP" />
              </div>
              <div className="space-y-1.5">
                <Label>Modelo *</Label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="LaserJet Pro M404n" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Sucursal</Label>
                <Input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="Casa Central" />
              </div>
              <div className="space-y-1.5">
                <Label>Sector</Label>
                <Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="Administración" />
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
                <Label>Nivel de toner (%)</Label>
                <Input type="number" min={0} max={100} value={form.tonerLevel} onChange={(e) => setForm({ ...form, tonerLevel: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Modelo unidad de imagen</Label>
                <Input value={form.imageUnitModel} onChange={(e) => setForm({ ...form, imageUnitModel: e.target.value })} placeholder="N/A" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nivel unidad de imagen (%)</Label>
                <Input type="number" min={0} max={100} value={form.imageUnitLevel} onChange={(e) => setForm({ ...form, imageUnitLevel: Number(e.target.value) })} />
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
          <DialogFooter className="sm:justify-start gap-2">
            <Button onClick={handleSave}><Save className="size-4" />{editingPrinter ? "Guardar cambios" : "Registrar impresora"}</Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
