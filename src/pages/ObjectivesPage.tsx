import { useState, useMemo } from "react";
import { 
  Plus, Search, Calendar, User, CheckSquare, ListTodo, Edit2, Trash2, 
  ChevronDown, Flag, CheckSquare2, Square, Info, Check, Target, TrendingUp,
  CheckCircle2, Zap, Server, ShieldCheck, Cpu, Workflow, Layers, LayoutGrid,
  Kanban, Clock, Sparkles
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
import type { Objective, ObjectiveCategory } from "@/types";
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

// Helper for priority styling
const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "critical":
      return "bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold";
    case "high":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20 font-semibold";
    case "medium":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    default:
      return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  }
};

const getPriorityBorderColor = (priority: string) => {
  switch (priority) {
    case "critical": return "border-l-rose-500";
    case "high":     return "border-l-amber-500";
    case "medium":   return "border-l-blue-500";
    default:         return "border-l-slate-500";
  }
};

const getProgressBarColor = (value: number): string => {
  if (value >= 100) return "[&>div]:bg-emerald-500";
  if (value >= 76)  return "[&>div]:bg-teal-500";
  if (value >= 41)  return "[&>div]:bg-blue-500";
  return "[&>div]:bg-amber-500";
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "?";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "critical": return "Crítica";
    case "high": return "Alta";
    case "medium": return "Media";
    default: return "Baja";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-extrabold";
    case "in-progress":
      return "bg-sky-500/10 text-sky-500 border-sky-500/20 font-semibold";
    case "on-hold":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20 font-medium";
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

// Category Configs
const CATEGORY_CONFIG: Record<ObjectiveCategory, { label: string; icon: any; badgeClass: string }> = {
  infrastructure: {
    label: "Infraestructura & Servidores",
    icon: Server,
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
  },
  security: {
    label: "Seguridad & Compliance",
    icon: ShieldCheck,
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
  },
  software: {
    label: "Innovación & Software",
    icon: Cpu,
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
  },
  processes: {
    label: "Procesos & Soporte",
    icon: Workflow,
    badgeClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
  },
  other: {
    label: "General / Otros",
    icon: Layers,
    badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
  }
};

export function ObjectivesPage() {
  const { objectives, addObjective, updateObjective, deleteObjective, users } = useApp();

  // Filters & Views
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "kanban">("grid");

  // Expanded cards state
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ObjectiveCategory>("infrastructure");
  const [horizon, setHorizon] = useState("");
  const [status, setStatus] = useState<"pending" | "in-progress" | "completed" | "on-hold">("pending");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [noEndDate, setNoEndDate] = useState(false);
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

  // Executive Dashboard KPIs
  const kpis = useMemo(() => {
    const total = objectives.length;
    const active = objectives.filter(o => o.status === "in-progress").length;
    const completedObj = objectives.filter(o => o.status === "completed").length;
    
    // Average progress
    const avgProgress = total > 0 
      ? Math.round(objectives.reduce((acc, o) => acc + (o.progress || 0), 0) / total) 
      : 0;

    // Total sub-tasks stats
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    objectives.forEach(o => {
      if (o.tasks && o.tasks.length > 0) {
        totalSubtasks += o.tasks.length;
        completedSubtasks += o.tasks.filter(t => t.completed).length;
      }
    });

    const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    return { total, active, completedObj, avgProgress, totalSubtasks, completedSubtasks, subtaskPercent };
  }, [objectives]);

  // Open modal for creating new objective
  const handleOpenCreate = () => {
    setEditingObjective(null);
    setTitle("");
    setDescription("");
    setCategory("infrastructure");
    setHorizon("Q3 2026");
    setStatus("pending");
    setPriority("medium");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setNoEndDate(false);
    setAssignedTo([]);
    setNotes("");
    setFormTasks([]);
    setNewTaskTitle("");
    setIsDialogOpen(true);
  };

  // Open modal for editing existing objective
  const handleOpenEdit = (obj: Objective) => {
    setEditingObjective(obj);
    setTitle(obj.title);
    setDescription(obj.description || "");
    setCategory(obj.category || "infrastructure");
    setHorizon(obj.horizon || "");
    setStatus(obj.status);
    setPriority(obj.priority);
    setStartDate(obj.startDate || "");
    setEndDate(obj.endDate || "");
    setNoEndDate(!obj.endDate);
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

    let calculatedProgress = 0;
    if (formTasks.length > 0) {
      const completed = formTasks.filter(t => t.completed).length;
      calculatedProgress = Math.round((completed / formTasks.length) * 100);
    } else {
      calculatedProgress = status === "completed" ? 100 : (editingObjective ? editingObjective.progress : 0);
    }

    if (status === "completed") {
      calculatedProgress = 100;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      horizon: horizon.trim() || undefined,
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
        toast.success("Objetivo a largo plazo actualizado correctamente");
      } else {
        await addObjective(payload);
        toast.success("Nuevo objetivo a largo plazo creado");
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error("Hubo un error al guardar el objetivo");
    }
  };

  // Delete handler
  const handleDeleteTrigger = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteObjective(deleteConfirmId);
      toast.success("Objetivo eliminado");
    } catch (err) {
      toast.error("Error al eliminar el objetivo");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Direct toggle task completion in card / kanban view (Instant comfort check-off)
  const handleToggleCardTask = async (objectiveId: string, taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const obj = objectives.find(o => o.id === objectiveId);
    if (!obj || !obj.tasks) return;

    const updatedTasks = obj.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    
    // Recalculate progress
    const completed = updatedTasks.filter(t => t.completed).length;
    const progress = Math.round((completed / updatedTasks.length) * 100);
    
    let autoStatus = obj.status;
    if (progress === 100) {
      autoStatus = "completed";
      toast.success(`🎉 ¡100% de hitos completados en "${obj.title}"!`, {
        description: "El objetivo se ha marcado como completado automáticamente."
      });
    } else if (obj.status === "completed" && progress < 100) {
      autoStatus = "in-progress";
    }

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
      const matchesCategory = categoryFilter === "all" || (o.category || "infrastructure") === categoryFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [objectives, search, statusFilter, priorityFilter, categoryFilter]);

  // Compute days remaining label
  const getDaysRemainingLabel = (endDateStr?: string, status?: string) => {
    if (status === "completed") return { text: "Completado", color: "text-emerald-500 font-bold", urgent: false };
    if (!endDateStr) return { text: "Objetivo Continuo / Sin fecha", color: "text-muted-foreground", urgent: false };
    
    const end = new Date(endDateStr + "T12:00:00");
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `Vencido por ${Math.abs(diffDays)} d.`, color: "text-rose-500 font-bold", urgent: true };
    } else if (diffDays === 0) {
      return { text: "Vence hoy", color: "text-amber-500 font-bold", urgent: true };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} día${diffDays === 1 ? "" : "s"} restante${diffDays === 1 ? "" : "s"}`, color: "text-amber-500 font-semibold", urgent: true };
    } else {
      return { text: `${diffDays} días restantes`, color: "text-muted-foreground", urgent: false };
    }
  };

  // Render Card Component
  const renderObjectiveCard = (obj: Objective) => {
    const isExpanded = expandedCards[obj.id] || false;
    const daysInfo = getDaysRemainingLabel(obj.endDate, obj.status);
    const catConfig = CATEGORY_CONFIG[obj.category || "infrastructure"] || CATEGORY_CONFIG.other;
    const CatIcon = catConfig.icon;

    return (
      <Card 
        key={obj.id} 
        className={`flex flex-col h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 ${getPriorityBorderColor(obj.priority)} bg-card/60 backdrop-blur-xs`}
      >
        <CardHeader className="pb-3 relative space-y-2">
          {/* Header Row: Category Badge & Horizon Tag */}
          <div className="flex items-center justify-between flex-wrap gap-1.5">
            <Badge variant="outline" className={`text-[10.5px] px-2 py-0.5 flex items-center gap-1.5 rounded-md font-bold ${catConfig.badgeClass}`}>
              <CatIcon className="size-3 shrink-0" />
              {catConfig.label}
            </Badge>

            {obj.horizon && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-muted/50 text-muted-foreground border-border flex items-center gap-1 font-semibold">
                <Clock className="size-2.5" />
                {obj.horizon}
              </Badge>
            )}
          </div>

          {/* Title & Actions Row */}
          <div className="flex items-start justify-between gap-2 pt-1">
            <CardTitle className="line-clamp-2 text-base font-extrabold text-foreground leading-snug">
              {obj.title}
            </CardTitle>

            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80"
                onClick={() => handleOpenEdit(obj)}
                title="Editar"
              >
                <Edit2 className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                onClick={() => handleDeleteTrigger(obj.id)}
                title="Eliminar"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Badges Row: Priority & Status */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${getPriorityBadge(obj.priority)}`}>
              Prioridad {getPriorityLabel(obj.priority)}
            </Badge>
            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${getStatusBadge(obj.status)}`}>
              {getStatusLabel(obj.status)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col pb-4">
          {/* Description */}
          {obj.description && (
            <p className="text-xs text-muted-foreground/90 line-clamp-3 mb-3 leading-relaxed">
              {obj.description}
            </p>
          )}

          {/* Progress Section */}
          <div className="space-y-1.5 mb-3 bg-muted/20 p-2.5 rounded-lg border border-border/30">
            <div className="flex justify-between text-xs font-extrabold">
              <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                <TrendingUp className="size-3 text-emerald-500" /> Avance Global
              </span>
              <span className={`${
                obj.progress >= 100 ? "text-emerald-500" :
                obj.progress >= 76  ? "text-teal-500" :
                obj.progress >= 41  ? "text-blue-500" :
                "text-amber-500"
              }`}>{obj.progress}%</span>
            </div>
            <Progress value={obj.progress} className={`h-2 bg-muted/60 ${getProgressBarColor(obj.progress)}`} />
          </div>

          {/* Requerimientos / Hitos - Direct Quick Check-Off */}
          {obj.tasks && obj.tasks.length > 0 && (
            <div className="mb-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full flex items-center justify-between text-xs px-2 h-7.5 hover:bg-muted/50 font-semibold"
                onClick={() => toggleExpand(obj.id)}
              >
                <span className="flex items-center gap-1.5 text-foreground/90 text-[11.5px]">
                  <CheckSquare className="size-3.5 text-emerald-500" />
                  Hitos Cumplidos ({obj.tasks.filter(t => t.completed).length}/{obj.tasks.length})
                </span>
                <ChevronDown
                  className="size-3.5 transition-transform duration-280 ease-out text-muted-foreground"
                  style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </Button>
              
              {/* Accordion content with direct fast check-off */}
              <div className={`accordion-grid${isExpanded ? " accordion-open" : ""}`}>
                <div className="mt-2 space-y-1 pl-1 pr-1 max-h-52 overflow-y-auto no-scrollbar">
                  {obj.tasks.map((task) => (
                    <div 
                      key={task.id}
                      onClick={(e) => handleToggleCardTask(obj.id, task.id, e)}
                      className={`flex items-start gap-2 text-xs p-2 rounded-md transition-all cursor-pointer border ${
                        task.completed 
                          ? "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10" 
                          : "bg-muted/30 border-border/40 hover:bg-muted/60 hover:border-border"
                      }`}
                    >
                      <span className="shrink-0 mt-0.5">
                        {task.completed ? (
                          <CheckSquare2 className="size-4 text-emerald-500 animate-in zoom-in-50 duration-200" />
                        ) : (
                          <Square className="size-4 text-muted-foreground/60 hover:text-emerald-500 transition-colors" />
                        )}
                      </span>
                      <span className={`leading-snug text-[11.5px] ${task.completed ? "line-through text-muted-foreground font-medium" : "text-foreground font-medium"}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Separator className="my-2.5 opacity-60" />

          {/* Metadata Footer */}
          <div className="flex flex-col gap-2 text-[11px] text-muted-foreground mt-auto">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="size-3 text-teal-600" />
                {formatDate(obj.startDate)} {obj.endDate ? `al ${formatDate(obj.endDate)}` : ""}
              </span>
              <span className={`${daysInfo.color}${daysInfo.urgent ? " pulse-soft" : ""}`}>{daysInfo.text}</span>
            </div>

            {/* Responsibles */}
            {obj.assignedTo && obj.assignedTo.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <User className="size-3 text-emerald-500 shrink-0" />
                <span className="font-semibold text-foreground/80 shrink-0">Responsables:</span>
                <div className="flex gap-1 flex-wrap">
                  {obj.assignedTo.map((name, i) => (
                    <Badge
                      key={i}
                      variant="default"
                      className="px-2 py-0.5 text-[9.5px] rounded-full bg-emerald-600/90 text-white font-semibold flex items-center gap-1 shadow-2xs"
                    >
                      <Check className="size-2.5" />
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notes summary indicator */}
            {obj.notes && (
              <div className="flex items-start gap-1.5 bg-muted/40 p-2 rounded text-[10.5px] leading-relaxed border border-border/40 mt-1">
                <Info className="size-3 text-blue-500 shrink-0 mt-0.5" />
                <p className="line-clamp-2 italic">{obj.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Objetivos a Largo Plazo
            </h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-0.5 font-bold flex items-center gap-1">
              <Sparkles className="size-3" /> IT Roadmap
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Planificación estratégica, seguimiento de hitos clave y control de metas de mediano/largo plazo de Sistemas IT.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-fit shrink-0">
          {/* Switcher Grid vs Kanban */}
          <div className="flex items-center p-1 bg-muted/60 dark:bg-muted/30 rounded-lg border border-border/40">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="xs"
              onClick={() => setViewMode("grid")}
              className="h-7 text-xs gap-1 font-bold"
            >
              <LayoutGrid className="size-3.5" /> Tarjetas
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="xs"
              onClick={() => setViewMode("kanban")}
              className="h-7 text-xs gap-1 font-bold"
            >
              <Kanban className="size-3.5" /> Tablero
            </Button>
          </div>

          <Button onClick={handleOpenCreate} className="shadow-md font-bold">
            <Plus className="mr-2 size-4" /> Nuevo objetivo
          </Button>
        </div>
      </div>

      {/* Executive KPI Summary Dashboard Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Objectives */}
        <Card className="bg-card/70 backdrop-blur-xs border-muted-foreground/15 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Objetivos Totales</p>
              <h3 className="text-2xl font-black text-foreground mt-0.5">{kpis.total}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{kpis.completedObj} completados</p>
            </div>
            <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Target className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Average Global Progress */}
        <Card className="bg-card/70 backdrop-blur-xs border-muted-foreground/15 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Progreso Promedio</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{kpis.avgProgress}%</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Metas globales IT</p>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: In Progress */}
        <Card className="bg-card/70 backdrop-blur-xs border-muted-foreground/15 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">En Ejecución</p>
              <h3 className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-0.5">{kpis.active}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Iniciativas activas</p>
            </div>
            <div className="size-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
              <Zap className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Subtask Milestones */}
        <Card className="bg-card/70 backdrop-blur-xs border-muted-foreground/15 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hitos Cumplidos</p>
              <h3 className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5">{kpis.completedSubtasks}/{kpis.totalSubtasks}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{kpis.subtaskPercent}% de tareas de objetivos</p>
            </div>
            <div className="size-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar objetivo o descripción a largo plazo..."
            className="pl-8 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 w-full md:flex md:w-auto md:gap-3">
          {/* Category Filter */}
          <select
            className="h-10 px-2 md:px-3 py-2 text-xs md:text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-0 md:w-48 truncate font-medium"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Todas las Áreas</option>
            <option value="infrastructure">Infraestructura</option>
            <option value="security">Seguridad & Compliance</option>
            <option value="software">Innovación & Software</option>
            <option value="processes">Procesos & Soporte</option>
            <option value="other">General / Otros</option>
          </select>

          {/* Status Filter */}
          <select
            className="h-10 px-2 md:px-3 py-2 text-xs md:text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-0 md:w-44 truncate font-medium"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los Estados</option>
            <option value="pending">Pendientes</option>
            <option value="in-progress">En Curso</option>
            <option value="on-hold">En Pausa</option>
            <option value="completed">Completados</option>
          </select>

          {/* Priority Filter */}
          <select
            className="h-10 px-2 md:px-3 py-2 text-xs md:text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-0 md:w-44 truncate font-medium"
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

      {/* Main View Display */}
      {filteredObjectives.length === 0 ? (
        <EmptyState
          title="No se encontraron objetivos a largo plazo"
          description={search || statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all"
            ? "Probá ajustando los filtros de búsqueda, área o estado." 
            : "Comenzá creando un nuevo objetivo a largo plazo para estructurar el roadmap de Sistemas IT."}
          icon={ListTodo}
        />
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredObjectives.map((obj) => renderObjectiveCard(obj))}
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(["pending", "in-progress", "on-hold", "completed"] as const).map((colStatus) => {
            const colObjectives = filteredObjectives.filter(o => o.status === colStatus);
            let colTitle = "Pendientes";
            let colBadgeClass = "bg-slate-500/10 text-slate-500 border-slate-500/20";
            if (colStatus === "in-progress") {
              colTitle = "En Curso";
              colBadgeClass = "bg-sky-500/10 text-sky-500 border-sky-500/20";
            } else if (colStatus === "on-hold") {
              colTitle = "En Pausa";
              colBadgeClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
            } else if (colStatus === "completed") {
              colTitle = "Completados";
              colBadgeClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            }

            return (
              <div key={colStatus} className="space-y-4 flex flex-col h-full bg-muted/20 p-3.5 rounded-xl border border-border/40">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="font-extrabold text-sm text-foreground flex items-center gap-2">
                    {colTitle}
                  </span>
                  <Badge variant="outline" className={`text-xs px-2 py-0.5 ${colBadgeClass}`}>
                    {colObjectives.length}
                  </Badge>
                </div>

                <div className="space-y-4 flex-1">
                  {colObjectives.length === 0 ? (
                    <div className="text-center p-4 text-xs text-muted-foreground italic border border-dashed rounded-lg">
                      Sin objetivos en esta columna
                    </div>
                  ) : (
                    colObjectives.map(obj => renderObjectiveCard(obj))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[88vh] overflow-y-auto no-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Target className="size-5 text-primary" />
              {editingObjective ? "Editar Objetivo a Largo Plazo" : "Nuevo Objetivo a Largo Plazo"}
            </DialogTitle>
            <DialogDescription>
              Definí las metas clave, categoría del área IT, horizonte estimado e hitos a cumplir.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Título del Objetivo <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="Ej: Migración de infraestructura a Servidores Nube"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Category & Horizon */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Área / Categoría</label>
                <select
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-medium"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ObjectiveCategory)}
                >
                  <option value="infrastructure">Infraestructura & Servidores</option>
                  <option value="security">Seguridad & Compliance</option>
                  <option value="software">Innovación & Software</option>
                  <option value="processes">Procesos & Soporte</option>
                  <option value="other">General / Otros</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Horizonte Estimado</label>
                <Input
                  placeholder="Ej: Q3 2026, 2026-2027, Anual"
                  value={horizon}
                  onChange={(e) => setHorizon(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Descripción & Alcance</label>
              <Textarea
                placeholder="Detalla el alcance y meta de este objetivo estratégico..."
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none py-2 text-sm"
              />
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Estado</label>
                <select
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-medium"
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
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-medium"
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
                <label className="text-xs font-bold text-muted-foreground uppercase">Fecha Fin Límite</label>
                <Input
                  type="date"
                  value={endDate}
                  disabled={noEndDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={noEndDate ? "opacity-40 cursor-not-allowed" : ""}
                />
                <label className="flex items-center gap-2 cursor-pointer mt-1 select-none group w-fit">
                  <input
                    type="checkbox"
                    checked={noEndDate}
                    onChange={(e) => {
                      setNoEndDate(e.target.checked);
                      if (e.target.checked) setEndDate("");
                    }}
                    className="size-3.5 rounded accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                    Sin fecha límite específica
                  </span>
                </label>
              </div>
            </div>

            {/* Assigned to (Required Badges) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Responsables del Equipo IT <span className="text-rose-500">*</span>
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
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs border-emerald-600" 
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

            {/* Checklist Tasks / Hitos */}
            <div className="space-y-2 border-t border-border pt-3">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Flag className="size-3.5 text-emerald-500" />
                Hitos y Requerimientos Clave ({formTasks.length})
              </label>
              
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
                  placeholder="Ej: Instalar servidor secundario de respaldo..."
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
                  className="h-9 px-3 shrink-0 font-bold text-xs"
                >
                  Agregar Hito
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Notas Adicionales</label>
              <Textarea
                placeholder="Observaciones extra, proveedores o enlaces de interés..."
                rows={1}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none text-xs"
              />
            </div>

            <DialogFooter className="pt-2 border-t border-border mt-4 flex flex-row items-center justify-end gap-2">
              <Button type="submit" className="font-bold">
                {editingObjective ? "Guardar Cambios" : "Crear Objetivo"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <AlertDialogContent className="border-destructive/20 max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex size-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mx-auto mb-2">
              <Trash2 className="size-6" />
            </div>
            <AlertDialogTitle className="text-center text-base font-bold">
              ¿Eliminar objetivo a largo plazo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm">
              Esta acción no se puede deshacer. Se eliminarán el objetivo y todos los hitos vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:justify-center">
            <AlertDialogAction
              className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
              onClick={handleDeleteConfirm}
            >
              Eliminar
            </AlertDialogAction>
            <AlertDialogCancel className="w-full sm:w-auto mt-0">Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
