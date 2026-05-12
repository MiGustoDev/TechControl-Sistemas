import { useState } from "react";
import { Plus, Search, Monitor, User, CreditCard as Edit, Save, Layout } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  notebookStatusLabel,
  notebookStatusColor,
  formatDate,
} from "@/lib/utils-app";
import type { Monitor as MonitorType, NotebookStatus } from "@/types";
import { toast } from "sonner";

interface MonitorCardProps {
  monitor: MonitorType;
  onEdit: (m: MonitorType) => void;
  onViewDetail: (m: MonitorType) => void;
}

function MonitorCard({ monitor, onEdit, onViewDetail }: MonitorCardProps) {
  const statusColor = notebookStatusColor(monitor.status);
  
  return (
    <Card
      className="flex flex-col cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onViewDetail(monitor)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg border bg-muted">
              <Monitor className="size-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold leading-tight text-sm">{monitor.brand} {monitor.model}</h3>
              <p className="text-xs text-muted-foreground">{monitor.size ? `${monitor.size} · ` : ""}{monitor.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon-xs" onClick={() => onEdit(monitor)}>
              <Edit className="size-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        <StatusBadge label={notebookStatusLabel(monitor.status)} colorClass={statusColor} className="self-start" />

        {monitor.currentAssignment ? (
          <div className="flex items-start gap-1.5 rounded-md bg-muted/40 px-2.5 py-2">
            <User className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{monitor.currentAssignment.userName}</p>
              <p className="text-xs text-muted-foreground">{monitor.currentAssignment.area}</p>
              {monitor.currentAssignment.linkedComputerCode && (
                <p className="text-[10px] text-sky-600 font-mono mt-0.5">
                  PC: {monitor.currentAssignment.linkedComputerCode}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="size-3" />
            <span>Sin asignar</span>
          </div>
        )}

        <Separator />
        
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Layout className="size-3 shrink-0" />
          <span>Ingreso: {formatDate(monitor.entryDate)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function MonitorDetailModal({
  monitor,
  open,
  onClose,
}: {
  monitor: MonitorType | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!monitor) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="size-5" />
            {monitor.brand} {monitor.model}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge
              label={notebookStatusLabel(monitor.status)}
              colorClass={notebookStatusColor(monitor.status)}
            />
            {monitor.physicalCondition && (
              <Badge variant="outline" className="text-xs">
                Estado físico: {
                  { excellent: "Excelente", good: "Bueno", fair: "Regular", poor: "Malo" }[monitor.physicalCondition]
                }
              </Badge>
            )}
          </div>

          {monitor.currentAssignment && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <User className="size-4" />
                Asignación actual
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Usuario:</span>{" "}
                  <span className="font-medium">{monitor.currentAssignment.userName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Área:</span>{" "}
                  <span className="font-medium">{monitor.currentAssignment.area}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">PC Vinculada:</span>{" "}
                  <span className="font-mono text-sky-600">{monitor.currentAssignment.linkedComputerCode || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Desde:</span>{" "}
                  <span className="font-medium">{formatDate(monitor.currentAssignment.assignedAt)}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="mb-2 text-sm font-semibold">Información del Monitor</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {[
                ["Marca", monitor.brand],
                ["Modelo", monitor.model],
                ["Tamaño", monitor.size || "N/A"],
                ["Ubicación", monitor.location],
                ["Fecha de ingreso", formatDate(monitor.entryDate)],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-1">
                  <span className="text-muted-foreground">{label}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
          
          {monitor.notes && (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <strong className="text-foreground">Observaciones:</strong> {monitor.notes}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const defaultForm = {
  brand: "",
  model: "",
  size: "",
  location: "Planta MG",
  physicalCondition: "good" as MonitorType["physicalCondition"],
  status: "in-stock" as NotebookStatus,
  entryDate: new Date().toISOString().slice(0, 10),
  notes: "",
  assignedUserId: "none",
  linkedComputerCode: "",
};

export function MonitoresPage() {
  const { monitors, users, addMonitor, updateMonitor } = useApp();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<MonitorType | null>(null);
  const [detailMonitor, setDetailMonitor] = useState<MonitorType | null>(null);
  const [form, setForm] = useState(defaultForm);

  const filtered = monitors.filter((m) => {
    const matchSearch =
      !search ||
      m.brand.toLowerCase().includes(search.toLowerCase()) ||
      m.model.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase()) ||
      (m.currentAssignment?.userName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (m.currentAssignment?.linkedComputerCode ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setEditingMonitor(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (m: MonitorType) => {
    setEditingMonitor(m);
    setForm({
      brand: m.brand,
      model: m.model,
      size: m.size || "",
      location: m.location,
      physicalCondition: m.physicalCondition,
      status: m.status,
      entryDate: m.entryDate,
      notes: m.notes ?? "",
      assignedUserId: m.currentAssignment?.userId ?? "none",
      linkedComputerCode: m.currentAssignment?.linkedComputerCode ?? "",
    });
    setDialogOpen(true);
  };

  const openDetail = (m: MonitorType) => {
    setDetailMonitor(m);
    setDetailOpen(true);
  };

  const handleSave = () => {
    if (!form.brand || !form.model) {
      toast.error("Completá los campos obligatorios");
      return;
    }

    const assignmentData = form.assignedUserId !== "none" ? {
      currentAssignment: {
        userName: users.find(u => u.id === form.assignedUserId)?.fullName ?? "Desconocido",
        area: users.find(u => u.id === form.assignedUserId)?.location ?? "N/A",
        assignedAt: editingMonitor?.currentAssignment?.assignedAt ?? new Date().toISOString(),
        linkedComputerCode: form.linkedComputerCode,
        userId: form.assignedUserId, // Added to type in previous step
      }
    } : { currentAssignment: undefined };

    const finalData = { ...form, ...assignmentData };
    // Remove temporary form fields
    delete (finalData as any).assignedUserId;
    delete (finalData as any).linkedComputerCode;

    if (editingMonitor) {
      updateMonitor(editingMonitor.id, finalData);
      toast.success("Monitor actualizado");
    } else {
      addMonitor({ ...finalData, category: "monitor" });
      toast.success("Monitor registrado");
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Monitores</h1>
          <p className="text-sm text-muted-foreground">{monitors.length} monitores registrados</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nuevo monitor
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por marca, modelo, PC vinculada..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="in-use">En uso</SelectItem>
            <SelectItem value="in-stock">En stock</SelectItem>
            <SelectItem value="in-repair">En reparación</SelectItem>
            <SelectItem value="decommissioned">Dado de baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Monitor}
          title="Sin monitores"
          description="No se encontraron monitores con los filtros aplicados."
          action={<Button onClick={openCreate}><Plus className="size-4" />Nuevo monitor</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((m) => (
            <MonitorCard key={m.id} monitor={m} onEdit={openEdit} onViewDetail={openDetail} />
          ))}
        </div>
      )}

      <MonitorDetailModal
        monitor={detailMonitor}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMonitor ? "Editar monitor" : "Nuevo monitor"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Marca *</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Samsung" />
              </div>
              <div className="space-y-1.5">
                <Label>Modelo *</Label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="LF24T35" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tamaño (ej. 24")</Label>
                <Input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Ubicación</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as NotebookStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-use">En uso</SelectItem>
                    <SelectItem value="in-stock">En stock</SelectItem>
                    <SelectItem value="in-repair">En reparación</SelectItem>
                    <SelectItem value="decommissioned">Dada de baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Fecha de ingreso</Label>
                <Input type="date" value={form.entryDate} onChange={(e) => setForm({ ...form, entryDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Observaciones</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>

            <Separator />
            <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <User className="size-4" />
                Asignación de Responsable
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Usuario Responsable</Label>
                  <Select 
                    value={(form as any).assignedUserId || "none"} 
                    onValueChange={(v) => setForm({ ...form, assignedUserId: v } as any)}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccionar usuario" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>PC Vinculada (Código)</Label>
                  <Input 
                    placeholder="DSKMGARM001" 
                    disabled={(form as any).assignedUserId === "none"}
                    value={(form as any).linkedComputerCode || ""} 
                    onChange={(e) => setForm({ ...form, linkedComputerCode: e.target.value } as any)}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}><Save className="size-4" />Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
