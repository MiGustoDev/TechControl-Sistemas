import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Plus, Search, Calendar, User, CheckSquare, ListTodo, Edit2, Trash2, 
  ChevronDown, CheckSquare2, Square, Sparkles, Megaphone, PartyPopper, CalendarHeart, HelpCircle, Check, Flag, Image as ImageIcon, Eye
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
import { TaskImageUploadModal } from "@/components/special-tasks/TaskImageUploadModal";
import { TaskImageViewerModal } from "@/components/special-tasks/TaskImageViewerModal";

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
import type { SpecialTaskCategory, SpecialTask, SpecialEvent } from "@/types";

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

// Card border color matching priority badge
const getPriorityBorderColor = (priority: string) => {
  switch (priority) {
    case "critical": return "border-l-rose-500";
    case "high":     return "border-l-amber-500";
    case "medium":   return "border-l-blue-500";
    default:         return "border-l-slate-500";
  }
};

// Category styling & icons
const getCategoryBadge = (category: SpecialTaskCategory) => {
  switch (category) {
    case "promotion":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    case "event":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    case "special-day":
      return "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20";
    case "campaign":
      return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20";
    default:
      return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
  }
};

const getCategoryLabel = (category: SpecialTaskCategory) => {
  switch (category) {
    case "promotion": return "Promoción";
    case "event": return "Evento";
    case "special-day": return "Día Especial";
    case "campaign": return "Campaña";
    default: return "Otro";
  }
};

const getCategoryIcon = (category: SpecialTaskCategory) => {
  switch (category) {
    case "promotion": return <Megaphone className="size-3.5 mr-1 shrink-0" />;
    case "event": return <PartyPopper className="size-3.5 mr-1 shrink-0" />;
    case "special-day": return <CalendarHeart className="size-3.5 mr-1 shrink-0" />;
    case "campaign": return <Sparkles className="size-3.5 mr-1 shrink-0" />;
    default: return <HelpCircle className="size-3.5 mr-1 shrink-0" />;
  }
};

// Progress bar color: 0-40% amber, 41-75% blue, 76-99% teal, 100% emerald
const getProgressBarColor = (value: number): string => {
  if (value >= 100) return "[&>div]:bg-emerald-500";
  if (value >= 76)  return "[&>div]:bg-teal-500";
  if (value >= 41)  return "[&>div]:bg-blue-500";
  return "[&>div]:bg-amber-500";
};

// Format ISO date YYYY-MM-DD → DD-MM-YYYY
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

