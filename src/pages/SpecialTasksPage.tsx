import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Plus, Search, Calendar, User, CheckSquare, ListTodo, Edit2, Trash2, 
  ChevronDown, CheckSquare2, Square, Sparkles, Megaphone, PartyPopper, CalendarHeart, HelpCircle, Check, Flag, Image as ImageIcon,
  Timer, AlertTriangle, Flame, CalendarDays, CheckCircle2, Hourglass, ChevronLeft, ChevronRight, Edit
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { getHolidayInfo } from "@/data/holidays";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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

// Currency helpers for Argentina format ($ 10.900,00)
const formatCurrencyDisplay = (num?: number | null): string => {
  if (num === undefined || num === null || isNaN(num)) return "$ ";
  return `$ ${num.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatCurrencyInputString = (inputVal: string): string => {
  if (!inputVal) return "$ ";
  
  const clean = inputVal.replace(/[^0-9,]/g, "");
  if (!clean) return "$ ";

  const commaIndex = clean.indexOf(",");
  let intPart = clean;
  let decPart: string | null = null;
  if (commaIndex !== -1) {
    intPart = clean.slice(0, commaIndex);
    decPart = clean.slice(commaIndex + 1).replace(/,/g, "").slice(0, 2);
  }

  let formattedInt = "";
  if (intPart) {
    const parsedInt = parseInt(intPart, 10);
    if (!isNaN(parsedInt)) {
      formattedInt = parsedInt.toLocaleString("es-AR");
    }
  }

  if (decPart !== null) {
    return `$ ${formattedInt},${decPart}`;
  }
  return `$ ${formattedInt}`;
};

const parseCurrencyValue = (valStr: string): number | undefined => {
  if (!valStr || valStr === "$ ") return undefined;
  const clean = valStr.replace(/\$/g, "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(clean);
  return isNaN(num) ? undefined : num;
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
    deleteSpecialEvent,
    holidayAssignments
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

  // Currency input states
  const [priceInput, setPriceInput] = useState("$ ");
  const [rendicionInput, setRendicionInput] = useState("$ ");

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceInput(formatCurrencyInputString(e.target.value));
  };

  const handlePriceBlur = () => {
    const num = parseCurrencyValue(priceInput);
    if (num !== undefined) {
      setPriceInput(formatCurrencyDisplay(num));
    } else {
      setPriceInput("$ ");
    }
  };

  const handleRendicionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRendicionInput(formatCurrencyInputString(e.target.value));
  };

  const handleRendicionBlur = () => {
    const num = parseCurrencyValue(rendicionInput);
    if (num !== undefined) {
      setRendicionInput(formatCurrencyDisplay(num));
    } else {
      setRendicionInput("$ ");
    }
  };
  
  // Dynamic checklist in form
  const [formTasks, setFormTasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Calendar View states
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [currentCalMonth, setCurrentCalMonth] = useState(new Date().getMonth());
  const [currentCalYear, setCurrentCalYear] = useState(new Date().getFullYear());
  const [showEventos, setShowEventos] = useState(true);
  const [showFeriados, setShowFeriados] = useState(true);

  // States for simple calendar events (same as GuardiasPage)
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventForm, setEventForm] = useState<{
    id?: string;
    date: string;
    name: string;
    type: string;
    tasks: { id: string; name: string; completed: boolean; imageUrl?: string; completedAt?: string }[];
  }>({ date: "", name: "", type: "custom", tasks: [] });

  const [showManageTypes, setShowManageTypes] = useState(false);
  const [editingTypeColorId, setEditingTypeColorId] = useState<string | null>(null);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeColor, setNewTypeColor] = useState<string>("gray");

  const [renamingTaskId, setRenamingTaskId] = useState<string | null>(null);
  const [renamingTaskName, setRenamingTaskName] = useState<string>("");

  const [eventTypes, setEventTypes] = useState<{ id: string; name: string; color: string }[]>(() => {
    const saved = localStorage.getItem("techcontrol_calendar_event_types");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: "break", name: "MG Break", color: "amber" },
      { id: "onfire", name: "OnFire", color: "rose" },
      { id: "promo", name: "Promoción", color: "orange" },
      { id: "custom", name: "Personalizado", color: "violet" }
    ];
  });

  const toDisplayDate = (isoDate: string): string => {
    if (!isoDate) return "";
    const parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const toIsoDate = (displayDate: string): string => {
    if (!displayDate) return "";
    const parts = displayDate.split("/");
    if (parts.length !== 3) return displayDate;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const openCreateEvent = (prefilledDate?: string) => {
    setEventForm({
      date: toDisplayDate(prefilledDate || new Date().toISOString().split("T")[0]),
      name: "",
      type: "custom",
      tasks: []
    });
    setEventDialogOpen(true);
  };

  const openEditEvent = (evt: { id: string; date: string; name: string; type: string; tasks: any[] }) => {
    setEventForm({
      id: evt.id,
      date: toDisplayDate(evt.date),
      name: evt.name,
      type: evt.type,
      tasks: evt.tasks.map(t => ({
        id: t.id,
        name: t.title || t.name,
        completed: t.completed,
        imageUrl: t.imageUrl,
        completedAt: t.completedAt
      }))
    });
    setEventDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.date || !eventForm.name) {
      toast.error("Completá los campos obligatorios (*)");
      return;
    }

    const isoDate = toIsoDate(eventForm.date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate) || isNaN(new Date(isoDate + "T12:00:00").getTime())) {
      toast.error("La fecha debe estar en formato DD/MM/AAAA (ej: 09/06/2026)");
      return;
    }

    const payload: SpecialEvent = {
      id: eventForm.id || `event-${Date.now()}`,
      date: isoDate,
      name: eventForm.name,
      type: eventForm.type,
      tasks: eventForm.tasks.map(t => ({
        id: t.id,
        title: t.name,
        name: t.name,
        completed: t.completed,
        imageUrl: t.imageUrl,
        completedAt: t.completedAt
      })),
      createdAt: eventForm.id ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const success = await saveSpecialEvent(payload);
    if (success) {
      toast.success(eventForm.id ? "Evento actualizado correctamente" : "Evento creado correctamente");
      setEventDialogOpen(false);
    } else {
      toast.error("Error al guardar el evento");
    }
  };

  // Calendar Helpers & Navigation
  const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const handlePrevMonth = () => {
    if (currentCalMonth === 0) {
      setCurrentCalMonth(11);
      setCurrentCalYear(prev => prev - 1);
    } else {
      setCurrentCalMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentCalMonth === 11) {
      setCurrentCalMonth(0);
      setCurrentCalYear(prev => prev + 1);
    } else {
      setCurrentCalMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentCalMonth(today.getMonth());
    setCurrentCalYear(today.getFullYear());
  };

  const pad = (n: number) => n.toString().padStart(2, "0");
  const firstDayIndex = new Date(currentCalYear, currentCalMonth, 1).getDay();
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentCalYear, currentCalMonth, 0).getDate();

  const cells = useMemo(() => {
    const gridCells: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      const prevDay = daysInPrevMonth - i;
      const prevMonth = currentCalMonth === 0 ? 11 : currentCalMonth - 1;
      const prevYear = currentCalMonth === 0 ? currentCalYear - 1 : currentCalYear;
      gridCells.push({
        day: prevDay,
        dateStr: `${prevYear}-${pad(prevMonth + 1)}-${pad(prevDay)}`,
        isCurrentMonth: false
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      gridCells.push({
        day,
        dateStr: `${currentCalYear}-${pad(currentCalMonth + 1)}-${pad(day)}`,
        isCurrentMonth: true
      });
    }

    const total = gridCells.length;
    const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (let day = 1; day <= remaining; day++) {
      const nextMonth = currentCalMonth === 11 ? 0 : currentCalMonth + 1;
      const nextYear = currentCalMonth === 11 ? currentCalYear + 1 : currentCalYear;
      gridCells.push({
        day,
        dateStr: `${nextYear}-${pad(nextMonth + 1)}-${pad(day)}`,
        isCurrentMonth: false
      });
    }

    return gridCells;
  }, [currentCalMonth, currentCalYear, startOffset, daysInMonth, daysInPrevMonth]);

  const getSpecialEventsForDate = (dateStr: string) => {
    return filteredTasks.filter(task => {
      if (task.isCalendarEvent) {
        return task.startDate === dateStr;
      }
      return task.startDate === dateStr || (Boolean(task.startDate) && Boolean(task.endDate) && dateStr >= task.startDate! && dateStr <= task.endDate!);
    });
  };

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
  const handleOpenCreate = (prefilledDate?: string) => {
    const validDate = typeof prefilledDate === "string" ? prefilledDate : undefined;
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setCategory("campaign");
    setStatus("pending");
    setPriority("medium");
    setStartDate(validDate || new Date().toISOString().split("T")[0]);
    setEndDate("");
    setNoEndDate(false);
    setPriceInput("$ ");
    setRendicionInput("$ ");
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
    setPriceInput(task.price !== undefined && task.price !== null ? formatCurrencyDisplay(task.price) : "$ ");
    setRendicionInput(task.rendicion !== undefined && task.rendicion !== null ? formatCurrencyDisplay(task.rendicion) : "$ ");
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

    const priceNum = parseCurrencyValue(priceInput);
    const rendicionNum = parseCurrencyValue(rendicionInput);

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      status,
      priority,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      price: priceNum,
      rendicion: rendicionNum,
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
            price: priceNum,
            rendicion: rendicionNum,
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
            price: priceNum,
            rendicion: rendicionNum,
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
        price: evt.price,
        rendicion: evt.rendicion,
        assignedTo: ["Equipo IT"],
        isCalendarEvent: true,
        originalType: evt.type,
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

    const filtered = combined.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
        (t.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });

    // Completed tasks always placed last
    return filtered.sort((a, b) => {
      const aCompleted = a.status === "completed";
      const bCompleted = b.status === "completed";
      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;
      return 0;
    });
  }, [specialTasks, calendarEvents, search, statusFilter, priorityFilter, categoryFilter]);

  const activeTasks = useMemo(() => {
    return filteredTasks.filter(t => t.status !== "completed");
  }, [filteredTasks]);

  const completedTasks = useMemo(() => {
    return filteredTasks.filter(t => t.status === "completed");
  }, [filteredTasks]);

  // Compute days remaining info with rich visual styling details
  const getDaysRemainingInfo = (endDateStr?: string, startDateStr?: string, status?: string) => {
    if (status === "completed") {
      return {
        statusType: "completed" as const,
        diffDays: null,
        headline: "Completado",
        shortBadge: "Completado",
        subtext: endDateStr ? `Finalizado (${formatDate(endDateStr)})` : "Tarea finalizada",
        badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
        boxClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300",
        Icon: CheckCircle2,
        urgent: false
      };
    }

    if (!endDateStr) {
      return {
        statusType: "no-date" as const,
        diffDays: null,
        headline: "Sin fecha de finalización",
        shortBadge: "Sin fecha fin",
        subtext: startDateStr ? `Inicio: ${formatDate(startDateStr)}` : "Sin fecha límite programada",
        badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
        boxClass: "bg-muted/40 border-border/50 text-muted-foreground",
        Icon: CalendarDays,
        urgent: false
      };
    }

    const end = new Date(endDateStr + "T12:00:00");
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const daysAgo = Math.abs(diffDays);
      return {
        statusType: "overdue" as const,
        diffDays,
        headline: `VENCIDO HACE ${daysAgo} DÍA${daysAgo === 1 ? "" : "S"}`,
        shortBadge: `⚠️ Vencido (-${daysAgo}d)`,
        subtext: `Venció el ${formatDate(endDateStr)}`,
        badgeClass: "bg-rose-600 text-white font-extrabold border-rose-700 shadow-xs animate-pulse",
        boxClass: "bg-rose-500/15 border-2 border-rose-500/40 text-rose-700 dark:text-rose-300 font-bold",
        Icon: AlertTriangle,
        urgent: true
      };
    } else if (diffDays === 0) {
      return {
        statusType: "today" as const,
        diffDays: 0,
        headline: "¡VENCE HOY!",
        shortBadge: "🔥 ¡Vence Hoy!",
        subtext: `Fecha límite: ${formatDate(endDateStr)}`,
        badgeClass: "bg-amber-500 text-slate-950 font-extrabold border-amber-600 shadow-xs animate-bounce",
        boxClass: "bg-amber-500/20 border-2 border-amber-500/50 text-amber-800 dark:text-amber-200 font-extrabold",
        Icon: Flame,
        urgent: true
      };
    } else if (diffDays <= 7) {
      return {
        statusType: "urgent" as const,
        diffDays,
        headline: `${diffDays} DÍA${diffDays === 1 ? "" : "S"} RESTANTES`,
        shortBadge: `⏳ ${diffDays}d rest.`,
        subtext: `Fecha límite: ${formatDate(endDateStr)}`,
        badgeClass: "bg-amber-500/25 text-amber-800 dark:text-amber-300 border-amber-500/50 font-extrabold shadow-2xs",
        boxClass: "bg-amber-500/15 border-2 border-amber-500/40 text-amber-800 dark:text-amber-200 font-bold",
        Icon: Hourglass,
        urgent: true
      };
    } else {
      return {
        statusType: "normal" as const,
        diffDays,
        headline: `${diffDays} DÍAS RESTANTES`,
        shortBadge: `⏳ ${diffDays} días rest.`,
        subtext: `Fecha límite: ${formatDate(endDateStr)}`,
        badgeClass: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30 font-bold",
        boxClass: "bg-sky-500/10 border border-sky-500/25 text-sky-800 dark:text-sky-200 font-semibold",
        Icon: Timer,
        urgent: false
      };
    }
  };

  const renderTaskCard = (task: SpecialTask) => {
    const isExpanded = expandedCards[task.id] || false;
    const daysInfo = getDaysRemainingInfo(task.endDate, task.startDate, task.status);
    const isCompleted = task.status === "completed";

    return (
      <Card 
        key={task.id} 
        className={`flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 rounded-xl py-0 pt-0 gap-0 ${getPriorityBorderColor(task.priority)} ${
          isCompleted 
            ? "opacity-50 saturate-50 hover:opacity-100 hover:saturate-100 bg-muted/20 border-dashed" 
            : ""
        }`}
      >
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

          {/* Price & Rendicion summary if defined */}
          {(task.price !== undefined || task.rendicion !== undefined) && (
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold my-2 pt-2 border-t border-border/40">
              <div className="text-emerald-600 dark:text-emerald-400">
                <span className="text-[10px] text-muted-foreground block font-normal">Precio:</span>
                {task.price !== undefined ? formatCurrencyDisplay(task.price) : "-"}
              </div>
              <div className="text-blue-600 dark:text-blue-400 text-right">
                <span className="text-[10px] text-muted-foreground block font-normal">Rendición:</span>
                {task.rendicion !== undefined ? formatCurrencyDisplay(task.rendicion) : "-"}
              </div>
            </div>
          )}

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

          {/* Highly Noticeable Days Remaining Banner / Callout Box */}
          <div className={`mt-3 p-3 rounded-lg flex items-center justify-between gap-3 shadow-xs transition-all ${daysInfo.boxClass}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-full bg-background/70 backdrop-blur-xs shrink-0 shadow-2xs">
                <daysInfo.Icon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wide truncate">
                    {daysInfo.headline}
                  </span>
                  {daysInfo.urgent && (
                    <span className="relative flex size-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-2 bg-rose-500"></span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] opacity-90 truncate">
                  {daysInfo.subtext}
                </p>
              </div>
            </div>
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
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Campañas y Eventos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión, seguimiento y control de promociones, eventos, campañas y objetivos de corto plazo del equipo de Sistemas IT.
          </p>
        </div>
        <div className="flex items-center gap-3 w-fit shrink-0">
          <Button
            onClick={() => setViewMode(prev => prev === "grid" ? "calendar" : "grid")}
            variant="outline"
            className="shadow-sm font-semibold text-white border-input hover:bg-accent"
          >
            <Calendar className="mr-2 size-4 text-white" /> 
            {viewMode === "grid" ? "Ver Calendario" : "Ver Tarjetas"}
          </Button>
          <Button onClick={() => handleOpenCreate()} className="shadow-md font-semibold">
            <Plus className="mr-2 size-4" /> Nueva campaña / evento
          </Button>
        </div>
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

      {/* Tasks Cards Grid / Calendar View */}
      {viewMode === "calendar" ? (
        <TooltipProvider>
          <Card className="border-muted-foreground/10 bg-card/45 backdrop-blur-xs print:border-none print:shadow-none overflow-hidden">
            <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 print:hidden border-b border-muted-foreground/5 mb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 shrink-0">
                <Calendar className="size-4 text-primary" />
                Calendario de Campañas y Eventos
              </CardTitle>
              
              {/* Month Navigation */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="size-7" onClick={handlePrevMonth} title="Mes anterior">
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-sm font-semibold min-w-[110px] text-center capitalize">
                  {MONTH_NAMES[currentCalMonth]} {currentCalYear}
                </span>
                <Button variant="outline" size="icon" className="size-7" onClick={handleNextMonth} title="Mes siguiente">
                  <ChevronRight className="size-4" />
                </Button>
                <Button variant="ghost" size="xs" onClick={handleGoToday} className="text-xs font-semibold h-7">
                  Hoy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtros de Visualización */}
              <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-semibold print:hidden border-b border-muted-foreground/5 pb-3">
                <span className="text-muted-foreground w-full sm:w-auto">Mostrar en Calendario:</span>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={showEventos ? "default" : "outline"} 
                    size="xs" 
                    className="h-7 text-xs gap-1"
                    onClick={() => setShowEventos(!showEventos)}
                  >
                    🔥 Eventos y Campañas
                  </Button>
                  <Button 
                    variant={showFeriados ? "default" : "outline"} 
                    size="xs" 
                    className="h-7 text-xs gap-1"
                    onClick={() => setShowFeriados(!showFeriados)}
                  >
                    🎉 Feriados
                  </Button>
                </div>
              </div>

              {/* Calendar Grid Header */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center font-bold text-[10px] sm:text-xs text-muted-foreground mb-2 border-b border-muted-foreground/5 pb-1">
                 {WEEK_DAYS.map(d => (
                  <div key={d} className="py-1 truncate px-0.5">{d}</div>
                ))}
              </div>
              
              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1.5 auto-rows-[85px] sm:auto-rows-[110px]">
                {cells.map((cell, idx) => {
                  const isToday = cell.dateStr === new Date().toISOString().split("T")[0];
                  const holidayName = getHolidayInfo(cell.dateStr);
                  const assignedUserId = holidayAssignments[cell.dateStr];
                  const assignedUser = assignedUserId ? users.find(u => u.id === assignedUserId) : null;
                  const dayEvents = getSpecialEventsForDate(cell.dateStr);

                  const cellBgClass = (holidayName && showFeriados)
                    ? cell.isCurrentMonth
                      ? "bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/20 dark:border-amber-900/40 hover:bg-amber-500/15"
                      : "bg-amber-500/5 border-amber-500/20 dark:bg-amber-950/10 dark:border-amber-900/20 opacity-50 hover:opacity-80 hover:bg-amber-500/10"
                    : cell.isCurrentMonth
                      ? "bg-background/40 border-muted-foreground/10"
                      : "bg-background/10 border-muted-foreground/5 opacity-40 hover:opacity-80";

                  return (
                    <Tooltip key={idx}>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => openCreateEvent(cell.dateStr)}
                          className={`group relative rounded border sm:rounded-lg p-1.5 flex flex-col justify-between gap-1 transition-all duration-200 overflow-hidden hover:scale-[1.02] hover:shadow-lg hover:border-orange-500/50 hover:ring-1 hover:ring-orange-500/20 active:scale-[0.98] ${cellBgClass} ${isToday ? "ring-1 sm:ring-2 ring-orange-500 ring-offset-1 sm:ring-offset-2 ring-offset-background" : ""}`}
                        >
                          {/* Day Number and Events */}
                          <div className="flex justify-between items-center min-w-0 overflow-hidden shrink-0">
                            <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                              isToday 
                                ? "bg-orange-500 text-white font-black" 
                                : "text-muted-foreground"
                            }`}>
                              {cell.day}
                            </span>
                          </div>

                          {/* Content Area */}
                          <div className="flex-1 flex flex-col gap-1 mt-1 justify-end min-h-0 overflow-y-auto no-scrollbar">
                            {holidayName && showFeriados && (
                              <div 
                                className="rounded border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 p-1 select-none shrink-0" 
                                title={`Feriado: ${holidayName}`}
                              >
                                <div className="text-[8.5px] font-extrabold text-amber-600 dark:text-amber-400 truncate">
                                  🎉 {holidayName}
                                </div>
                                {assignedUser && (
                                  <div className="text-[7.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                    👤 {assignedUser.fullName.split(" ")[0]}
                                  </div>
                                )}
                              </div>
                            )}

                            {showEventos && dayEvents.map((evt) => {
                              const isAllCompleted = evt.tasks && evt.tasks.length > 0 && evt.tasks.every(t => t.completed);
                              
                              // Category styling
                              let badgeClass = "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
                              if (evt.category === "event") {
                                badgeClass = "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
                              } else if (evt.category === "special-day") {
                                badgeClass = "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20";
                              } else if (evt.category === "campaign") {
                                badgeClass = "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20";
                              } else if (evt.category === "promotion") {
                                badgeClass = "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
                              }

                              return (
                                <span 
                                  key={evt.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (evt.isCalendarEvent) {
                                      const originalEvent = {
                                        id: evt.id,
                                        date: evt.startDate || "",
                                        name: evt.title,
                                        type: (evt as any).originalType || (evt.category === "special-day" ? "break" : evt.category === "campaign" ? "onfire" : evt.category === "promotion" ? "promo" : "custom"),
                                        tasks: evt.tasks || [],
                                        bannerUrl: evt.bannerUrl,
                                        createdAt: evt.createdAt,
                                        updatedAt: evt.updatedAt
                                      };
                                      openEditEvent(originalEvent);
                                    } else {
                                      handleOpenEdit(evt);
                                    }
                                  }}
                                  className={`text-[8.5px] ${badgeClass} border px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider shrink-0 truncate max-w-full cursor-pointer hover:scale-105 transition-transform`}
                                  title={`${evt.title} (${evt.tasks ? evt.tasks.filter(t => t.completed).length : 0}/${evt.tasks ? evt.tasks.length : 0} tareas)`}
                                >
                                  {evt.title} {isAllCompleted && "✓"}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs p-2 bg-background border shadow-md">
                        <p className="font-bold mb-1">Día {cell.day}</p>
                        {holidayName && <p className="text-amber-600 dark:text-amber-400">🎉 Feriado: {holidayName}</p>}
                        {assignedUser && <p className="text-emerald-600 dark:text-emerald-400">👤 Asiste: {assignedUser.fullName}</p>}
                        {dayEvents.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            <p className="font-semibold text-[10px] text-muted-foreground">Campañas / Eventos:</p>
                            {dayEvents.map(e => (
                              <p key={e.id} className="text-[10.5px] truncate">
                                • {e.title} ({e.progress}%)
                              </p>
                            ))}
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TooltipProvider>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="No se encontraron campañas o eventos"
          description={search || statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all"
            ? "Probá ajustando los filtros de búsqueda o categoría." 
            : "Comenzá creando una nueva campaña, evento o tarea de corto plazo."}
          icon={ListTodo}
        />
      ) : (
        <div className="space-y-8">
          {/* Active Tasks Grid */}
          {activeTasks.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                <Flame className="size-5.5 text-orange-500" /> Activas
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeTasks.map((task) => renderTaskCard(task))}
              </div>
            </div>
          )}

          {/* Completed Tasks Grid */}
          {completedTasks.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-border/40">
              <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                <CheckCircle2 className="size-5.5 text-emerald-500" /> Finalizadas
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedTasks.map((task) => renderTaskCard(task))}
              </div>
            </div>
          )}
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

              {/* Price & Rendicion row */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Precio</label>
                  <Input
                    type="text"
                    value={priceInput}
                    onChange={handlePriceChange}
                    onBlur={handlePriceBlur}
                    placeholder="$ 0,00"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Rendición</label>
                  <Input
                    type="text"
                    value={rendicionInput}
                    onChange={handleRendicionChange}
                    onBlur={handleRendicionBlur}
                    placeholder="$ 0,00"
                  />
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

      {/* Dialog: Registrar/Editar Evento Especial (Simple) */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{eventForm.id ? "Editar Evento Especial" : "Agregar Evento Especial"}</DialogTitle>
            <DialogDescription>
              {eventForm.id 
                ? "Modificá el evento especial y gestioná sus tareas." 
                : "Agregá un evento especial en el calendario y definí sus tareas."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-2 pr-1 space-y-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="grid gap-2">
              <Label htmlFor="eventDate">Fecha <span className="text-red-500">*</span></Label>
              <Input
                id="eventDate"
                type="text"
                placeholder="DD/MM/AAAA"
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eventName">Nombre del Evento <span className="text-red-500">*</span></Label>
              <Input
                id="eventName"
                type="text"
                placeholder="Ej: ☕ MG Break Amistoso"
                value={eventForm.name}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="eventType" className="font-semibold text-xs text-muted-foreground uppercase">Tipo de Evento</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs text-primary px-2 hover:bg-muted/50"
                  onClick={() => setShowManageTypes(!showManageTypes)}
                >
                  {showManageTypes ? "✕ Cerrar" : "⚙️ Administrar Tipos"}
                </Button>
              </div>

              {showManageTypes ? (
                <div className="border border-border bg-muted/15 rounded-lg p-3 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Tipos de Eventos</span>
                  </div>
                  <div className="space-y-1 max-h-[110px] overflow-y-auto pr-1">
                    {eventTypes.map((t) => {
                      const bgMap: Record<string, string> = {
                        sky: "bg-sky-500", blue: "bg-blue-500", indigo: "bg-indigo-500", violet: "bg-violet-500",
                        purple: "bg-purple-500", fuchsia: "bg-fuchsia-500", pink: "bg-pink-500", rose: "bg-rose-500",
                        red: "bg-red-500", orange: "bg-orange-500", amber: "bg-amber-500", yellow: "bg-yellow-500",
                        lime: "bg-lime-500", emerald: "bg-emerald-500", teal: "bg-teal-500", cyan: "bg-cyan-500", gray: "bg-slate-500"
                      };
                      const isEditingColor = editingTypeColorId === t.id;
                      return (
                        <div key={t.id} className="flex flex-col gap-1.5 p-1.5 rounded-md border bg-card text-xs">
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex items-center gap-2 cursor-pointer hover:opacity-80 group/dot"
                              onClick={() => setEditingTypeColorId(isEditingColor ? null : t.id)}
                              title="Click en el color para cambiarlo"
                            >
                              <span className={`w-2.5 h-2.5 rounded-full inline-block cursor-pointer hover:scale-120 transition-transform ${bgMap[t.color] || "bg-slate-500"}`} />
                              <span className="font-semibold">{t.name}</span>
                              <span className="text-[9px] text-muted-foreground opacity-0 group-hover/dot:opacity-100 transition-opacity">(Click color para cambiar)</span>
                            </div>
                            {t.id !== "break" && t.id !== "onfire" && t.id !== "promo" && t.id !== "custom" && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded"
                                onClick={() => {
                                  const next = eventTypes.filter(x => x.id !== t.id);
                                  setEventTypes(next);
                                  localStorage.setItem("techcontrol_calendar_event_types", JSON.stringify(next));
                                  if (eventForm.type === t.id) {
                                    setEventForm(prev => ({ ...prev, type: "custom" }));
                                  }
                                }}
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            )}
                          </div>

                          {isEditingColor && (
                            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 p-1.5 bg-muted/40 rounded border border-border mt-1">
                              {(["sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose", "red", "orange", "amber", "yellow", "lime", "emerald", "teal", "cyan", "gray"] as const).map((colorName) => {
                                const isSelected = t.color === colorName;
                                return (
                                  <button
                                    key={colorName}
                                    type="button"
                                    className={`w-4 h-4 rounded-full ${bgMap[colorName]} border transition-transform cursor-pointer hover:scale-115 ${isSelected ? "border-foreground scale-110 shadow-xs" : "border-transparent"}`}
                                    onClick={() => {
                                      const next = eventTypes.map(x => x.id === t.id ? { ...x, color: colorName } : x);
                                      setEventTypes(next);
                                      localStorage.setItem("techcontrol_calendar_event_types", JSON.stringify(next));
                                      toast.success(`Color de "${t.name}" actualizado`);
                                      setEditingTypeColorId(null);
                                    }}
                                    title={colorName}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Agregar Nuevo Tipo</span>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nombre (ej: Lanzamiento)"
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                        className="h-8 text-xs flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3"
                        onClick={() => {
                          if (!newTypeName.trim()) return;
                          const newId = `type-${Date.now()}`;
                          const next = [...eventTypes, { id: newId, name: newTypeName.trim(), color: newTypeColor }];
                          setEventTypes(next);
                          localStorage.setItem("techcontrol_calendar_event_types", JSON.stringify(next));
                          setEventForm(prev => ({ ...prev, type: newId }));
                          setNewTypeName("");
                          setShowManageTypes(false);
                          toast.success("Tipo de evento agregado");
                        }}
                      >
                        Crear
                      </Button>
                    </div>

                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 bg-background rounded-lg border border-input">
                      {(["sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose", "red", "orange", "amber", "yellow", "lime", "emerald", "teal", "cyan", "gray"] as const).map((colorName) => {
                        const isSelected = newTypeColor === colorName;
                        const bgMap = {
                          sky: "bg-sky-500", blue: "bg-blue-500", indigo: "bg-indigo-500", violet: "bg-violet-500",
                          purple: "bg-purple-500", fuchsia: "bg-fuchsia-500", pink: "bg-pink-500", rose: "bg-rose-500",
                          red: "bg-red-500", orange: "bg-orange-500", amber: "bg-amber-500", yellow: "bg-yellow-500",
                          lime: "bg-lime-500", emerald: "bg-emerald-500", teal: "bg-teal-500", cyan: "bg-cyan-500", gray: "bg-slate-500"
                        };
                        return (
                          <button
                            key={colorName}
                            type="button"
                            className={`w-5.5 h-5.5 rounded-full ${bgMap[colorName]} border-2 transition-transform cursor-pointer hover:scale-110 flex items-center justify-center ${isSelected ? "border-foreground scale-110 shadow-xs" : "border-transparent"}`}
                            onClick={() => setNewTypeColor(colorName)}
                            title={colorName}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <Select
                  value={eventForm.type}
                  onValueChange={(val: any) => setEventForm({ ...eventForm, type: val })}
                >
                  <SelectTrigger id="eventType">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((t) => {
                      const bgMap: Record<string, string> = {
                        sky: "bg-sky-500", blue: "bg-blue-500", indigo: "bg-indigo-500", violet: "bg-violet-500",
                        purple: "bg-purple-500", fuchsia: "bg-fuchsia-500", pink: "bg-pink-500", rose: "bg-rose-500",
                        red: "bg-red-500", orange: "bg-orange-500", amber: "bg-amber-500", yellow: "bg-yellow-500",
                        lime: "bg-lime-500", emerald: "bg-emerald-500", teal: "bg-teal-500", cyan: "bg-cyan-500", gray: "bg-slate-500"
                      };
                      return (
                        <SelectItem key={t.id} value={t.id}>
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full inline-block ${bgMap[t.color] || "bg-slate-500"}`} />
                            {t.name}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Tareas List */}
            <div className="space-y-3 border-t pt-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-muted-foreground uppercase">Tareas del Evento</span>
                  <span className="font-bold text-primary">
                    {eventForm.tasks.filter(t => t.completed).length}/{eventForm.tasks.length} ({eventForm.tasks.length > 0 ? Math.round((eventForm.tasks.filter(t => t.completed).length / eventForm.tasks.length) * 100) : 0}%)
                  </span>
                </div>
                {eventForm.tasks.length > 0 && (
                  <Progress 
                    value={eventForm.tasks.length > 0 ? (eventForm.tasks.filter(t => t.completed).length / eventForm.tasks.length) * 100 : 0} 
                    className="h-1.5 bg-muted-foreground/10" 
                  />
                )}
              </div>
              
              {/* Add Task Input */}
              <div className="flex gap-2">
                <Input
                  id="newTaskInput"
                  placeholder="Escribí una tarea y apretá Enter..."
                  className="h-9 text-xs flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        setEventForm(prev => ({
                          ...prev,
                          tasks: [...prev.tasks, { id: `${Date.now()}-${Math.random()}`, name: val, completed: false }]
                        }));
                        e.currentTarget.value = "";
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shrink-0"
                  onClick={() => {
                    const el = document.getElementById("newTaskInput") as HTMLInputElement;
                    const val = el?.value.trim();
                    if (val) {
                      setEventForm(prev => ({
                        ...prev,
                        tasks: [...prev.tasks, { id: `${Date.now()}-${Math.random()}`, name: val, completed: false }]
                      }));
                      el.value = "";
                    }
                  }}
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              {/* List of current Tasks */}
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                {eventForm.tasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-3 text-center bg-muted/10 rounded-md border border-dashed">
                    No hay tareas cargadas para este evento.
                  </p>
                ) : (
                  eventForm.tasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-2 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors shadow-xs group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => {
                            setEventForm(prev => ({
                              ...prev,
                              tasks: prev.tasks.map(t => t.id === task.id ? { ...t, completed: e.target.checked } : t)
                            }));
                          }}
                          className="h-4 w-4 rounded border-input text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                        />
                        {renamingTaskId === task.id ? (
                          <Input
                            value={renamingTaskName}
                            onChange={(e) => setRenamingTaskName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (renamingTaskName.trim()) {
                                  setEventForm(prev => ({
                                    ...prev,
                                    tasks: prev.tasks.map(t => t.id === task.id ? { ...t, name: renamingTaskName.trim() } : t)
                                  }));
                                }
                                setRenamingTaskId(null);
                              } else if (e.key === "Escape") {
                                setRenamingTaskId(null);
                              }
                            }}
                            onBlur={() => {
                              if (renamingTaskName.trim()) {
                                setEventForm(prev => ({
                                  ...prev,
                                  tasks: prev.tasks.map(t => t.id === task.id ? { ...t, name: renamingTaskName.trim() } : t)
                                }));
                              }
                              setRenamingTaskId(null);
                            }}
                            className="h-7 py-0 px-1.5 text-xs flex-1 font-medium"
                            autoFocus
                          />
                        ) : (
                          <span 
                            className={`text-xs truncate cursor-pointer select-none flex-1 py-0.5 ${task.completed ? "line-through text-muted-foreground font-normal" : "text-foreground font-semibold"}`}
                            onDoubleClick={() => {
                              setRenamingTaskId(task.id);
                              setRenamingTaskName(task.name);
                            }}
                            title="Doble click para renombrar"
                          >
                            {task.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {renamingTaskId !== task.id && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setRenamingTaskId(task.id);
                              setRenamingTaskName(task.name);
                            }}
                            title="Renombrar"
                          >
                            <Edit className="size-3" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded"
                          onClick={() => {
                            setEventForm(prev => ({
                              ...prev,
                              tasks: prev.tasks.filter(t => t.id !== task.id)
                            }));
                          }}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-3 flex flex-row items-center justify-end gap-2 shrink-0">
            <Button onClick={handleSaveEvent}>
              {eventForm.id ? "Guardar Cambios" : "Guardar Evento"}
            </Button>
            <Button variant="outline" onClick={() => setEventDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
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
