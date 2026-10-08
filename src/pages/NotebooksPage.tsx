import { useState, useRef, useEffect } from "react";
import { Plus, Search, Laptop, User, Cpu, HardDrive, Monitor, Pencil as Edit, Save, History, Database, Copy, Check, Key, FileCode, ShieldCheck, Trash2, Building2, ChevronsUpDown, FileDown, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import {
  notebookStatusLabel,
  notebookStatusColor,
  formatDate,
} from "@/lib/utils-app";
import type { Notebook, NotebookStatus } from "@/types";
import { toast } from "sonner";
import { ImportPowerShellModal } from "@/components/ImportPowerShellModal";
import { exportNotebooksPdf } from "@/lib/exportNotebooksPdf";
import { exportNotebooksExcel } from "@/lib/exportNotebooksExcel";

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  className,
  rows = 2,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.max(el.scrollHeight, 60)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        adjustHeight();
      }}
      rows={rows}
      placeholder={placeholder}
      className={cn("resize-none overflow-hidden transition-[height] duration-75", className)}
      {...props}
    />
  );
}


interface NotebookCardProps {
  notebook: Notebook;
  onEdit: (n: Notebook) => void;
  onDelete: (n: Notebook) => void;
  onViewDetail: (n: Notebook) => void;
}

function NotebookCard({ notebook, onEdit, onDelete, onViewDetail }: NotebookCardProps) {
  const statusColor = notebookStatusColor(notebook.status);
  const isAlert = notebook.status === "in-repair" || notebook.status === "decommissioned";
  const Icon = notebook.category === "desktop" ? Monitor : Laptop;

  return (
    <Card
      className="flex flex-col cursor-pointer transition-shadow hover:shadow-md min-w-0 w-full overflow-hidden"
      onClick={() => onViewDetail(notebook)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={`flex size-9 items-center justify-center rounded-lg border ${isAlert ? "border-amber-300 bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30" : "bg-muted"} shrink-0`}>
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold leading-tight text-sm truncate" title={notebook.internalCode}>{notebook.internalCode}</h3>
              <p className="text-xs text-muted-foreground truncate" title={`${notebook.brand} ${notebook.model}`}>{notebook.brand} {notebook.model}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon-xs" title="Editar" onClick={() => onEdit(notebook)}>
              <Edit className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Eliminar equipo"
              onClick={() => onDelete(notebook)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 min-w-0">
        <StatusBadge label={notebookStatusLabel(notebook.status)} colorClass={statusColor} className="self-start" />

        {/* Assignment */}
        {notebook.currentAssignment ? (
          <div className="flex items-start gap-1.5 rounded-md bg-muted/40 px-2.5 py-2 min-w-0">
            <User className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate" title={notebook.currentAssignment.userName}>{notebook.currentAssignment.userName}</p>
              <p className="text-xs text-muted-foreground truncate" title={notebook.currentAssignment.area}>{notebook.currentAssignment.area}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <User className="size-3 shrink-0" />
            <span className="truncate">Sin asignar</span>
          </div>
        )}

        <Separator />

        {/* Quick Specs */}
        <div className="flex flex-col gap-1.5 text-[11px] text-muted-foreground min-w-0">
          {notebook.serialNumber && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold text-[10px] uppercase text-muted-foreground shrink-0">S/N:</span>
              <span className="truncate font-mono font-medium text-foreground text-[10px]" title={notebook.serialNumber}>{notebook.serialNumber}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 min-w-0">
            <Cpu className="size-3 shrink-0 text-primary/70" />
            <span className="truncate" title={notebook.processor}>{notebook.processor || "Procesador N/A"}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <Database className="size-3 shrink-0 text-primary/70" />
            <span className="truncate" title={notebook.ramUsable ? `${notebook.ram} (${notebook.ramUsable})` : notebook.ram}>
              RAM: {notebook.ram}{notebook.ramUsable ? ` (${notebook.ramUsable})` : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <HardDrive className="size-3 shrink-0 text-primary/70" />
            <span className="truncate" title={notebook.storage}>{notebook.storage || "Almacenamiento N/A"}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <Monitor className="size-3 shrink-0 text-primary/70" />
            <span className="truncate" title={notebook.os}>{notebook.os || "Windows"}</span>
          </div>
          {(() => {
            const oemKey = notebook.productKeyOEM?.trim() || "";
            const instKey = notebook.productKeyInstalled?.trim() || "";
            const keysMatch = !!(oemKey && instKey && oemKey.toUpperCase() === instKey.toUpperCase());

            const badges = [];

            if (keysMatch) {
              badges.push(
                <Badge key="win-orig" variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[9px] py-0.5 px-1.5 font-medium flex items-center gap-1">
                  <Check className="size-3 text-emerald-600 stroke-[3]" />
                  Windows Original
                </Badge>
              );
            }

            if (notebook.win11Evaluation) {
              const isNoApto = notebook.win11Evaluation.toUpperCase().includes("NO APTO") || notebook.win11Evaluation.toUpperCase().includes("MENOR A 2.0");
              badges.push(
                <Badge
                  key="w11-eval"
                  variant="outline"
                  className={`text-[9px] py-0.5 px-1.5 font-medium flex items-center gap-1 max-w-full ${
                    isNoApto
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                      : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30"
                  }`}
                  title={notebook.win11Evaluation}
                >
                  <ShieldCheck className="size-2.5 shrink-0" />
                  <span className="truncate">{isNoApto ? "W11: TPM < 2.0 / No Apto" : "Win 11 Apto"}</span>
                </Badge>
              );
            }

            if (badges.length === 0) return null;

            return (
              <div className="flex flex-wrap items-center gap-1 mt-1 pt-1 border-t border-border/40">
                {badges}
              </div>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
}

function NotebookDetailModal({
  notebook,
  open,
  onClose,
  onDelete,
  onEdit,
}: {
  notebook: Notebook | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (n: Notebook) => void;
  onEdit?: (n: Notebook) => void;
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!notebook) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copiado: ${fieldName}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
            {notebook.activationStatus && (
              <Badge variant="secondary" className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="mr-1 size-3" />
                {notebook.activationStatus}
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

          {/* Claves de Windows y Licenciamiento */}
          {(notebook.productKeyOEM || notebook.productKeyInstalled || notebook.productId) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="flex items-center gap-1.5 text-sm font-semibold text-amber-800 dark:text-amber-300">
                  <Key className="size-4 text-amber-600" />
                  Licencias de Windows & PowerShell
                </h4>
                {(() => {
                  const oemKey = notebook.productKeyOEM?.trim() || "";
                  const instKey = notebook.productKeyInstalled?.trim() || "";
                  if (oemKey && instKey && oemKey.toUpperCase() === instKey.toUpperCase()) {
                    return (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs py-0.5 px-2 font-medium flex items-center gap-1">
                        <Check className="size-3.5 text-emerald-600 stroke-[3]" />
                        Windows Original
                      </Badge>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="space-y-2 text-xs">
                {notebook.productKeyOEM && (
                  <div className="flex items-center justify-between gap-2 bg-background p-2 rounded border">
                    <div>
                      <span className="font-medium text-muted-foreground block">Clave OEM BIOS / UEFI:</span>
                      <code className="font-mono text-sm font-bold">{notebook.productKeyOEM}</code>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(notebook.productKeyOEM!, "Clave OEM BIOS")}
                    >
                      {copiedField === "Clave OEM BIOS" ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                    </Button>
                  </div>
                )}

                {notebook.productKeyInstalled && (
                  <div className="flex items-center justify-between gap-2 bg-background p-2 rounded border">
                    <div>
                      <span className="font-medium text-muted-foreground block">Clave Instalada Recuperada:</span>
                      <code className="font-mono text-sm font-bold">{notebook.productKeyInstalled}</code>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(notebook.productKeyInstalled!, "Clave Instalada")}
                    >
                      {copiedField === "Clave Instalada" ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {notebook.productId && (
                    <div>
                      <span className="text-muted-foreground">Product ID:</span>{" "}
                      <span className="font-mono">{notebook.productId}</span>
                    </div>
                  )}
                  {notebook.licenseChannel && (
                    <div>
                      <span className="text-muted-foreground">Canal Licencia:</span>{" "}
                      <span>{notebook.licenseChannel}</span>
                    </div>
                  )}
                  {notebook.win11Evaluation && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Eval. Windows 11:</span>{" "}
                      <span className="font-semibold text-amber-700 dark:text-amber-400">{notebook.win11Evaluation}</span>
                    </div>
                  )}
                  {notebook.tpmInfo && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Seguridad TPM:</span>{" "}
                      <span>{notebook.tpmInfo}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="mb-2 text-sm font-semibold">Especificaciones Técnicas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {[
                ["Procesador", notebook.processor],
                ["Memoria RAM", notebook.ramUsable ? `${notebook.ram} (${notebook.ramUsable})` : notebook.ram],
                ["Almacenamiento", notebook.storage],
                ["Pantalla", notebook.screenSize || "N/A"],
                ["Sistema Operativo", notebook.os],
                ["Número de serie", notebook.serialNumber || "N/A"],
                ["UUID Equipo", notebook.uuid || "N/A"],
                ["Versión BIOS", notebook.biosVersion || "N/A"],
                ["Fecha ingreso", formatDate(notebook.entryDate)],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-wrap items-baseline gap-1 min-w-0">
                  <span className="text-muted-foreground shrink-0">{label}:</span>
                  <span className="font-medium text-foreground break-all text-xs sm:text-sm">{value}</span>
                </div>
              ))}
            </div>
            {notebook.ramModules && (
              <div className="mt-2 text-xs bg-muted/30 p-2 rounded border">
                <span className="font-semibold text-muted-foreground block mb-0.5">Módulos de Memoria RAM:</span>
                <span className="font-mono text-[11px] leading-relaxed">{notebook.ramModules}</span>
              </div>
            )}
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
        <DialogFooter className="flex flex-row items-center justify-between gap-2">
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(notebook)}
            >
              <Trash2 className="size-4 mr-1" />
              Eliminar equipo
            </Button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => { onClose(); onEdit(notebook); }}>
                <Edit className="size-4 mr-1" />
                Editar equipo
              </Button>
            )}
            <Button onClick={onClose} size="sm">Cerrar</Button>
          </div>
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
  assignedArea: "",
  assignmentType: "permanent" as "permanent" | "loan",
  productKeyOEM: "",
  productKeyInstalled: "",
  productId: "",
  activationStatus: "Activado",
  licenseChannel: "",
  win11Evaluation: "",
  uuid: "",
  biosVersion: "",
  tpmInfo: "",
  currentUserLocal: "",
  coresThreads: "",
  ramModules: "",
  ramUsable: "",
};

export function NotebooksPage() {
  const { notebooks, users, addNotebook, updateNotebook, deleteNotebook } = useApp();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterArea, setFilterArea] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);
  const [detailNotebook, setDetailNotebook] = useState<Notebook | null>(null);
  const [notebookToDelete, setNotebookToDelete] = useState<Notebook | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [userSearchFilter, setUserSearchFilter] = useState("");
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);

  const selectedUserObj = users.find((u) => u.id === (form as any).assignedUserId);

  const normalizeStr = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filteredUsers = users.filter((u) => {
    if (!userSearchFilter.trim()) return true;
    const q = normalizeStr(userSearchFilter);
    return (
      normalizeStr(u.fullName || "").includes(q) ||
      normalizeStr(u.username || "").includes(q) ||
      normalizeStr(u.location || "").includes(q)
    );
  });

  const handleDelete = (n: Notebook) => {
    setNotebookToDelete(n);
  };

  const confirmDelete = () => {
    if (!notebookToDelete) return;
    const id = notebookToDelete.id;
    const code = notebookToDelete.internalCode;
    deleteNotebook(id);
    toast.success(`Equipo ${code} eliminado correctamente.`);
    if (detailNotebook?.id === id) setDetailOpen(false);
    if (editingNotebook?.id === id) setDialogOpen(false);
    setNotebookToDelete(null);
  };

  // Get list of unique areas from users or assigned notebooks
  const availableAreas: string[] = Array.from(
    new Set(
      [
        ...users.map((u) => u.location),
        ...notebooks.map((n) => n.currentAssignment?.area),
      ].filter((area): area is string => Boolean(area && area.trim()))
    )
  ).sort();

  const filtered = notebooks.filter((n) => {
    const matchSearch =
      !search ||
      n.internalCode.toLowerCase().includes(search.toLowerCase()) ||
      n.brand.toLowerCase().includes(search.toLowerCase()) ||
      n.model.toLowerCase().includes(search.toLowerCase()) ||
      (n.currentAssignment?.userName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (n.currentAssignment?.area ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || n.status === filterStatus;
    const matchCategory = filterCategory === "all" || n.category === filterCategory;
    const matchArea =
      filterArea === "all" ||
      (n.currentAssignment?.area || "").toLowerCase() === filterArea.toLowerCase();

    return matchSearch && matchStatus && matchCategory && matchArea;
  });

  const areaCounts: Record<string, number> = {};
  availableAreas.forEach((area) => {
    areaCounts[area] = notebooks.filter(
      (n) => (n.currentAssignment?.area || "").toLowerCase() === area.toLowerCase()
    ).length;
  });

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
      assignedArea: n.currentAssignment?.area ?? "",
      assignmentType: n.currentAssignment?.type ?? "permanent",
      productKeyOEM: n.productKeyOEM || "",
      productKeyInstalled: n.productKeyInstalled || "",
      productId: n.productId || "",
      activationStatus: n.activationStatus || "Activado",
      licenseChannel: n.licenseChannel || "",
      win11Evaluation: n.win11Evaluation || "",
      uuid: n.uuid || "",
      biosVersion: n.biosVersion || "",
      tpmInfo: n.tpmInfo || "",
      currentUserLocal: n.currentUserLocal || "",
      coresThreads: n.coresThreads || "",
      ramModules: n.ramModules || "",
      ramUsable: n.ramUsable || "",
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

    let assignmentData: { currentAssignment?: any } = { currentAssignment: undefined };

    if (form.assignedUserId !== "none" || form.assignedArea) {
      const matchedUser = users.find((u) => u.id === form.assignedUserId);
      const userArea = matchedUser?.location;
      const finalArea = form.assignedArea || userArea || "Sistemas";

      assignmentData = {
        currentAssignment: {
          userName: matchedUser ? (matchedUser.fullName || matchedUser.username) : (editingNotebook?.currentAssignment?.userName || "Asignación por Área"),
          area: finalArea,
          assignedAt: editingNotebook?.currentAssignment?.assignedAt ?? new Date().toISOString(),
          type: form.assignmentType,
          userId: form.assignedUserId !== "none" ? form.assignedUserId : (editingNotebook?.currentAssignment?.userId || "unassigned"),
        },
      };
    }

    const finalData = { 
      ...(editingNotebook || {}),
      ...form, 
      ...assignmentData,
      assignmentHistory: editingNotebook?.assignmentHistory ?? []
    };
    
    // Remove temporary form fields
    delete (finalData as any).assignedUserId;
    delete (finalData as any).assignedArea;
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipos</h1>
          <p className="text-sm text-muted-foreground">{notebooks.length} equipos registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const ok = exportNotebooksPdf(filtered, {
                area: filterArea,
                status: filterStatus,
                search: search,
              });
              if (!ok) {
                toast.error("No hay equipos para exportar");
              } else {
                toast.success("Inventario de equipos exportado a PDF correctamente");
              }
            }}
            className="gap-2 border-red-500/30 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <FileDown className="size-4 text-red-600" />
            Exportar PDF
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const ok = await exportNotebooksExcel(filtered, { area: filterArea, search });
                if (!ok) toast.error("No hay equipos para exportar");
                else toast.success("Inventario exportado a Excel correctamente");
              } catch (err) {
                console.error(err);
                toast.error("Error al exportar a Excel");
              }
            }}
            className="gap-2 border-green-600/30 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30"
          >
            <FileSpreadsheet className="size-4 text-green-600" />
            Exportar Excel
          </Button>
          <Button variant="outline" onClick={() => setImportModalOpen(true)} className="gap-2 border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30">
            <FileCode className="size-4 text-emerald-600" />
            Importar PowerShell (CSV/TXT)
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="size-4" />
            Nuevo equipo
          </Button>
        </div>
      </div>

      {/* Area summary pills */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
          <Building2 className="size-3.5 text-primary" />
          Filtrar por Área / Sucursal
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterArea("all")}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              filterArea === "all"
                ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2"
                : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-xs font-bold">{notebooks.length}</span>
            TODAS LAS ÁREAS
          </button>
          {availableAreas.map((area) => {
            const isSelected = filterArea.toLowerCase() === area.toLowerCase();
            return (
              <button
                key={area}
                onClick={() => setFilterArea(isSelected ? "all" : area)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2"
                    : "bg-background hover:bg-muted/50 text-foreground border-border"
                }`}
              >
                <span className={`text-xs font-bold ${isSelected ? "text-primary-foreground" : "text-primary"}`}>
                  {areaCounts[area] || 0}
                </span>
                {area.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile button: between badges and search bar, left-aligned */}
      <Button onClick={openCreate} className="sm:hidden w-fit">
        <Plus className="size-4" />
        Nuevo equipo
      </Button>

      {/* Filters */}
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por código, marca, usuario, área..."
          className="pl-8 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterArea} onValueChange={setFilterArea}>
          <SelectTrigger className="flex-1 min-w-[150px]">
            <SelectValue placeholder="Todas las áreas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las áreas</SelectItem>
            {availableAreas.map((area) => (
              <SelectItem key={area} value={area}>
                {area} ({areaCounts[area] || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="flex-1 min-w-[150px]">
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
          <SelectTrigger className="flex-1 min-w-[150px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="notebook">Notebooks</SelectItem>
            <SelectItem value="desktop">Desktops</SelectItem>
          </SelectContent>
        </Select>

        {/* Button only visible on sm+ (desktop) */}
        <Button onClick={openCreate} className="ml-auto hidden sm:flex">
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
            <NotebookCard key={n.id} notebook={n} onEdit={openEdit} onDelete={handleDelete} onViewDetail={openDetail} />
          ))}
        </div>
      )}

      {/* Detail modal */}
      <NotebookDetailModal
        notebook={detailNotebook}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {/* Edit/create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{editingNotebook ? "Editar equipo" : "Nuevo equipo"}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-6 pt-2">
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
                <Label>Código interno <span className="text-red-500">*</span></Label>
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
                <Label>Marca <span className="text-red-500">*</span></Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Dell" />
              </div>
              <div className="space-y-1.5">
                <Label>Modelo <span className="text-red-500">*</span></Label>
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
              <AutoResizeTextarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notas u observaciones adicionales sobre el equipo..."
              />
            </div>

            <Separator />
            <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <User className="size-4" />
                Asignación de Responsable y Área
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 flex flex-col">
                  <Label>Usuario Responsable</Label>
                  <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={userPopoverOpen}
                        className="w-full justify-between font-normal"
                      >
                        <span className="truncate">
                          {selectedUserObj ? selectedUserObj.fullName : "Sin asignar"}
                        </span>
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[280px] p-2 pointer-events-auto" 
                      align="start"
                      onWheel={(e) => e.stopPropagation()}
                      onPointerDownOutside={() => {
                        // Keep open if interacting with popover content
                      }}
                    >
                      <div className="flex items-center border-b px-2 pb-2 mb-2" onClick={(e) => e.stopPropagation()}>
                        <Search className="mr-2 size-4 shrink-0 opacity-50" />
                        <Input
                          placeholder="Buscar colaborador..."
                          value={userSearchFilter}
                          onChange={(e) => setUserSearchFilter(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          className="h-8 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-xs"
                          autoFocus
                        />
                      </div>
                      <div 
                        className="max-h-[220px] overflow-y-auto space-y-1 pr-1"
                        style={{ overscrollBehavior: "contain" }}
                      >
                        <button
                          type="button"
                          className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors hover:bg-accent flex items-center justify-between ${
                            (form as any).assignedUserId === "none" ? "bg-accent font-medium" : ""
                          }`}
                          onClick={() => {
                            setForm({ ...form, assignedUserId: "none" } as any);
                            setUserPopoverOpen(false);
                            setUserSearchFilter("");
                          }}
                        >
                          <span>Sin asignar</span>
                          {(form as any).assignedUserId === "none" && <Check className="size-3 text-primary" />}
                        </button>
                        {filteredUsers.length === 0 ? (
                          <div className="p-2 text-center text-xs text-muted-foreground">
                            No se encontraron colaboradores.
                          </div>
                        ) : (
                          filteredUsers.map((u) => {
                            const isSelected = u.id === (form as any).assignedUserId;
                            return (
                              <button
                                key={u.id}
                                type="button"
                                className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors hover:bg-accent flex items-center justify-between ${
                                  isSelected ? "bg-accent font-medium text-primary text-emerald-600 dark:text-emerald-400" : ""
                                }`}
                                onClick={() => {
                                  setForm({
                                    ...form,
                                    assignedUserId: u.id,
                                    assignedArea: u.location || form.assignedArea,
                                  } as any);
                                  setUserPopoverOpen(false);
                                  setUserSearchFilter("");
                                }}
                              >
                                <div>
                                  <p className="font-medium leading-none">{u.fullName}</p>
                                  {u.location && (
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{u.location}</p>
                                  )}
                                </div>
                                {isSelected && <Check className="size-3 text-primary" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <Label>Área / Ubicación</Label>
                  <Input
                    placeholder="Ej. Sistemas, Marketing, Fábrica..."
                    value={form.assignedArea}
                    onChange={(e) => setForm({ ...form, assignedArea: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo de Asignación</Label>
                  <Select 
                    disabled={(form as any).assignedUserId === "none" && !form.assignedArea}
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
          </div>
          <DialogFooter className="flex flex-row items-center justify-between p-6 pt-2">
            {editingNotebook && (
              <Button
                variant="destructive"
                onClick={() => handleDelete(editingNotebook)}
              >
                <Trash2 className="size-4 mr-1" />
                Eliminar equipo
              </Button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Button onClick={handleSave}>
                <Save className="size-4 mr-1" />
                {editingNotebook ? "Guardar" : "Registrar equipo"}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Styled Delete Confirmation Dialog */}
      <AlertDialog open={!!notebookToDelete} onOpenChange={(open) => !open && setNotebookToDelete(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive shrink-0 mt-0.5">
                <Trash2 className="size-5" />
              </div>
              <div className="space-y-1">
                <AlertDialogTitle className="text-lg font-bold">¿Eliminar equipo?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  ¿Estás seguro de que deseás eliminar el equipo{" "}
                  <strong className="font-semibold text-foreground">{notebookToDelete?.internalCode}</strong>
                  {notebookToDelete?.brand ? ` (${notebookToDelete.brand} ${notebookToDelete.model})` : ""}?
                  Esta acción eliminará el registro de forma permanente.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 gap-2 sm:justify-end">
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium"
            >
              <Trash2 className="size-4 mr-1.5" />
              Sí, eliminar equipo
            </AlertDialogAction>
            <AlertDialogCancel className="mt-0">
              Cancelar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImportPowerShellModal open={importModalOpen} onClose={() => setImportModalOpen(false)} />
    </div>
  );
}

