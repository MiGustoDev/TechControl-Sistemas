import { useState } from "react";
import { Plus, Search, Monitor, User, Pencil as Edit, Trash2, Save, LayoutGrid, Copy, Check, Key } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { EmptyState } from "@/components/shared/EmptyState";
import { SUCURSALES } from "@/data/mock";
import type { DataliveTV } from "@/types";
import { toast } from "sonner";

interface TVBranchCardProps {
  branch: string;
  devices: DataliveTV[];
  onEdit: (tv: DataliveTV) => void;
  onDelete: (id: string) => void;
}

function TVBranchCard({ branch, devices, onEdit, onDelete }: TVBranchCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    if (devices.length === 0) return;

    // Sort devices by name (TV1, TV2, etc)
    const sortedDevices = [...devices].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );

    const text = sortedDevices.map(tv => 
      `${tv.name}:\nUsuario: ${tv.user}\nID Dispositivo: ${tv.deviceId}\nPin: ${tv.pin}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`Info de ${branch} copiada (${devices.length} dispositivos)`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="flex flex-col p-0 transition-shadow hover:shadow-md border-primary/20 bg-primary/5 overflow-hidden">
      <CardHeader className="p-4 bg-primary/10 rounded-none border-b border-primary/20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
              <Monitor className="size-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold leading-tight">{branch}</h3>
              <p className="text-xs text-muted-foreground">{devices.length} {devices.length === 1 ? 'Dispositivo' : 'Dispositivos'}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon-xs" 
            className={`transition-colors ${copied ? 'text-emerald-800 bg-emerald-100 border border-emerald-300' : 'hover:bg-primary/20 hover:text-primary'}`}
            onClick={handleCopyAll}
            title="Copiar toda la info de la sucursal"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pt-4 pb-4">
        <div className="grid grid-cols-1 gap-2">
          {devices.map((tv) => {
            const isSoon = tv.name === "Próximamente";
            return (
              <div 
                key={tv.id} 
                className={`group relative flex items-center justify-between rounded-md border border-border/40 px-3 py-2 transition-colors ${
                  isSoon 
                    ? 'bg-muted/20 opacity-60 grayscale' 
                    : 'bg-background/40 hover:border-primary/30'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase min-w-[80px]">
                    {tv.name.includes('VIDEOWALL') ? <LayoutGrid className="size-3 shrink-0" /> : <Monitor className="size-3 shrink-0" />}
                    <span className="truncate">{tv.name}</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">ID:</span>
                    <span className="font-mono font-bold text-foreground">{tv.deviceId}</span>
                  </div>
                </div>

                {!isSoon && (
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="outline" size="icon-xs" className="h-7 w-7 border-slate-300 bg-white shadow-sm hover:bg-slate-50" onClick={() => onEdit(tv)}>
                      <Edit className="size-3 text-slate-700" />
                    </Button>
                    <Button variant="outline" size="icon-xs" className="h-7 w-7 border-rose-300 bg-white shadow-sm text-rose-600 hover:bg-rose-50" onClick={() => onDelete(tv.id)}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {devices.some(tv => tv.notes) && (
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground uppercase px-1">Notas</p>
            {devices.filter(tv => tv.notes).map(tv => (
              <div key={tv.id + '-note'} className="rounded bg-muted/50 px-2 py-1 text-[10px] text-muted-foreground">
                <span className="font-bold">{tv.name}:</span> {tv.notes}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon-xs" 
      className="ml-auto hover:bg-primary/20 hover:text-primary" 
      onClick={handleCopy}
    >
      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
    </Button>
  );
}

const defaultForm = {
  branch: "Ballester",
  name: "TV1",
  user: "migusto",
  deviceId: "",
  pin: "85749621",
  notes: "",
};

export function DataliveTVPage() {
  const { dataliveTVs, addDataliveTV, updateDataliveTV, deleteDataliveTV } = useApp();
  const [search, setSearch] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTV, setEditingTV] = useState<DataliveTV | null>(null);
  const [form, setForm] = useState(defaultForm);

  const filtered = dataliveTVs.filter((tv) => {
    const matchSearch =
      !search ||
      tv.branch.toLowerCase().includes(search.toLowerCase()) ||
      tv.user.toLowerCase().includes(search.toLowerCase()) ||
      tv.deviceId.toLowerCase().includes(search.toLowerCase()) ||
      tv.name.toLowerCase().includes(search.toLowerCase());
    const matchBranch = filterBranch === "all" || tv.branch === filterBranch;
    return matchSearch && matchBranch;
  });

  // Group by branch
  const grouped = filtered.reduce((acc, tv) => {
    if (!acc[tv.branch]) acc[tv.branch] = [];
    acc[tv.branch].push(tv);
    return acc;
  }, {} as Record<string, DataliveTV[]>);

  const totalDevices = dataliveTVs.length;
  const totalBranches = new Set(dataliveTVs.map(tv => tv.branch)).size;

  const openCreate = () => {
    setEditingTV(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (tv: DataliveTV) => {
    setEditingTV(tv);
    setForm({
      branch: tv.branch,
      name: tv.name,
      user: tv.user,
      deviceId: tv.deviceId,
      pin: tv.pin,
      notes: tv.notes ?? "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteDataliveTV(id);
    toast.success("Dispositivo eliminado");
  };

  const handleSave = () => {
    if (!form.branch || !form.deviceId) {
      toast.error("Completá los campos obligatorios");
      return;
    }

    const finalData = {
      ...form,
      user: "migusto",
      pin: "85749621",
    };

    if (editingTV) {
      updateDataliveTV(editingTV.id, finalData);
      toast.success("Dispositivo actualizado");
    } else {
      addDataliveTV(finalData);
      toast.success("Dispositivo registrado");
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">DataliveTV</h1>
          <p className="text-sm text-muted-foreground">
            Credenciales de cartelería digital por sucursal
          </p>
        </div>
      </div>

      {/* General Info & Stats */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-500 border border-amber-300 shadow-sm">
            <Key className="size-3" />
            Acceso Universal para todas las TVs
          </div>
          <div className="h-px flex-1 bg-border/40" />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-4 rounded-lg border-2 border-primary/30 bg-primary/5 px-4 h-16 shadow-sm transition-all hover:bg-primary/10">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-0.5">
                <User className="size-3 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Usuario</span>
              </div>
              <span className="text-xl font-black text-primary tracking-tight leading-none">migusto</span>
            </div>
            <div className="ml-1">
              <CopyButton text="migusto" />
            </div>
          </div>
          
          <div className="flex items-center gap-4 rounded-lg border-2 border-primary/30 bg-primary/5 px-4 h-16 shadow-sm transition-all hover:bg-primary/10">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Key className="size-3 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">PIN</span>
              </div>
              <span className="text-xl font-black font-mono tracking-[0.1em] text-primary leading-none">85749621</span>
            </div>
            <div className="ml-1">
              <CopyButton text="85749621" />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-slate-100 px-5 h-16 shadow-sm">
            <span className="text-2xl font-bold text-slate-800">{totalBranches}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600">Sucursales</span>
          </div>
          
          <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-slate-100 px-5 h-16 shadow-sm">
            <span className="text-2xl font-bold text-slate-800">{totalDevices}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600">Dispositivos</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por sucursal, ID, nombre de TV..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterBranch} onValueChange={setFilterBranch}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sucursal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las sucursales</SelectItem>
            {SUCURSALES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={openCreate} className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="size-4" />
          Nuevo dispositivo
        </Button>
      </div>

      {/* Grid */}
      {Object.keys(grouped).length === 0 ? (
        <EmptyState
          icon={Monitor}
          title="Sin dispositivos"
          description="No se encontraron registros de DataliveTV con los filtros aplicados."
          action={<Button onClick={openCreate}><Plus className="size-4" />Nuevo dispositivo</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Object.entries(grouped).map(([branch, devices]) => (
            <TVBranchCard 
              key={branch} 
              branch={branch} 
              devices={devices} 
              onEdit={openEdit} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTV ? "Editar dispositivo" : "Registrar nuevo dispositivo"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Sucursal <span className="text-red-500">*</span></Label>
                <Select value={form.branch} onValueChange={(v) => setForm({ ...form, branch: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SUCURSALES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Nombre del dispositivo <span className="text-red-500">*</span></Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ej. TV1 o VIDEOWALL1" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>ID del Dispositivo <span className="text-red-500">*</span></Label>
              <Input value={form.deviceId} onChange={(e) => setForm({ ...form, deviceId: e.target.value })} placeholder="417" />
            </div>
            <div className="space-y-1.5">
              <Label>Observaciones</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Save className="size-4" />Guardar</Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