// Auto-growing textarea: starts as 1 row, expands as content grows
function AutoGrowTextarea({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full resize-none overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 leading-6 ${className}`}
      style={{ minHeight: "2.25rem" }}
    />
  );
}

export function SpecialTasksPage() {
  const { 
    specialTasks, 
    addSpecialTask, 
    updateSpecialTask, 
    deleteSpecialTask, 
    users,
    specialEvents,
    saveSpecialEvent,
    deleteSpecialEvent
  } = useApp();

  const calendarEvents = specialEvents;

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Expanded cards state
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<SpecialTask | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Image Upload and Viewer Modals state
  const [uploadModalState, setUploadModalState] = useState<{
    isOpen: boolean;
    taskId: string;
    subTaskId: string;
    taskTitle: string;
    cardTitle: string;
  } | null>(null);

  const [viewerModalState, setViewerModalState] = useState<{
    isOpen: boolean;
    taskId: string;
    imageUrl: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SpecialTaskCategory>("campaign");
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

  // Open modal for creating new task
  const handleOpenCreate = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setCategory("campaign");
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

  // Open modal for editing existing task
  const handleOpenEdit = (task: SpecialTask) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setCategory(task.category);
    setStatus(task.status);
    setPriority(task.priority);
    setStartDate(task.startDate || "");
    setEndDate(task.endDate || "");
    setNoEndDate(!task.endDate);
    setAssignedTo(task.assignedTo || []);
    setNotes(task.notes || "");
    setFormTasks(task.tasks || []);
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

  // Submit handler (creates or updates task)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Por favor, ingresá el título de la tarea");
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
      calculatedProgress = status === "completed" ? 100 : (editingTask ? editingTask.progress : 0);
    }

    // Force progress to 100 if status is completed
    if (status === "completed") {
      calculatedProgress = 100;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
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
      if (editingTask) {
        await updateSpecialTask(editingTask.id, payload);

        // Always sync with specialEvents so it reflects in Calendar
        if (startDate) {
          const calEventPayload: SpecialEvent = {
            id: editingTask.id,
            name: title.trim(),
            date: startDate,
            type: category === "special-day" ? "break" : category === "campaign" ? "onfire" : category === "promotion" ? "promotion" : "event",
            tasks: formTasks.map(t => ({
              id: t.id,
              name: t.title,
              title: t.title,
              completed: t.completed
            })),
            bannerUrl: editingTask.bannerUrl,
            updatedAt: new Date().toISOString()
          };
          await saveSpecialEvent(calEventPayload);
        }

        toast.success("Campaña / evento actualizado correctamente");
      } else {
        const createdTask = await addSpecialTask(payload);
        const unifiedId = createdTask?.id;

        // Always sync with specialEvents using the EXACT SAME id so it reflects in Calendar without duplicating
        if (startDate && unifiedId) {
          const calEventPayload: SpecialEvent = {
            id: unifiedId,
            name: title.trim(),
            date: startDate,
            type: category === "special-day" ? "break" : category === "campaign" ? "onfire" : category === "promotion" ? "promotion" : "event",
            tasks: formTasks.map(t => ({
              id: t.id,
              name: t.title,
              title: t.title,
              completed: t.completed
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await saveSpecialEvent(calEventPayload);
        }

        toast.success("Campaña / evento creado correctamente");
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error("Hubo un error al guardar la campaña / evento");
    }
  };

  // Delete handler
  const handleDeleteTrigger = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteSpecialTask(deleteConfirmId);
      await deleteSpecialEvent(deleteConfirmId);
      toast.success("Campaña / evento eliminado");
    } catch (err) {
      toast.error("Error al eliminar la campaña / evento");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Direct toggle task completion in the card view
  const handleToggleCardTask = (taskId: string, subTaskId: string) => {
    const calEvent = calendarEvents.find(e => e.id === taskId);
    const task = specialTasks.find(t => t.id === taskId);

    const cardTitle = calEvent ? calEvent.name : (task?.title || "Campaña / Evento");
    const subTasks = calEvent ? (calEvent.tasks || []) : (task?.tasks || []);
    const subTask = subTasks.find((st: any) => st.id === subTaskId);

    if (!subTask) return;

    // If task is not completed yet, open Upload Modal
    if (!subTask.completed) {
      setUploadModalState({
        isOpen: true,
        taskId,
        subTaskId,
        taskTitle: subTask.title || (subTask as any).name || "Tarea",
        cardTitle
      });
      return;
    }

    // If already completed, uncheck directly
    void handleUncheckTask(taskId, subTaskId);
  };

  const handleUncheckTask = async (taskId: string, subTaskId: string) => {
    const calEvent = calendarEvents.find(e => e.id === taskId);
    if (calEvent) {
      const updatedTasks = (calEvent.tasks || []).map((t: any) => 
        t.id === subTaskId ? { ...t, completed: false } : t
      );
      
      const updatedEvent = {
        ...calEvent,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString()
      };

      const success = await saveSpecialEvent(updatedEvent);
      if (success) {
        toast.success("Tarea desmarcada");
      } else {
        toast.error("Error al actualizar la tarea");
      }
      return;
    }

    const task = specialTasks.find(t => t.id === taskId);
    if (!task || !task.tasks) return;

    const updatedTasks = task.tasks.map(t => t.id === subTaskId ? { ...t, completed: false } : t);
    const completed = updatedTasks.filter(t => t.completed).length;
    const progress = Math.round((completed / updatedTasks.length) * 100);
    const autoStatus = progress === 100 ? "completed" : (task.status === "completed" ? "in-progress" : task.status);

    await updateSpecialTask(taskId, {
      tasks: updatedTasks,
      progress,
      status: autoStatus
    });
    toast.success("Tarea desmarcada");
  };

  const handleConfirmUploadImage = async (imageDataUrl: string) => {
    if (!uploadModalState) return;
    const { taskId, subTaskId } = uploadModalState;

    const calEvent = calendarEvents.find(e => e.id === taskId);
    if (calEvent) {
      const updatedTasks = (calEvent.tasks || []).map((t: any) => 
        t.id === subTaskId ? { ...t, completed: true, imageUrl: imageDataUrl, completedAt: new Date().toISOString() } : t
      );
      
      const updatedEvent = {
        ...calEvent,
        tasks: updatedTasks,
        bannerUrl: imageDataUrl,
        updatedAt: new Date().toISOString()
      };

      const success = await saveSpecialEvent(updatedEvent);
      if (success) {
        toast.success("¡Comprobante guardado y tarea completada!");
      } else {
        toast.error("Error al actualizar la tarea");
      }
      return;
    }

    const task = specialTasks.find(t => t.id === taskId);
    if (!task || !task.tasks) return;

    const updatedTasks = task.tasks.map(t => 
      t.id === subTaskId ? { ...t, completed: true, imageUrl: imageDataUrl, completedAt: new Date().toISOString() } : t
    );

    const completed = updatedTasks.filter(t => t.completed).length;
    const progress = Math.round((completed / updatedTasks.length) * 100);
    const autoStatus = progress === 100 ? "completed" : (task.status === "completed" ? "in-progress" : task.status);

    await updateSpecialTask(taskId, {
      tasks: updatedTasks,
      progress,
      status: autoStatus,
      bannerUrl: imageDataUrl
    });

    toast.success("¡Comprobante guardado y tarea completada!");
  };

  const handleSetTaskBanner = async (taskId: string, imageUrl: string) => {
    const calEvent = calendarEvents.find(e => e.id === taskId);
    if (calEvent) {
      const updatedEvent = {
        ...calEvent,
        bannerUrl: imageUrl,
        updatedAt: new Date().toISOString()
      };
      const success = await saveSpecialEvent(updatedEvent);
      if (success) {
        toast.success("Imagen asignada como banner de la tarjeta");
      } else {
        toast.error("Error al asignar el banner");
      }
      return;
    }

    const task = specialTasks.find(t => t.id === taskId);
    if (!task) return;

    await updateSpecialTask(taskId, {
      bannerUrl: imageUrl
    });
    toast.success("Imagen asignada como banner de la tarjeta");
  };

  // Toggle card expansion
  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered tasks list including calendar special events
  const filteredTasks = useMemo(() => {
    const mappedCalEvents: SpecialTask[] = calendarEvents.map(evt => {
      const tasks = Array.isArray(evt.tasks) ? evt.tasks : [];
      const completedCount = tasks.filter((t: any) => t.completed).length;
      const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
      const status = progress === 100 ? "completed" : "in-progress";

      // Map type to category
      let category: SpecialTaskCategory = "event";
      if (evt.type === "break" || evt.id === "first-wednesday-break") {
        category = "special-day";
      } else if (evt.type === "onfire" || evt.id === "last-thursday-onfire") {
        category = "campaign";
      } else if (evt.type === "promotion") {
        category = "promotion";
      }

      return {
        id: evt.id,
        title: evt.name,
        description: `Evento especial del calendario operativo (${evt.type === "break" ? "MG Break" : evt.type === "onfire" ? "OnFire" : "Personalizado"}).`,
        category,
        status,
        priority: "medium",
        startDate: evt.date,
        endDate: evt.date,
        progress,
        tasks: tasks.map((t: any) => ({
          id: t.id,
          title: t.title || t.name,
          completed: !!t.completed,
          imageUrl: t.imageUrl,
          completedAt: t.completedAt
        })),
        bannerUrl: evt.bannerUrl,
        assignedTo: ["Equipo IT"],
        isCalendarEvent: true,
        createdAt: evt.createdAt || evt.date,
        updatedAt: evt.updatedAt || evt.date
      };
    });

    // Deduplicate by ID to prevent ANY duplicate card from ever rendering
    const combinedMap = new Map<string, SpecialTask>();
    (specialTasks || []).forEach(t => combinedMap.set(t.id, t));
    mappedCalEvents.forEach(evt => {
      if (!combinedMap.has(evt.id)) {
        combinedMap.set(evt.id, evt);
      }
    });

    const combined = Array.from(combinedMap.values());

    return combined.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
        (t.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [specialTasks, calendarEvents, search, statusFilter, priorityFilter, categoryFilter]);

  // Compute days remaining. Returns urgent=true when < 7 days
  const getDaysRemainingLabel = (endDateStr?: string, status?: string) => {
    if (status === "completed") return { text: "Completado", color: "text-emerald-500", urgent: false };
    if (!endDateStr) return { text: "Sin fecha límite", color: "text-muted-foreground", urgent: false };
    
    const end = new Date(endDateStr + "T12:00:00");
    const today = new Date();
    today.setHours(12,0,0,0);
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
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

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="size-7 text-foreground" /> Campañas y Eventos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión, seguimiento y control de promociones, eventos, campañas y objetivos de corto plazo del equipo de Sistemas IT.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="w-fit shrink-0 shadow-md">
          <Plus className="mr-2 size-4" /> Nueva campaña / evento
        </Button>
      </div>

      <Separator />

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o descripción..."
            className="pl-8 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto md:gap-3">
          <select
            className="h-10 px-2 md:px-3 py-2 text-xs md:text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-0 md:w-48 truncate"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Todas las Categorías</option>
            <option value="promotion">Promociones</option>
            <option value="event">Eventos</option>
            <option value="special-day">Días Especiales</option>
            <option value="campaign">Campañas</option>
            <option value="other">Otros</option>
          </select>
          <select
            className="h-10 px-2 md:px-3 py-2 text-xs md:text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-0 md:w-48 truncate"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los Estados</option>
            <option value="pending">Pendientes</option>
            <option value="in-progress">En Curso</option>
            <option value="on-hold">En Pausa</option>
            <option value="completed">Completados</option>
          </select>
          <select
            className="col-span-2 md:col-span-1 h-10 px-2 md:px-3 py-2 text-xs md:text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-0 md:w-48 truncate"
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

      {/* Tasks Cards Grid */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title="No se encontraron campañas o eventos"
          description={search || statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all"
            ? "Probá ajustando los filtros de búsqueda o categoría." 
            : "Comenzá creando una nueva campaña, evento o tarea de corto plazo."}
          icon={ListTodo}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => {
            const isExpanded = expandedCards[task.id] || false;
            const daysInfo = getDaysRemainingLabel(task.endDate, task.status);
            
            return (
              <Card key={task.id} className={`flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 rounded-xl py-0 pt-0 gap-0 ${getPriorityBorderColor(task.priority)}`}>
                {/* Red Box Region: Card Banner Header (Badges + Title + Description) */}
                <div className="relative overflow-hidden rounded-t-xl transition-all duration-300 border-b border-border/40 shrink-0">
                  {task.bannerUrl && (
                    <div className="absolute inset-0 z-0 overflow-hidden rounded-t-xl">
                      <img
                        src={task.bannerUrl}
                        alt={`Banner ${task.title}`}
                        className="w-full h-full object-cover filter brightness-[0.8] hover:brightness-[0.95] transition-all duration-300 scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-black/30" />
                    </div>
                  )}

                  <CardHeader className="pt-4 px-5 pb-2 relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <Badge variant="outline" className={`${getCategoryBadge(task.category)} flex items-center text-[11px] backdrop-blur-md`}>
                          {getCategoryIcon(task.category)}
                          {getCategoryLabel(task.category)}
                        </Badge>
                        <Badge variant="outline" className={`${getPriorityBadge(task.priority)} backdrop-blur-md`}>
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className={`${getStatusBadge(task.status)} text-[10px] px-2 py-0.5 backdrop-blur-md`}>
                          {getStatusLabel(task.status)}
                        </Badge>

                        {task.bannerUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-full text-white/90 hover:text-white hover:bg-black/50 backdrop-blur-md"
                            onClick={() => setViewerModalState({
                              isOpen: true,
                              taskId: task.id,
                              imageUrl: task.bannerUrl!,
                              title: `Banner: ${task.title}`,
                              subtitle: "Último comprobante subido"
                            })}
                            title="Ver Banner a tamaño completo"
                          >
                            <ImageIcon className="size-3.5" />
                          </Button>
                        )}

                        {task.isCalendarEvent && (
                          <Badge variant="outline" className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 text-[9.5px] backdrop-blur-md">
                            📅 Calendario
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-full text-muted-foreground hover:text-foreground backdrop-blur-md"
                          onClick={() => handleOpenEdit(task)}
                          title="Editar"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-full text-muted-foreground hover:text-rose-500 backdrop-blur-md"
                          onClick={() => handleDeleteTrigger(task.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2 text-lg font-bold text-foreground drop-shadow-sm">
                      {task.title}
                    </CardTitle>
                  </CardHeader>

                  {task.description && (
                    <div className="px-5 pb-4 relative z-10">
                      <p className="text-sm text-muted-foreground line-clamp-3 drop-shadow-xs">
                        {task.description}
                      </p>
                    </div>
                  )}
                </div>

                <CardContent className="flex-1 flex flex-col p-5 pt-4 pb-4">
                  {/* Progress Section */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Progreso</span>
                      <span className={`${
                        task.progress >= 100 ? "text-emerald-500" :
                        task.progress >= 76  ? "text-teal-500" :
                        task.progress >= 41  ? "text-blue-500" :
                        "text-amber-500"
                      }`}>{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className={`h-2 bg-muted-foreground/10 ${getProgressBarColor(task.progress)}`} />
                  </div>

                  {/* Tasks List */}
                  {task.tasks && task.tasks.length > 0 && (
                    <div className="mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full flex items-center justify-between text-xs px-2 h-8 hover:bg-muted/50 font-medium"
                        onClick={() => toggleExpand(task.id)}
                      >
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <CheckSquare className="size-3.5 text-emerald-500" />
                          Checklist ({task.tasks.filter(t => t.completed).length}/{task.tasks.length})
                        </span>
                        <ChevronDown
                          className="size-3 transition-transform duration-280 ease-out"
                          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      </Button>
                      
                      <div className={`accordion-grid${isExpanded ? " accordion-open" : ""}`}>
                        <div className="mt-2 space-y-1.5 pl-2 pr-1 max-h-48 overflow-y-auto no-scrollbar">
                          {task.tasks.map((subTask) => (
                            <div 
                              key={subTask.id}
                              className="flex items-center justify-between gap-2 text-xs p-1.5 rounded hover:bg-muted/30 transition-colors group"
                            >
                              <div
                                className="flex items-start gap-2 flex-1 cursor-pointer min-w-0"
                                onClick={() => handleToggleCardTask(task.id, subTask.id)}
                              >
                                <span className="shrink-0 mt-0.5">
                                  {subTask.completed ? (
                                    <CheckSquare2 className="size-4 text-emerald-600 dark:text-emerald-500" />
                                  ) : (
                                    <Square className="size-4 text-muted-foreground/60" />
                                  )}
                                </span>
                                <span className={`leading-normal truncate ${subTask.completed ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                                  {subTask.title}
                                  {!subTask.completed && (
                                    <span className="ml-1 text-amber-500 font-bold text-[11px]" title="Requiere comprobante de imagen">!</span>
                                  )}
                                </span>
                              </div>

                              {subTask.imageUrl && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-6 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-full shrink-0"
                                  title="Ver comprobante de imagen"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewerModalState({
                                      isOpen: true,
                                      taskId: task.id,
                                      imageUrl: subTask.imageUrl!,
                                      title: `Comprobante: ${subTask.title}`,
                                      subtitle: `Evento: ${task.title}`
                                    });
                                  }}
                                >
                                  <ImageIcon className="size-3.5" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator className="my-3" />

                  {/* Dates & Assigned info */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 shrink-0" />
                      <div className="truncate">
                        <span>{formatDate(task.startDate)}</span>
                        {task.endDate && (
                          <span className="block text-[10px] opacity-75">al {formatDate(task.endDate)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 justify-end">
                      <User className="size-3.5 shrink-0" />
                      <span className="truncate max-w-[120px]" title={task.assignedTo?.join(", ")}>
                        {task.assignedTo && task.assignedTo.length > 0 
                          ? task.assignedTo.join(", ") 
                          : "Sin asignar"}
                      </span>
                    </div>
                  </div>

                  {/* Deadline Remaining Badge with pulse effect if urgent */}
                  {task.status !== "completed" && (
                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Plazo:</span>
                      <span className={`flex items-center gap-1 ${daysInfo.color}`}>
                        {daysInfo.urgent && (
                          <span className="relative flex size-2 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full size-2 bg-rose-500"></span>
                          </span>
                        )}
                        {daysInfo.text}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE & EDIT DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Editar campaña o evento" : "Nueva campaña o evento"}</DialogTitle>
            <DialogDescription>
              Completá los detalles de la tarea, campaña, promoción o evento de Sistemas.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-foreground">Título <span className="text-red-500">*</span></label>
                <Input
                  placeholder="Ej. Promo CyberMonday 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-foreground">Descripción</label>
                <AutoGrowTextarea
                  placeholder="Detalles sobre la promoción, evento, requerimientos generales, etc."
                  value={description}
                  onChange={setDescription}
                />
              </div>

              {/* Category + Status + Priority — single row */}
              <div className="md:col-span-2 grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Categoría <span className="text-red-500">*</span></label>
                  <select
                    className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SpecialTaskCategory)}
                    required
                  >
                    <option value="campaign">Campaña</option>
                    <option value="promotion">Promoción</option>
                    <option value="event">Evento</option>
                    <option value="special-day">Día Especial</option>
                    <option value="other">Otro / Especial</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Estado <span className="text-red-500">*</span></label>
                  <select
                    className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    required
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in-progress">En Curso</option>
                    <option value="on-hold">En Pausa</option>
                    <option value="completed">Completado</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Prioridad <span className="text-red-500">*</span></label>
                  <select
                    className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    required
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
              </div>

              {/* Dates row */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Fecha de Inicio</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Fecha Límite / Fin</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={noEndDate}
                    min={startDate || undefined}
                  />
                  <label className="flex items-center gap-2 cursor-pointer mt-1 select-none group w-fit">
                    <input
                      type="checkbox"
                      checked={noEndDate}
                      onChange={(e) => {
                        setNoEndDate(e.target.checked);
                        if (e.target.checked) setEndDate("");
                      }}
                      className="size-3.5 rounded accent-orange-600 cursor-pointer"
                    />
                    <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                      Sin límite
                    </span>
                  </label>
                </div>
              </div>

              {/* Assigned To — Objectives style pills */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-foreground">
                  Responsables <span className="text-red-500">*</span>
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
            </div>




            {/* Checklist Tasks */}
            <div className="space-y-2 border-t border-border pt-3">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Flag className="size-3.5 text-orange-500" />
                Requerimientos ({formTasks.length})
              </label>

              {/* List — no checkboxes, just bullets */}
              {formTasks.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar p-1.5 rounded-md border border-input bg-muted/20">
                  {formTasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-2 p-1.5 rounded hover:bg-muted/40 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-orange-500 font-bold text-[12px] shrink-0">•</span>
                        <span className="truncate text-foreground font-medium">{t.title}</span>
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

              {formTasks.length === 0 && (
                <div className="text-center py-4 text-xs text-muted-foreground border border-dashed rounded-lg">
                  No hay requerimientos. Se calculará el progreso manualmente.
                </div>
              )}

              {/* Add checklist item */}
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
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddTaskToForm} variant="outline" className="shrink-0">
                  Agregar
                </Button>
              </div>
            </div>

            <Separator className="my-2" />

            {/* Internal Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Notas internas</label>
              <AutoGrowTextarea
                placeholder="Observaciones extra sobre la tarea o enlaces a recursos útiles..."
                value={notes}
                onChange={setNotes}
              />
            </div>

            <DialogFooter className="pt-2 justify-end gap-2">
              <Button type="submit">
                {editingTask ? "Guardar Cambios" : "Crear campaña/ evento"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM ALERT DIALOG */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmás la eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer y borrará la tarea promocional con todos sus requerimientos y progreso asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-2 sm:gap-2">
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-rose-600 hover:bg-rose-700 text-white">
              Eliminar
            </AlertDialogAction>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Task Image Upload Modal */}
      <TaskImageUploadModal
        isOpen={uploadModalState?.isOpen ?? false}
        onClose={() => setUploadModalState(null)}
        onConfirm={handleConfirmUploadImage}
        taskTitle={uploadModalState?.taskTitle ?? ""}
        cardTitle={uploadModalState?.cardTitle ?? ""}
      />

      {/* Task Image Viewer Modal */}
      <TaskImageViewerModal
        isOpen={viewerModalState?.isOpen ?? false}
        onClose={() => setViewerModalState(null)}
        imageUrl={viewerModalState?.imageUrl ?? null}
        title={viewerModalState?.title ?? ""}
        subtitle={viewerModalState?.subtitle}
        isCurrentBanner={
          viewerModalState ? (
            (calendarEvents.find(e => e.id === viewerModalState.taskId)?.bannerUrl === viewerModalState.imageUrl) ||
            (specialTasks.find(t => t.id === viewerModalState.taskId)?.bannerUrl === viewerModalState.imageUrl)
          ) : false
        }
        onSetAsBanner={
          viewerModalState ? () => handleSetTaskBanner(viewerModalState.taskId, viewerModalState.imageUrl) : undefined
        }
      />
    </div>
  );
}
