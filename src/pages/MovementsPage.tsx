import { useState } from "react";
import { Plus, Search, ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine, RefreshCw, CornerDownLeft, Wrench, OctagonAlert as AlertOctagon, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { EmptyState } from "@/components/shared/EmptyState";
import {
  movementTypeLabel,
  movementTypeColor,
  categoryLabel,
  formatDateTime,
} from "@/lib/utils-app";
import type { MovementType, Category } from "@/types";
import { toast } from "sonner";

const MovementIcon = ({ type }: { type: MovementType }) => {
  const icons: Record<MovementType, React.ElementType> = {
    entry: ArrowDownToLine,
    exit: ArrowUpFromLine,
    return: CornerDownLeft,
    reassignment: RefreshCw,
    loan: ArrowLeftRight,
    adjustment: ArrowLeftRight,
    decommission: AlertOctagon,
    repair: Wrench,
  };
  const Icon = icons[type] ?? ArrowLeftRight;
  return <Icon className="size-4" />;
};

const MOVEMENT_TYPES: MovementType[] = [
  "entry", "exit", "return", "reassignment", "loan", "adjustment", "decommission", "repair",
];

const CATEGORIES: Category[] = [
  "printer", "toner", "image-unit", "notebook",
  "peripheral", "cable", "accessory", "other",
];

const defaultForm = {
  type: "exit" as MovementType,
  itemName: "",
  itemCategory: "toner" as Category,
  quantity: 1,
  reason: "",
  user: "Carlos Rodríguez",
  notes: "",
};

export function MovementsPage() {
  const { movements, addMovement } = useApp();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const filtered = movements.filter((m) => {
    const matchSearch =
      !search ||
      m.itemName.toLowerCase().includes(search.toLowerCase()) ||
      m.user.toLowerCase().includes(search.toLowerCase()) ||
      m.reason.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || m.type === filterType;
    const matchCat = filterCategory === "all" || m.itemCategory === filterCategory;
    return matchSearch && matchType && matchCat;
  });

  const handleSave = () => {
    if (!form.itemName || !form.reason || !form.user) {
      toast.error("Completá los campos obligatorios");
      return;
    }
    addMovement({
      date: new Date().toISOString(),
      user: form.user,
      type: form.type,
      itemId: `item-manual-${Date.now()}`,
      itemName: form.itemName,
      itemCategory: form.itemCategory,
      quantity: form.quantity,
      reason: form.reason,
      notes: form.notes,
    });
    toast.success("Movimiento registrado");
    setDialogOpen(false);
    setForm(defaultForm);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movimientos de Stock</h1>
          <p className="text-sm text-muted-foreground">{movements.length} movimientos registrados</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Registrar movimiento
        </Button>
      </div>

      {/* Type stats */}
      <div className="flex flex-wrap gap-2">
        {MOVEMENT_TYPES.map((type) => {
          const count = movements.filter((m) => m.type === type).length;
          if (count === 0) return null;
          return (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? "all" : type)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                filterType === type ? movementTypeColor(type) : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
              }`}
            >
              <MovementIcon type={type} />
              <span>{movementTypeLabel(type)}</span>
              <span className="font-bold">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por ítem, usuario o motivo..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {MOVEMENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{movementTypeLabel(t)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{categoryLabel(c)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="Sin movimientos"
          description="No se encontraron movimientos con los filtros aplicados."
          action={<Button onClick={() => setDialogOpen(true)}><Plus className="size-4" />Registrar movimiento</Button>}
        />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ítem</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Cant.</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Usuario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((mov) => (
                <TableRow key={mov.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(mov.date)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className={`flex size-6 items-center justify-center rounded-full border ${movementTypeColor(mov.type)}`}>
                        <MovementIcon type={mov.type} />
                      </div>
                      <StatusBadge
                        label={movementTypeLabel(mov.type)}
                        colorClass={movementTypeColor(mov.type)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{mov.itemName}</span>
                    {mov.notes && (
                      <p className="text-xs text-muted-foreground">{mov.notes}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{categoryLabel(mov.itemCategory)}</Badge>
                  </TableCell>
                  <TableCell>
                    {mov.quantity !== undefined ? (
                      <span className="font-medium">{mov.quantity}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-56 text-sm text-muted-foreground">
                    <p className="truncate">{mov.reason}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{mov.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar movimiento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo de movimiento *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as MovementType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MOVEMENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{movementTypeLabel(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select value={form.itemCategory} onValueChange={(v) => setForm({ ...form, itemCategory: v as Category })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{categoryLabel(c)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Ítem *</Label>
              <Input value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} placeholder="Toner HP 85A" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cantidad</Label>
                <Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Usuario *</Label>
                <Input value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Motivo *</Label>
              <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} placeholder="Describí el motivo del movimiento..." />
            </div>
            <div className="space-y-1.5">
              <Label>Notas adicionales</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}><Save className="size-4" />Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
