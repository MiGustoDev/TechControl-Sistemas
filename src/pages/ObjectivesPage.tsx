import { useState, useMemo } from "react";
import { 
  Plus, Search, Calendar, User, CheckSquare, ListTodo, Edit2, Trash2, 
  ChevronDown, ChevronUp, Flag, CheckSquare2, Square, Info, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/context/AppContext";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Helper for priority styling
const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "critical":
      return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    case "high":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "medium":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    default:
      return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "critical": return "Crítica";
    case "high": return "Alta";
    case "medium": return "Media";
    default: return "Baja";
  }
};

// Helper for status styling
const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "in-progress":
      return "bg-sky-500/10 text-sky-500 border-sky-500/20";
    case "on-hold":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    default:
      return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "completed": return "Completado";
    case "in-progress": return "En Curso";
    case "on-hold": return "En Pausa";
    default: return "Pendiente";
  }
};

export function ObjectivesPage() {
  const { objectives, addObjective, updateObjective, deleteObjective, users } = useApp();

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Expanded cards state
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<any | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"pending" | "in-progress" | "completed" | "on-hold">("pending");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  
  // Dynamic checklist in form
  const [formTasks, setFormTasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const systemsUsers = useMemo(() => {
    const allowed = ["Facundo Carrizo", "Ramiro Lacci", "Gustavo Gonzalez"];
    const filtered = users.filter(u => allowed.includes(u.fullName));
    return filtered.length > 0 ? filtered : [
      { id: "facundo", fullName: "Facundo Carrizo" },
      { id: "ramiro", fullName: "Ramiro Lacci" },
      { id: "gustavo", fullName: "Gustavo Gonzalez" }
    ];
  }, [users]);

  // Open modal for creating new objective
  const handleOpenCreate = () => {
    setEditingObjective(null);
    setTitle("");
    setDescription("");
    setStatus("pending");
    setPriority("medium");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setAssignedTo([]);
    setNotes("");
    setFormTasks([]);
    setNewTaskTitle("");
    setIsDialogOpen(true);
  };

  // Open modal for editing existing objective
  const handleOpenEdit = (obj: any) => {
    setEditingObjective(obj);
    setTitle(obj.title);
    setDescription(obj.description || "");
    setStatus(obj.status);
    setPriority(obj.priority);
    setStartDate(obj.startDate || "");
    setEndDate(obj.endDate || "");
    setAssignedTo(obj.assignedTo || []);
    setNotes(obj.notes || "");
    setFormTasks(obj.tasks || []);
    setNewTaskTitle("");
    setIsDialogOpen(true);
  };

  // Add task to form checklist
  const handleAddTaskToForm = () => {
    if (!newTaskTitle.trim()) return;
    setFormTasks(prev => [...prev, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: newTaskTitle.trim(),
      completed: false
    }]);
    setNewTaskTitle("");
  };

  // Remove task from form checklist
  const handleRemoveTaskFromForm = (taskId: string) => {
    setFormTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Submit handler (creates or updates objective)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Por favor, ingresá el título del objetivo");
      return;
    }

    if (!assignedTo || assignedTo.length === 0) {
      toast.error("Por favor, seleccioná al menos un responsable del equipo");
      return;
    }

    // Progress calculation based on checklist tasks
    let calculatedProgress = 0;
    if (formTasks.length > 0) {
      const completed = formTasks.filter(t => t.completed).length;
      calculatedProgress = Math.round((completed / formTasks.length) * 100);
    } else {
      // Keep previous progress or default to 0/100 if completed
      calculatedProgress = status === "completed" ? 100 : (editingObjective ? editingObjective.progress : 0);
    }

    // Force progress to 100 if status is completed
    if (status === "completed") {
      calculatedProgress = 100;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      progress: calculatedProgress,
      assignedTo,
      tasks: formTasks,
      notes: notes.trim() || undefined
    };

    try {
      if (editingObjective) {
        await updateObjective(editingObjective.id, payload);
        toast.success("Objetivo actualizado correctamente");
      } else {
        await addObjective(payload);
        toast.success("Objetivo creado correctamente");
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error("Hubo un error al guardar el objetivo");
    }
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que querés eliminar este objetivo?")) {
      try {
        await deleteObjective(id);
        toast.success("Objetivo eliminado");
      } catch (err) {
        toast.error("Error al eliminar el objetivo");
      }
    }
  };

  // Direct toggle task completion in the card view
  const handleToggleCardTask = async (objectiveId: string, taskId: string) => {
    const obj = objectives.find(o => o.id === objectiveId);
    if (!obj || !obj.tasks) return;

    const updatedTasks = obj.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    
    // Recalculate progress
    const completed = updatedTasks.filter(t => t.completed).length;
    const progress = Math.round((completed / updatedTasks.length) * 100);
    
    // If progress reaches 100%, we could mark status as completed automatically
    const autoStatus = progress === 100 ? "completed" : (obj.status === "completed" ? "in-progress" : obj.status);

    await updateObjective(objectiveId, {
      tasks: updatedTasks,
      progress,
      status: autoStatus
    });
  };

  // Toggle card expansion
  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered objectives list
  const filteredObjectives = useMemo(() => {
    return objectives.filter(o => {
      const matchesSearch = o.title.toLowerCase().includes(search.toLowerCase()) || 
        (o.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || o.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [objectives, search, statusFilter, priorityFilter]);

  // Compute days remaining
  const getDaysRemainingLabel = (endDateStr?: string, status?: string) => {
    if (status === "completed") return { text: "Completado", color: "text-emerald-500" };
    if (!endDateStr) return { text: "Sin fecha límite", color: "text-muted-foreground" };
    
    const end = new Date(endDateStr + "T12:00:00");
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `Vencido por ${Math.abs(diffDays)} d.`, color: "text-rose-500 font-bold" };
    } else if (diffDays === 0) {
      return { text: "Vence hoy", color: "text-amber-500 font-bold" };
    } else if (diffDays === 1) {
      return { text: "Vence mañana", color: "text-amber-500 font-medium" };
    } else {
      return { text: `${diffDays} días restantes`, color: "text-muted-foreground" };
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
            Objetivos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión, seguimiento y control de objetivos y metas del equipo de Sistemas IT.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shrink-0 shadow-md">
          <Plus className="mr-2 size-4" /> Nuevo objetivo
        </Button>
      </div>

      <Separator />

      {/* Filters Bar */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o descripción..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los Estados</option>
            <option value="pending">Pendientes</option>
            <option value="in-progress">En Curso</option>
            <option value="on-hold">En Pausa</option>
            <option value="completed">Completados</option>
          </select>
        </div>
        <div>
          <select
            className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">Todas las Prioridades</option>
            <option value="critical">Prioridad Crítica</option>
            <option value="high">Prioridad Alta</option>
            <option value="medium">Prioridad Media</option>
            <option value="low">Prioridad Baja</option>
          </select>
        </div>
      </div>

      {/* Objectives Cards Grid */}
      {filteredObjectives.length === 0 ? (
        <EmptyState
          title="No se encontraron proyectos"
          description={search || statusFilter !== "all" || priorityFilter !== "all" 
            ? "Probá ajustando los filtros de búsqueda o prioridad." 
            : "Comenzá creando un nuevo objetivo o proyecto para hacer su seguimiento de forma prolija."}
          icon={ListTodo}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredObjectives.map((obj) => {
            const isExpanded = expandedCards[obj.id] || false;
            const daysInfo = getDaysRemainingLabel(obj.endDate, obj.status);
            
            return (
              <Card key={obj.id} className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500">
                <CardHeader className="pb-3 relative">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <Badge variant="outline" className={getPriorityBadge(obj.priority)}>
                      {getPriorityLabel(obj.priority)}
                    </Badge>
                    <Badge variant="outline" className={getStatusBadge(obj.status)}>
                      {getStatusLabel(obj.status)}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2 text-lg font-bold text-foreground pr-10">
                    {obj.title}
                  </CardTitle>
                  
                  {/* Actions Dropdown / Group */}
                  <div className="absolute right-4 top-4 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-full text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(obj)}
                      title="Editar"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-full text-muted-foreground hover:text-rose-500"
                      onClick={() => handleDelete(obj.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col pb-4">
                  {/* Description */}
                  {obj.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                      {obj.description}
                    </p>
                  )}

                  {/* Progress Section */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Progreso</span>
                      <span className="text-primary">{obj.progress}%</span>
                    </div>
                    <Progress value={obj.progress} className="h-2 bg-muted-foreground/10" />
                  </div>

                  {/* Tasks List / Requerimientos */}
                  {obj.tasks && obj.tasks.length > 0 && (
                    <div className="mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full flex items-center justify-between text-xs px-2 h-8 hover:bg-muted/50 font-medium"
                        onClick={() => toggleExpand(obj.id)}
                      >
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <CheckSquare className="size-3.5 text-emerald-500" />
                          Requerimientos ({obj.tasks.filter(t => t.completed).length}/{obj.tasks.length})
                        </span>
                        {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                      </Button>
                      
                      {(!expandedCards.hasOwnProperty(obj.id) || isExpanded) && (
                        <div className="mt-2 space-y-1.5 pl-2 pr-1 max-h-48 overflow-y-auto no-scrollbar">
                          {obj.tasks.map((task) => (
                            <div 
                              key={task.id}
                              className="flex items-start gap-2 text-xs p-1.5 rounded hover:bg-muted/30 transition-colors cursor-pointer"
                              onClick={() => handleToggleCardTask(obj.id, task.id)}
                            >
                              <span className="shrink-0 mt-0.5">
                                {task.completed ? (
                                  <CheckSquare2 className="size-4 text-emerald-600 dark:text-emerald-500" />
                                ) : (
                                  <Square className="size-4 text-muted-foreground/60" />
                                )}
                              </span>
                              <span className={`leading-normal ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                {task.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <Separator className="my-3" />

                  {/* Metadata Footer */}
                  <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5 text-teal-600" />
                        {obj.startDate || "?"} al {obj.endDate || "?"}
                      </span>
                      <span className={daysInfo.color}>{daysInfo.text}</span>
                    </div>

                    {/* Assigned Team */}
                    {obj.assignedTo && obj.assignedTo.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <User className="size-3.5 text-sky-600 shrink-0" />
                        <span className="font-medium shrink-0">Responsables:</span>
                        <div className="flex gap-1 flex-wrap">
                          {obj.assignedTo.map((name, i) => (
                            <Badge key={i} variant="secondary" className="px-1.5 py-0 text-[10px] bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes summary indicator */}
                    {obj.notes && (
                      <div className="flex items-start gap-1.5 bg-muted/40 p-2 rounded text-[11px] leading-relaxed border border-border/40 mt-1">
                        <Info className="size-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="line-clamp-2 italic">{obj.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto no-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingObjective ? "Editar Objetivo" : "Nuevo Objetivo"}
            </DialogTitle>
            <DialogDescription>
              Completá los datos del objetivo, fechas de inicio y fin, y sus requerimientos.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Título <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="Título del objetivo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Descripción</label>
              <Textarea
                placeholder="Descripción breve del objetivo..."
                rows={1}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onFocus={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                className="resize-none overflow-hidden min-h-[38px] transition-none py-2"
              />
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Estado</label>
                <select
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="pending">Pendiente</option>
                  <option value="in-progress">En Curso</option>
                  <option value="on-hold">En Pausa</option>
                  <option value="completed">Completado</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Prioridad</label>
                <select
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Fecha Inicio</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Fecha Fin</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Assigned to (Required Badges / Tags) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Responsables del Equipo <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2 flex-wrap pt-1">
                {systemsUsers.map((u) => {
                  const isAssigned = assignedTo.includes(u.fullName);
                  return (
                    <Badge
                      key={u.id}
                      variant={isAssigned ? "default" : "outline"}
                      className={`cursor-pointer px-3 py-1.5 text-xs transition-all flex items-center gap-1.5 rounded-full select-none ${
                        isAssigned 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm border-emerald-600" 
                          : "hover:bg-muted/80 text-muted-foreground border-input"
                      }`}
                      onClick={() => {
                        if (isAssigned) {
                          setAssignedTo(prev => prev.filter(name => name !== u.fullName));
                        } else {
                          setAssignedTo(prev => [...prev, u.fullName]);
                        }
                      }}
                    >
                      {isAssigned && <Check className="size-3.5" />}
                      {u.fullName}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Checklist Tasks / Requerimientos (No checkboxes in modal) */}
            <div className="space-y-2 border-t border-border pt-3">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Flag className="size-3.5 text-emerald-500" />
                Requerimientos ({formTasks.length})
              </label>
              
              {/* Requirement items list without checkboxes inside modal */}
              {formTasks.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar p-1.5 rounded-md border border-input bg-muted/20">
                  {formTasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-2 p-1.5 rounded hover:bg-muted/40 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-emerald-500 font-bold text-[12px] shrink-0">•</span>
                        <span className="truncate text-foreground font-medium">
                          {t.title}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 text-muted-foreground hover:text-rose-500 shrink-0"
                        onClick={() => handleRemoveTaskFromForm(t.id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add task row */}
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar un requerimiento..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTaskToForm();
                    }
                  }}
                  className="h-9 text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTaskToForm}
                  className="h-9 px-3 shrink-0"
                >
                  Agregar
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border mt-4 flex gap-2 sm:justify-end">
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow">
                {editingObjective ? "Guardar Cambios" : "Guardar"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
