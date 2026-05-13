import { useState } from "react";
import { Plus, Search, Mail, MapPin, Edit, Save, Trash2, Laptop, Monitor, Hash, UserCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";
import type { User as UserType } from "@/types";

export function PersonalPage() {
  const { users, notebooks, monitors, addUser, updateUser, deleteUser } = useApp();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  
  const defaultForm = {
    username: "",
    fullName: "",
    email: "",
    phone: "",
    location: "Oficinas",
    active: true,
  };
  
  const [form, setForm] = useState(defaultForm);

  const filteredUsers = users.filter((u) => 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    u.location.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingUser(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (u: UserType) => {
    setEditingUser(u);
    setForm({
      username: u.username,
      fullName: u.fullName,
      email: u.email ?? "",
      phone: u.phone ?? "",
      location: u.location,
      active: u.active,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.username || !form.fullName) {
      toast.error("Completá los campos obligatorios");
      return;
    }
    
    if (editingUser) {
      updateUser(editingUser.id, form);
      toast.success("Datos actualizados");
    } else {
      addUser(form);
      toast.success("Persona registrada");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este registro?")) {
      deleteUser(id);
      toast.success("Registro eliminado");
    }
  };

  // Helper to find equipment for a user
  const getUserEquipment = (userId: string) => {
    const userNotebooks = notebooks.filter(n => n.currentAssignment?.userId === userId);
    const userMonitors = monitors.filter(m => m.currentAssignment?.userId === userId);
    return { notebooks: userNotebooks, monitors: userMonitors };
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Personal</h1>
          <p className="text-sm text-muted-foreground">Registro central de {users.length} personas y sus activos asignados</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Registrar Persona
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, rol, área..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={UserCircle}
          title="No se encontraron registros"
          description="Intenta con otros términos de búsqueda."
          action={<Button onClick={openCreate}><Plus className="size-4" />Registrar Persona</Button>}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.map((u) => {
            const equipment = getUserEquipment(u.id);
            const totalAssets = equipment.notebooks.length + equipment.monitors.length;
            
            return (
              <Card key={u.id} className="group relative overflow-hidden transition-all hover:shadow-lg border-slate-300 shadow-sm">
                <div className={`absolute left-0 top-0 h-full w-1 ${u.active ? "bg-primary" : "bg-muted"}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate font-bold">{u.fullName}</CardTitle>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        <MapPin className="size-3" /> {u.location}
                      </p>
                    </div>
                    <Badge variant={u.active ? "default" : "secondary"} className={cn("shrink-0 text-[10px] h-5 uppercase tracking-wider font-bold shadow-sm", u.active ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-200 text-slate-700")}>
                      {u.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {u.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="size-3.5 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Hash className="size-3.5 shrink-0" />
                      <span className="font-mono">@{u.username}</span>
                    </div>
                  </div>
                  
                  <Separator className="opacity-50" />
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Equipamiento Asignado</p>
                    {totalAssets === 0 ? (
                      <p className="text-xs text-muted-foreground/60 italic">Sin activos asignados</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {equipment.notebooks.map(n => (
                          <Badge key={n.id} variant="outline" className="flex items-center gap-1 bg-sky-100 text-sky-800 border-sky-400 font-bold py-0.5 shadow-sm">
                            <Laptop className="size-3" />
                            {n.internalCode}
                          </Badge>
                        ))}
                        {equipment.monitors.map(m => (
                          <Badge key={m.id} variant="outline" className="flex items-center gap-1 bg-emerald-100 text-emerald-800 border-emerald-400 font-bold py-0.5 shadow-sm">
                            <Monitor className="size-3" />
                            {m.brand} {m.model}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 pt-2 transition-opacity">
                    <Button variant="outline" size="icon-xs" className="h-7 w-7 border-slate-300 bg-white shadow-sm hover:bg-slate-50" onClick={() => openEdit(u)} title="Editar perfil">
                      <Edit className="size-3.5 text-slate-700" />
                    </Button>
                    <Button variant="outline" size="icon-xs" className="h-7 w-7 border-rose-300 bg-white shadow-sm text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(u.id)} title="Eliminar registro">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Perfil de Personal" : "Registrar Nueva Persona"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nombre Completo *</Label>
              <Input id="fullName" placeholder="Ej. Juan Pérez" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Usuario / Rol *</Label>
              <Input id="username" placeholder="Ej. juan.perez o Community Manager" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" placeholder="email@migusto.com.ar" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Ubicación / Sector</Label>
              <Input id="location" placeholder="Ej. Planta MG - Calidad" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="active" 
                checked={form.active} 
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="active">Persona activa en la empresa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}><Save className="size-4" />Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
