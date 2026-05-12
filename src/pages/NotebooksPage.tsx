import { useState } from "react";
import { Plus, Search, Laptop, User, Cpu, HardDrive, Monitor, CreditCard as Edit, Save, History, Database, Loader2 } from "lucide-react";
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
        <StatusBadge label={notebookStatusLabel(notebook.status)} colorClass={statusColor} />

        {/* Assignment */}
        {notebook.currentAssignment ? (
          <div className="flex items-start gap-1.5 rounded-md bg-muted/40 px-2.5 py-2">
            <User className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{notebook.currentAssignment.userName}</p>
              <p className="text-xs text-muted-foreground">{notebook.currentAssignment.area}</p>
              {notebook.status === "loaned" && notebook.currentAssignment.expectedReturnAt && (
                <p className="text-xs text-amber-600">
                  Vence: {formatDate(notebook.currentAssignment.expectedReturnAt)}
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

        {/* Specs */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Cpu className="size-3 shrink-0" />
            <span className="truncate">{notebook.processor}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <HardDrive className="size-3 shrink-0" />
            <span>{notebook.ram} · {notebook.storage}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Monitor className="size-3 shrink-0" />
            <span>{notebook.screenSize} · {notebook.os}</span>
          </div>
        </div>

        {notebook.notes && (
          <div className="mt-1 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground line-clamp-2">
            {notebook.notes}
          </div>
        )}
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
  const Icon = notebook.category === "desktop" ? Monitor : Laptop;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="size-5" />
            {notebook.internalCode} — {notebook.brand} {notebook.model}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Status + assignment */}
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge
              label={notebookStatusLabel(notebook.status)}
              colorClass={notebookStatusColor(notebook.status)}
            />
            {notebook.physicalCondition && (
              <Badge variant="outline" className="text-xs">
                Estado físico: {
                  { excellent: "Excelente", good: "Bueno", fair: "Regular", poor: "Malo" }[notebook.physicalCondition]
                }
              </Badge>
            )}
            {notebook.functionalStatus && (
              <Badge variant="outline" className="text-xs">
                Func.: {
                  { working: "Funcionando", partial: "Parcial", "not-working": "No funciona" }[notebook.functionalStatus]
                }
              </Badge>
            )}
          </div>

          {/* Current assignment */}
          {notebook.currentAssignment && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <User className="size-4" />
                Asignación actual
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Usuario:</span>{" "}
                  <span className="font-medium">{notebook.currentAssignment.userName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Área:</span>{" "}
                  <span className="font-medium">{notebook.currentAssignment.area}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo:</span>{" "}
                  <span className="font-medium">{notebook.currentAssignment.type === "permanent" ? "Permanente" : "Préstamo"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Desde:</span>{" "}
                  <span className="font-medium">{formatDate(notebook.currentAssignment.assignedAt)}</span>
                </div>
                {notebook.currentAssignment.expectedReturnAt && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Devolución estimada:</span>{" "}
                    <span className="font-medium text-amber-600">{formatDate(notebook.currentAssignment.expectedReturnAt)}</span>
                  </div>
                )}
                {notebook.currentAssignment.notes && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Notas:</span>{" "}
                    <span>{notebook.currentAssignment.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Specs */}
          <div>
            <h4 className="mb-2 text-sm font-semibold">Especificaciones técnicas</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {[
                ["Marca", notebook.brand],
                ["Modelo", notebook.model],
                ["N° Serie", notebook.serialNumber],
                ["Código interno", notebook.internalCode],
                ["Procesador", notebook.processor],
                ["RAM", notebook.ram],
                ["Almacenamiento", notebook.storage],
                ["Pantalla", notebook.screenSize],
                ["Sistema operativo", notebook.os],
                ["Fecha de ingreso", formatDate(notebook.entryDate)],
                notebook.lastReviewDate && ["Última revisión", formatDate(notebook.lastReviewDate)],
              ].filter((v): v is string[] => Boolean(v)).map(([label, value]) => (
                <div key={label as string} className="flex gap-1">
                  <span className="text-muted-foreground min-w-0">{label}:</span>
                  <span className="font-medium min-w-0 break-words">{value as string}</span>
                </div>
              ))}
            </div>
          </div>

          {notebook.notes && (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <strong className="text-foreground">Observaciones:</strong> {notebook.notes}
            </div>
          )}

          {/* History */}
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <History className="size-4" />
              Historial de asignaciones
            </h4>
            {notebook.assignmentHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin historial de asignaciones.</p>
            ) : (
              <div className="space-y-2">
                {[...notebook.assignmentHistory].reverse().map((asgn) => (
                  <div key={asgn.id} className="flex items-start gap-3 rounded-md bg-muted/30 px-3 py-2">
                    <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="font-medium">{asgn.userName} <span className="font-normal text-muted-foreground">— {asgn.area}</span></p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(asgn.assignedAt)}
                        {asgn.returnedAt && ` → ${formatDate(asgn.returnedAt)}`}
                        {" · "}{asgn.type === "permanent" ? "Permanente" : "Préstamo"}
                      </p>
                      {asgn.notes && <p className="text-xs text-muted-foreground">{asgn.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const defaultForm = {
  category: "notebook" as Notebook["category"],
  brand: "",
  model: "",
  serialNumber: "",
  internalCode: "",
  processor: "",
  ram: "",
  storage: "",
  screenSize: "",
  os: "",
  physicalCondition: "good" as Notebook["physicalCondition"],
  functionalStatus: "working" as Notebook["functionalStatus"],
  status: "in-stock" as NotebookStatus,
  entryDate: new Date().toISOString().slice(0, 10),
  notes: "",
  assignedUserId: "none",
  assignmentType: "permanent" as "permanent" | "loan",
};

export function NotebooksPage() {
  const { notebooks, users, addNotebook, updateNotebook, loading, migrateAllData } = useApp();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);
  const [detailNotebook, setDetailNotebook] = useState<Notebook | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [form, setForm] = useState(defaultForm);

  const filtered = notebooks.filter((n) => {
    const matchSearch =
      !search ||
      n.brand.toLowerCase().includes(search.toLowerCase()) ||
      n.model.toLowerCase().includes(search.toLowerCase()) ||
      n.internalCode.toLowerCase().includes(search.toLowerCase()) ||
      (n.currentAssignment?.userName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (n.currentAssignment?.area ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || n.status === filterStatus;
    const matchCategory = filterCategory === "all" || n.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  const stats = {
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
      brand: n.brand,
      model: n.model,
      serialNumber: n.serialNumber,
      internalCode: n.internalCode,
      processor: n.processor,
      ram: n.ram,
      storage: n.storage,
      screenSize: n.screenSize,
      os: n.os,
      physicalCondition: n.physicalCondition,
      functionalStatus: n.functionalStatus,
      status: n.status,
      entryDate: n.entryDate,
      notes: n.notes ?? "",
      assignedUserId: n.currentAssignment?.userId ?? "none",
      assignmentType: (n.currentAssignment?.type ?? "permanent") as "permanent" | "loan",
    });
    setDialogOpen(true);
  };

  const openDetail = (n: Notebook) => {
    setDetailNotebook(n);
    setDetailOpen(true);
  };

  const handleSave = () => {
    if (!form.brand || !form.model || !form.internalCode) {
      toast.error("Completá los campos obligatorios");
      return;
    }

    const assignmentData = form.assignedUserId !== "none" ? {
      currentAssignment: {
        id: editingNotebook?.currentAssignment?.id ?? Math.random().toString(36).substr(2, 9),
        notebookId: editingNotebook?.id ?? "",
        userId: form.assignedUserId,
        userName: users.find(u => u.id === form.assignedUserId)?.fullName ?? "Desconocido",
        area: users.find(u => u.id === form.assignedUserId)?.location ?? "N/A",
        assignedAt: editingNotebook?.currentAssignment?.assignedAt ?? new Date().toISOString(),
        type: form.assignmentType,
      }
    } : { currentAssignment: undefined };

    const finalData = { ...form, ...assignmentData };
    // Remove temporary form fields before saving
    delete (finalData as any).assignedUserId;
    delete (finalData as any).assignmentType;

    if (editingNotebook) {
      updateNotebook(editingNotebook.id, finalData);
      toast.success("Equipo actualizado");
    } else {
      addNotebook({ ...finalData, assignmentHistory: [] });
      toast.success("Equipo registrado");
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
        <div className="flex gap-2">
          {notebooks.length === 0 && !loading && (
            <Button 
              variant="outline" 
              onClick={migrateAllData}
              disabled={loading}
              className="gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Database className="size-4" />}
              Migrar Datos Mockup
            </Button>
          )}
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nuevo equipo
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: "in-use", label: "En uso", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" },
          { key: "loaned", label: "Prestadas", color: "bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400" },
          { key: "in-stock", label: "En stock", color: "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400" },
          { key: "in-repair", label: "En reparación", color: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" },
          { key: "decommissioned", label: "Dadas de baja", color: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400" },
        ].map((s) => (
          <div 
            key={s.key} 
            className={`flex items-center gap-2.5 rounded-full border px-1.5 py-1.5 pr-4 transition-all hover:scale-105 cursor-default ${s.color}`}
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-current/10 text-sm font-bold">
              {stats[s.key as NotebookStatus]}
            </div>
            <span className="text-xs font-bold uppercase tracking-tight">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
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
            <SelectValue placeholder="Estado" />
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}><Save className="size-4" />Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
