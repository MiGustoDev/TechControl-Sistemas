import { useState } from "react";
import { Plus, Search, Package, TriangleAlert as AlertTriangle, CreditCard as Edit, Trash2, Save, ArrowUpDown } from "lucide-react";
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
  categoryLabel,
  itemStatusLabel,
  itemStatusColor,
} from "@/lib/utils-app";
import type { StockItem, Category, ItemStatus } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES: Category[] = [
  "printer", "toner", "image-unit", "notebook",
  "peripheral", "cable", "accessory", "other",
];

const defaultForm = {
  name: "",
  category: "toner" as Category,
  internalCode: "",
  currentStock: 0,
  minStock: 1,
  location: "",
  status: "active" as ItemStatus,
  supplier: "",
  notes: "",
};

type SortKey = "name" | "category" | "currentStock" | "status";

export function CatalogPage() {
  const { stockItems, addStockItem, updateStockItem, deleteStockItem } = useApp();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = stockItems
    .filter((i) => {
      const matchSearch =
        !search ||
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.internalCode.toLowerCase().includes(search.toLowerCase()) ||
        i.location.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === "all" || i.category === filterCategory;
      const matchStatus = filterStatus === "all" || i.status === filterStatus;
      return matchSearch && matchCat && matchStatus;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      if (sortKey === "category") cmp = a.category.localeCompare(b.category);
      if (sortKey === "currentStock") cmp = a.currentStock - b.currentStock;
      if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      return sortAsc ? cmp : -cmp;
    });

  const lowCount = stockItems.filter((i) => i.status === "low").length;
  const outCount = stockItems.filter((i) => i.status === "out").length;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (item: StockItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      internalCode: item.internalCode,
      currentStock: item.currentStock,
      minStock: item.minStock,
      location: item.location,
      status: item.status,
      supplier: item.supplier ?? "",
      notes: item.notes ?? "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteStockItem(id);
    toast.success("Ítem eliminado");
  };

  const handleSave = () => {
    if (!form.name || !form.internalCode) {
      toast.error("Completá los campos obligatorios");
      return;
    }
    // Auto-set status based on stock
    let status = form.status;
    if (form.currentStock === 0) status = "out";
    else if (form.currentStock <= form.minStock) status = "low";
    else if (status === "out" || status === "low") status = "active";

    if (editingItem) {
      updateStockItem(editingItem.id, { ...form, status });
      toast.success("Ítem actualizado");
    } else {
      addStockItem({ ...form, status });
      toast.success("Ítem creado");
    }
    setDialogOpen(false);
  };

  const SortHeader = ({ label, key }: { label: string; key: SortKey }) => (
    <button
      className="flex items-center gap-1 font-medium hover:text-foreground"
      onClick={() => toggleSort(key)}
    >
      {label}
      <ArrowUpDown className={cn("size-3", sortKey === key ? "text-primary" : "text-muted-foreground")} />
    </button>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catálogo de Stock</h1>
          <p className="text-sm text-muted-foreground">{stockItems.length} ítems registrados</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nuevo ítem
        </Button>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5 shadow-sm">
          <span className="text-2xl font-bold text-slate-800">{stockItems.length}</span>
          <span className="text-sm font-bold text-slate-600">Total ítems</span>
        </div>
        {lowCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-400 bg-amber-100 px-4 py-2.5 shadow-sm dark:border-amber-800 dark:bg-amber-950/30">
            <AlertTriangle className="size-4 text-amber-600" />
            <span className="text-2xl font-bold text-amber-800">{lowCount}</span>
            <span className="text-sm font-bold text-amber-800">Stock bajo</span>
          </div>
        )}
        {outCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-400 bg-rose-100 px-4 py-2.5 shadow-sm dark:border-rose-800 dark:bg-rose-950/30">
            <AlertTriangle className="size-4 text-rose-600" />
            <span className="text-2xl font-bold text-rose-800">{outCount}</span>
            <span className="text-sm font-bold text-rose-800">Sin stock</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, código, ubicación..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">OK</SelectItem>
            <SelectItem value="low">Stock bajo</SelectItem>
            <SelectItem value="out">Sin stock</SelectItem>
            <SelectItem value="discontinued">Descontinuado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Sin ítems"
          description="No se encontraron ítems con los filtros aplicados."
          action={<Button onClick={openCreate}><Plus className="size-4" />Nuevo ítem</Button>}
        />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><SortHeader label="Nombre" key="name" /></TableHead>
                <TableHead><SortHeader label="Categoría" key="category" /></TableHead>
                <TableHead>Código</TableHead>
                <TableHead><SortHeader label="Stock" key="currentStock" /></TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead><SortHeader label="Estado" key="status" /></TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow
                  key={item.id}
                  className={
                    item.status === "out"
                      ? "bg-rose-100/60 hover:bg-rose-100/80 dark:bg-rose-950/20"
                      : item.status === "low"
                      ? "bg-amber-100/60 hover:bg-amber-100/80 dark:bg-amber-950/20"
                      : ""
                  }
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {(item.status === "out" || item.status === "low") && (
                        <AlertTriangle className={cn("size-3.5 shrink-0", item.status === "out" ? "text-rose-500" : "text-amber-500")} />
                      )}
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground truncate max-w-48">{item.notes}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{categoryLabel(item.category)}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.internalCode}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "font-semibold",
                      item.currentStock === 0 ? "text-rose-600" : item.currentStock <= item.minStock ? "text-amber-600" : "text-foreground"
                    )}>
                      {item.currentStock}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.minStock}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.location}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.supplier ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge label={itemStatusLabel(item.status)} colorClass={itemStatusColor(item.status)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="outline" size="icon-xs" className="h-7 w-7 border-slate-300 bg-white shadow-sm hover:bg-slate-50" onClick={() => openEdit(item)}>
                        <Edit className="size-3 text-slate-700" />
                      </Button>
                      <Button variant="outline" size="icon-xs" className="h-7 w-7 border-rose-300 bg-white shadow-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar ítem" : "Nuevo ítem de stock"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Nombre *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Toner HP 85A" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Category })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{categoryLabel(c)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Código interno *</Label>
                <Input value={form.internalCode} onChange={(e) => setForm({ ...form, internalCode: e.target.value })} placeholder="TON-HP85A" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Stock actual</Label>
                <Input type="number" min={0} value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Stock mínimo</Label>
                <Input type="number" min={0} value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ItemStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="low">Stock bajo</SelectItem>
                    <SelectItem value="out">Sin stock</SelectItem>
                    <SelectItem value="discontinued">Descontinuado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ubicación</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Depósito A - Estante 3" />
              </div>
              <div className="space-y-1.5">
                <Label>Proveedor</Label>
                <Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="HP Argentina" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Observaciones</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
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
