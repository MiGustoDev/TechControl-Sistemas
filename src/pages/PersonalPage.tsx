import { useState } from "react";
import { Plus, Search, MapPin, Edit, Save, Trash2, Laptop, Monitor, UserCircle, Clock, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";
import type { User as UserType } from "@/types";

export function PersonalPage() {
  const { users, notebooks, monitors, guardias, addUser, updateUser, deleteUser } = useApp();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  
  const defaultForm = {
    username: "",
    fullName: "",
    email: "",
    phone: "",
    location: "Sistemas",
    role: "",
    active: true,
  };
  
  const [form, setForm] = useState(defaultForm);

  const filteredUsers = users.filter((u) => 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.role ?? "").toLowerCase().includes(search.toLowerCase()) ||
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
      role: u.role ?? "",
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
          <h1 className="text-2xl font-bold tracking-tight">Personal de Sistemas</h1>
          <p className="text-sm text-muted-foreground">Perfiles del equipo de sistemas y resumen de sus guardias operativas</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Registrar Integrante
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, rol, usuario..."
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
          action={<Button onClick={openCreate}><Plus className="size-4" />Registrar Integrante</Button>}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {filteredUsers.map((u) => {
            const equipment = getUserEquipment(u.id);
            const totalAssets = equipment.notebooks.length + equipment.monitors.length;
            
            const userGuardias = guardias.filter(g => g.userId === u.id);
            const totalHours = userGuardias.reduce((sum, g) => sum + g.hours, 0);
            const approvedHours = userGuardias.filter(g => g.status === "approved").reduce((sum, g) => sum + g.hours, 0);

            const imageUrl = u.avatarUrl ? `${import.meta.env.BASE_URL || "/"}${u.avatarUrl}` : null;
            const isBoss = u.username === "gustavo.gonzalez";
            const bannerGradient = isBoss 
              ? "from-amber-500/20 via-purple-600/10 to-transparent bg-amber-500/5" 
              : "from-sky-500/20 via-indigo-600/10 to-transparent bg-sky-500/5";

            return (
              <Card key={u.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-muted-foreground/10 bg-card/70 backdrop-blur-xs flex flex-col">
                {/* Accent Banner Header */}
                <div className={`h-20 w-full bg-gradient-to-r ${bannerGradient} relative shrink-0`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>

                {/* Profile info block */}
                <div className="px-5 pb-5 relative -mt-10 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-end justify-between">
                      {/* Avatar container */}
                      <div className="relative size-20 rounded-full border-4 border-card shadow-md overflow-hidden bg-muted group-hover:scale-105 transition-transform duration-300 shrink-0">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={u.fullName} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="avatar-fallback w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xl uppercase"
                          style={{ display: imageUrl ? 'none' : 'flex' }}
                        >
                          {u.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                      </div>
                      
                      <Badge variant={u.active ? "default" : "secondary"} className="text-[10px] uppercase tracking-wider font-semibold">
                        {u.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>

                    {/* Name, Role & Location */}
                    <div className="space-y-1">
                      <h3 className="text-base font-bold leading-tight text-foreground flex items-center gap-1.5">
                        {u.fullName}
                        {isBoss && (
                          <Award className="size-4 text-amber-500 fill-amber-500/20 shrink-0" aria-label="Líder de Sistemas" />
                        )}
                      </h3>
                      <p className="text-xs font-semibold text-primary">{u.role || "Integrante del Equipo"}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="size-3 text-muted-foreground/80" /> {u.location}
                      </p>
                    </div>

                    {/* Contact & Username grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-2.5 border-t border-b border-muted/50">
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">Usuario</span>
                        <span className="font-mono text-foreground/80 truncate block">@{u.username}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">Contacto</span>
                        <span className="text-foreground/80 truncate block" title={u.email || ""}>{u.email || "Sin email"}</span>
                      </div>
                    </div>

                    {/* Guardias statistics progress bar */}
                    <div className="bg-muted/30 dark:bg-muted/10 rounded-xl p-3 border border-muted-foreground/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3.5 text-amber-500" /> Guardias Realizadas
                        </span>
                        <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 font-mono">{totalHours.toFixed(1)} hs</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Aprobadas por Jefe:</span>
                        <span className="font-semibold text-foreground">{approvedHours.toFixed(1)} hs</span>
                      </div>
                      <div className="w-full bg-muted-foreground/10 rounded-full h-1 overflow-hidden">
                        <div 
                          className="bg-amber-500 h-1 rounded-full transition-all duration-500" 
                          style={{ width: `${totalHours > 0 ? (approvedHours / totalHours) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Assigned equipment specs */}
                    <div className="space-y-2 pt-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Equipamiento Asignado</p>
                      {totalAssets === 0 ? (
                        <p className="text-xs text-muted-foreground/60 italic p-3 rounded-lg border border-dashed border-muted-foreground/15 text-center bg-muted/5">
                          Sin equipamiento asignado
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {equipment.notebooks.map(n => (
                            <div key={n.id} className="relative flex gap-3 p-3 rounded-xl border border-sky-100/50 dark:border-sky-950 bg-sky-50/20 dark:bg-sky-950/5 hover:border-sky-300 dark:hover:border-sky-850 transition-colors">
                              <Laptop className="size-4.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-foreground truncate">{n.brand} {n.model}</span>
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-sky-100/60 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800 shrink-0">
                                    {n.internalCode}
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                  {n.processor} • {n.ram} • {n.storage}
                                </p>
                                <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-2 border-t border-sky-100/30 dark:border-sky-950/30 pt-1.5">
                                  <span>OS: {n.os}</span>
                                  <span className="font-mono">S/N: {n.serialNumber}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {equipment.monitors.map(m => (
                            <div key={m.id} className="relative flex gap-3 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-950 bg-emerald-50/20 dark:bg-emerald-950/5 hover:border-emerald-300 dark:hover:border-emerald-850 transition-colors">
                              <Monitor className="size-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-foreground truncate">{m.brand} {m.model}</span>
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-100/60 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 shrink-0">
                                    {m.internalCode}
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                  Pantalla: {m.size || "24\""} • Condición: {m.physicalCondition === 'excellent' ? 'Excelente' : 'Buena'}
                                </p>
                                {m.serialNumber && (
                                  <div className="flex items-center justify-end text-[9px] text-muted-foreground mt-2 border-t border-emerald-100/30 dark:border-emerald-950/30 pt-1.5">
                                    <span className="font-mono">S/N: {m.serialNumber}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-end gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                    <Button variant="ghost" size="icon-xs" onClick={() => openEdit(u)} title="Editar perfil">
                      <Edit className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" className="text-destructive hover:text-destructive hover:bg-destructive/5" onClick={() => handleDelete(u.id)} title="Eliminar registro">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Integrante de Sistemas" : "Registrar Integrante de Sistemas"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nombre Completo *</Label>
              <Input id="fullName" placeholder="Ej. Facundo Carrizo" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Rol de Sistemas *</Label>
              <Input id="role" placeholder="Ej. Analista de sistemas / Programador" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Usuario / Fichaje *</Label>
              <Input id="username" placeholder="Ej. facundo.carrizo" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" placeholder="email@migusto.com.ar" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Ubicación / Sector</Label>
              <Input id="location" placeholder="Ej. Sistemas" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="active" 
                checked={form.active} 
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="active">Integrante activo</Label>
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
