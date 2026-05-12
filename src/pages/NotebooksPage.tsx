import { useState } from "react";
import { Plus, Search, Laptop, User, Cpu, HardDrive, Monitor, Pencil as Edit, Save, History, Database, Loader2 } from "lucide-react";
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
import type { Notebook, NotebookStatus } from "@/types";
import { toast } from "sonner";

interface NotebookCardProps {
  notebook: Notebook;
  onEdit: (n: Notebook) => void;
  onViewDetail: (n: Notebook) => void;
}

function NotebookCard({ notebook, onEdit, onViewDetail }: NotebookCardProps) {
  const statusColor = notebookStatusColor(notebook.status);
  const isAlert = notebook.status === "in-repair" || notebook.status === "decommissioned";
  const Icon = notebook.category === "desktop" ? Monitor : Laptop;

  return (
    <Card
      className={`flex flex-col cursor-pointer transition-shadow hover:shadow-md ${isAlert ? "border-amber-200 dark:border-amber-800" : ""}`}
      onClick={() => onViewDetail(notebook)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`flex size-9 items-center justify-center rounded-lg border ${isAlert ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30" : "bg-muted"}`}>
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold leading-tight text-sm">{notebook.internalCode}</h3>
              <p className="text-xs text-muted-foreground">{notebook.brand} {notebook.model}</p>
            </div>
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon-xs" onClick={() => onEdit(notebook)}>
              <Edit className="size-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        <StatusBadge label={notebookStatusLabel(notebook.status)} colorClass={statusColor} className="self-start" />

        {/* Assignment */}
        {notebook.currentAssignment ? (
          <div className="flex items-start gap-1.5 rounded-md bg-muted/40 px-2.5 py-2">
            <User className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{notebook.currentAssignment.userName}</p>
              <p className="text-xs text-muted-foreground">{notebook.currentAssignment.area}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="size-3" />
            <span>Sin asignar</span>
          </div>
        )}

        <Separator />

        {/* Quick Specs */}
        <div className="flex flex-col gap-1.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Cpu className="size-3 shrink-0" />
            <span className="truncate">{notebook.processor}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="size-3 shrink-0" />
            <span className="truncate">{notebook.ram}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive className="size-3 shrink-0" />
            <span className="truncate">{notebook.storage}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Loader2 className="size-3 shrink-0" />
            <span className="truncate">{notebook.os}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NotebookDetailModal({
  notebook,
  open,
  onClose,
}: {
  notebook: Notebook | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!notebook) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {notebook.category === "desktop" ? <Monitor className="size-5" /> : <Laptop className="size-5" />}
            {notebook.internalCode} - {notebook.brand} {notebook.model}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge
              label={notebookStatusLabel(notebook.status)}
              colorClass={notebookStatusColor(notebook.status)}
            />
            {notebook.physicalCondition && (
              <Badge variant="outline" className="text-xs">
                Físico: {
                  { excellent: "Excelente", good: "Bueno", fair: "Regular", poor: "Malo" }[notebook.physicalCondition]
                }
              </Badge>
            )}
            {notebook.functionalStatus && (
              <Badge variant="outline" className="text-xs">
                Funcional: {
                  { working: "Funcionando", partial: "Parcial", "not-working": "No funciona" }[notebook.functionalStatus]
                }
              </Badge>
            )}
          </div>

          {notebook.currentAssignment && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <User className="size-4" />
                Asignación actual
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Responsable:</span>{" "}
                  <span className="font-medium">{notebook.currentAssignment.userName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Área:</span>{" "}
                  <span className="font-medium">{notebook.currentAssignment.area}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Desde:</span>{" "}
                  <span className="font-medium">{formatDate(notebook.currentAssignment.assignedAt)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo:</span>{" "}
                  <span className="font-medium">
                    {notebook.currentAssignment.type === "permanent" ? "Permanente" : "Préstamo"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="mb-2 text-sm font-semibold">Especificaciones Técnicas</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {[
                ["Procesador", notebook.processor],
                ["Memoria RAM", notebook.ram],
                ["Almacenamiento", notebook.storage],
                ["Pantalla", notebook.screenSize || "N/A"],
                ["Sistema Operativo", notebook.os],
                ["Número de serie", notebook.serialNumber || "N/A"],
                ["Fecha ingreso", formatDate(notebook.entryDate)],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-1">
                  <span className="text-muted-foreground">{label}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
          
          {notebook.notes && (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <strong className="text-foreground">Observaciones:</strong> {notebook.notes}
            </div>
          )}

          {notebook.assignmentHistory && notebook.assignmentHistory.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold flex items-center gap-1.5">
                <History className="size-4" />
                Historial de movimientos
              </h4>
              <div className="space-y-2">
                {notebook.assignmentHistory.map((h, i) => (
                  <div key={i} className="flex gap-3 text-xs border-l-2 border-muted pl-3 py-0.5">
                    <span className="text-muted-foreground shrink-0">{formatDate(h.assignedAt)}</span>
                    <div>
                      <p className="font-medium">
                        {h.type === "permanent" ? "Asignación permanente" : "Préstamo"} a {h.userName}
                      </p>
                      <p className="text-muted-foreground">Área: {h.area}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-start gap-2">
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const defaultForm = {
  category: "notebook" as Notebook["category"],
  internalCode: "",
  brand: "",
  model: "",
  serialNumber: "",
  processor: "",
  ram: "",
  storage: "",
  screenSize: "",
  os: "Windows",
  status: "in-stock" as NotebookStatus,
  physicalCondition: "good" as Notebook["physicalCondition"],
  functionalStatus: "working" as Notebook["functionalStatus"],
  entryDate: new Date().toISOString().slice(0, 10),
  notes: "",
  assignedUserId: "none",
  assignmentType: "permanent" as "permanent" | "loan",
};

export function NotebooksPage() {
  const { notebooks, users, addNotebook, updateNotebook } = useApp();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);
  const [detailNotebook, setDetailNotebook] = useState<Notebook | null>(null);
  const [form, setForm] = useState(defaultForm);

  const filtered = notebooks.filter((n) => {
    const matchSearch =
      !search ||
      n.internalCode.toLowerCase().includes(search.toLowerCase()) ||
      n.brand.toLowerCase().includes(search.toLowerCase()) ||
      n.model.toLowerCase().includes(search.toLowerCase()) ||
      (n.currentAssignment?.userName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || n.status === filterStatus;
    const matchCategory = filterCategory === "all" || n.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  const statsCounts: Record<NotebookStatus, number> = {
    "in-use": notebooks.filter((n) => n.status === "in-use").length,
    loaned: notebooks.filter((n) => n.status === "loaned").length,
    "in-stock": notebooks.filter((n) => n.status === "in-stock").length,
    "in-repair": notebooks.filter((n) => n.status === "in-repair").length,
    decommissioned: notebooks.filter((n) => n.status === "decommissioned").length,
  };

  const openCreate = () => {
    setEditingNotebook(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (n: Notebook) => {
    setEditingNotebook(n);
    setForm({
      category: n.category,
      internalCode: n.internalCode,
      brand: n.brand,
      model: n.model,
      serialNumber: n.serialNumber || "",
      processor: n.processor,
      ram: n.ram,
      storage: n.storage,
      screenSize: n.screenSize || "",
      os: n.os,
      status: n.status,
      physicalCondition: n.physicalCondition,
      functionalStatus: n.functionalStatus,
      entryDate: n.entryDate,
      notes: n.notes ?? "",
      assignedUserId: n.currentAssignment?.userId ?? "none",
      assignmentType: n.currentAssignment?.type ?? "permanent",
    });
    setDialogOpen(true);
  };

  const openDetail = (n: Notebook) => {
    setDetailNotebook(n);
    setDetailOpen(true);
  };

  const handleSave = () => {
    if (!form.internalCode || !form.brand || !form.model) {
      toast.error("Completá los campos obligatorios");
      return;
    }

    const assignmentData = form.assignedUserId !== "none" ? {
      currentAssignment: {
        userName: users.find(u => u.id === form.assignedUserId)?.fullName ?? "Desconocido",
        area: users.find(u => u.id === form.assignedUserId)?.location ?? "N/A",
        assignedAt: editingNotebook?.currentAssignment?.assignedAt ?? new Date().toISOString(),
        type: form.assignmentType,
        userId: form.assignedUserId,
      }
    } : { currentAssignment: undefined };

    const finalData = { 
      ...form, 
      ...assignmentData,
      assignmentHistory: editingNotebook?.assignmentHistory ?? []
    };
    
    // Remove temporary form fields
    delete (finalData as any).assignedUserId;
    delete (finalData as any).assignmentType;

    if (editingNotebook) {
      updateNotebook(editingNotebook.id, finalData as any);
      toast.success("Equipo actualizado correctamente");
    } else {
      addNotebook(finalData as any);
      toast.success("Equipo registrado correctamente");
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipos</h1>
          <p className="text-sm text-muted-foreground">{notebooks.length} equipos registrados</p>
        </div>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-2">
        {[
          { status: "in-use" as NotebookStatus, label: "EN USO" },
          { status: "loaned" as NotebookStatus, label: "PRESTADAS" },
          { status: "in-stock" as NotebookStatus, label: "EN STOCK" },
          { status: "in-repair" as NotebookStatus, label: "EN REPARACIÓN" },
          { status: "decommissioned" as NotebookStatus, label: "DADAS DE BAJA" },
        ].map(({ status, label }) => (
          <button
            key={status}
            onClick={() => setFilterStatus(filterStatus === status ? "all" : status)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${notebookStatusColor(status)} ${
              filterStatus === status ? "ring-2 ring-primary ring-offset-2" : "opacity-80 hover:opacity-100"
            }`}
          >
            <span className="text-sm">{statsCounts[status]}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, marca, usuario, área..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="in-use">En uso</SelectItem>
            <SelectItem value="loaned">Prestada</SelectItem>
            <SelectItem value="in-stock">En stock</SelectItem>
            <SelectItem value="in-repair">En reparación</SelectItem>
            <SelectItem value="decommissioned">Dada de baja</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="notebook">Notebooks</SelectItem>
            <SelectItem value="desktop">Desktops</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={openCreate} className="ml-auto">
          <Plus className="size-4" />
          Nuevo equipo
        </Button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Laptop}
          title="Sin equipos"
          description="No se encontraron equipos con los filtros aplicados."
          action={<Button onClick={openCreate}><Plus className="size-4" />Nuevo equipo</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((n) => (
            <NotebookCard key={n.id} notebook={n} onEdit={openEdit} onViewDetail={openDetail} />
          ))}
        </div>
      )}

      {/* Detail modal */}
      <NotebookDetailModal
        notebook={detailNotebook}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      {/* Edit/create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingNotebook ? "Editar equipo" : "Nuevo equipo"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Notebook["category"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notebook">Notebook</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Código interno *</Label>
                <Input value={form.internalCode} onChange={(e) => setForm({ ...form, internalCode: e.target.value })} placeholder="NB-LEN-001" />
              </div>
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as NotebookStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-use">En uso</SelectItem>
                    <SelectItem value="loaned">Prestada</SelectItem>
                    <SelectItem value="in-stock">En stock</SelectItem>
                    <SelectItem value="in-repair">En reparación</SelectItem>
                    <SelectItem value="decommissioned">Dada de baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Marca *</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Dell" />
              </div>
              <div className="space-y-1.5">
                <Label>Modelo *</Label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Latitude 5520" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>N° de serie</Label>
                <Input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Procesador</Label>
                <Input value={form.processor} onChange={(e) => setForm({ ...form, processor: e.target.value })} placeholder="Intel Core i5-1235U" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>RAM</Label>
                <Input value={form.ram} onChange={(e) => setForm({ ...form, ram: e.target.value })} placeholder="8 GB DDR4" />
              </div>
              <div className="space-y-1.5">
                <Label>Disco</Label>
                <Input value={form.storage} onChange={(e) => setForm({ ...form, storage: e.target.value })} placeholder="256 GB SSD" />
              </div>
              <div className="space-y-1.5">
                <Label>Pantalla</Label>
                <Input value={form.screenSize} onChange={(e) => setForm({ ...form, screenSize: e.target.value })} placeholder={'15.6"'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Sistema operativo</Label>
                <Input value={form.os} onChange={(e) => setForm({ ...form, os: e.target.value })} placeholder="Windows 11 Pro" />
              </div>
              <div className="space-y-1.5">
                <Label>Fecha de ingreso</Label>
                <Input type="date" value={form.entryDate} onChange={(e) => setForm({ ...form, entryDate: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Estado físico</Label>
                <Select value={form.physicalCondition} onValueChange={(v) => setForm({ ...form, physicalCondition: v as Notebook["physicalCondition"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excelente</SelectItem>
                    <SelectItem value="good">Bueno</SelectItem>
                    <SelectItem value="fair">Regular</SelectItem>
                    <SelectItem value="poor">Malo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Estado funcional</Label>
                <Select value={form.functionalStatus} onValueChange={(v) => setForm({ ...form, functionalStatus: v as Notebook["functionalStatus"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="working">Funcionando</SelectItem>
                    <SelectItem value="partial">Parcial</SelectItem>
                    <SelectItem value="not-working">No funciona</SelectItem>
                  </SelectContent>
                </Select>
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
                  <Label>Tipo de Asignación</Label>
                  <Select 
                    disabled={(form as any).assignedUserId === "none"}
                    value={(form as any).assignmentType || "permanent"} 
                    onValueChange={(v) => setForm({ ...form, assignmentType: v } as any)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanent">Permanente</SelectItem>
                      <SelectItem value="loan">Préstamo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button onClick={handleSave}><Save className="size-4" />{editingNotebook ? "Guardar cambios" : "Registrar equipo"}</Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
