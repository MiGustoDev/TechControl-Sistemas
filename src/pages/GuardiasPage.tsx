import { useState, useMemo } from "react";
import { 
  Plus, Search, Edit, Save, Trash2, Clock, Check, 
  FileDown, Printer, Filter, Calendar, 
  FileText, CheckCircle2, AlertCircle, User as UserIcon, Award, 
  ChevronLeft, ChevronRight, Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";

import { GUARDIA_TYPES, getGuardiaTypeShortLabel } from "@/data/guardiaTypes";
import { formatDate, formatToday } from "@/lib/utils-app";
import type { Guardia, User as AppUser } from "@/types";

function formatCollaboratorRole(user: AppUser) {
  if (user.role?.trim()) return user.role.trim();
  if (user.location.toLowerCase().includes("sistemas")) return "Equipo de Sistemas IT";
  return user.location;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function CollaboratorAvatar({
  userName,
  avatarUrl,
}: {
  userName: string;
  avatarUrl?: string | null;
}) {
  const imageUrl = avatarUrl
    ? `${import.meta.env.BASE_URL || "/"}${avatarUrl}`
    : null;

  return (
    <Avatar size="sm" className="size-7 shrink-0 border border-border/50">
      {imageUrl ? (
        <AvatarImage src={imageUrl} alt={userName} className="object-cover" />
      ) : null}
      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-[10px] font-semibold text-white">
        {getInitials(userName)}
      </AvatarFallback>
    </Avatar>
  );
}

export function GuardiasPage() {
  const { guardias, users, addGuardia, updateGuardia, deleteGuardia } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGuardia, setEditingGuardia] = useState<Guardia | null>(null);
  
  // Calendar states
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentCalMonth, setCurrentCalMonth] = useState(new Date().getMonth());
  const [currentCalYear, setCurrentCalYear] = useState(new Date().getFullYear());
  const [selectedCalDate, setSelectedCalDate] = useState<string | null>(null);

  // Default form state
  const defaultForm = {
    date: new Date().toISOString().split("T")[0],
    startTime: "18:00",
    endTime: "22:00",
    userId: "",
    userName: "",
    type: "soporte" as any,
    description: "",
    branchesAffected: "",
    status: "pending_approval" as "pending_approval" | "approved",
    notes: ""
  };

  const [form, setForm] = useState(defaultForm);

  // Colaboradores elegibles para guardias: equipo IT + quienes ya tienen registros
  const usersById = useMemo(() => {
    return new Map(users.map((u) => [u.id, u]));
  }, [users]);

  const guardiaCollaborators = useMemo(() => {
    const guardiaUserIds = new Set(guardias.map((g) => g.userId));
    const eligible = users.filter(
      (u) =>
        u.active &&
        (u.location.toLowerCase().includes("sistemas") || guardiaUserIds.has(u.id))
    );
    return [...eligible].sort((a, b) =>
      a.fullName.localeCompare(b.fullName, "es", { sensitivity: "base" })
    );
  }, [users, guardias]);

  // Handle autocomplete branch selection
  const handleAddBranch = (branch: string) => {
    if (branch === "TODAS") {
      setForm(prev => ({ ...prev, branchesAffected: "Todas las sucursales" }));
      return;
    }
    const current = form.branchesAffected.trim();
    if (!current) {
      setForm(prev => ({ ...prev, branchesAffected: branch }));
    } else if (!current.toLowerCase().includes(branch.toLowerCase())) {
      setForm(prev => ({ ...prev, branchesAffected: `${current}, ${branch}` }));
    }
  };

  // Filtered Guardias
  const filteredGuardias = useMemo(() => {
    return guardias.filter((g) => {
      const matchSearch = 
        g.userName.toLowerCase().includes(search.toLowerCase()) ||
        g.description.toLowerCase().includes(search.toLowerCase()) ||
        (g.branchesAffected ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (g.notes ?? "").toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "all" ? true : g.status === statusFilter;
      const matchType = typeFilter === "all" ? true : g.type === typeFilter;
      const matchUser = userFilter === "all" ? true : g.userId === userFilter;

      return matchSearch && matchStatus && matchType && matchUser;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [guardias, search, statusFilter, typeFilter, userFilter]);

  // Statistics / KPIs
  const stats = useMemo(() => {
    const total = filteredGuardias.length;
    const totalHours = filteredGuardias.reduce((acc, curr) => acc + curr.hours, 0);
    
    const pendingGuardiasList = guardias.filter(g => g.status === "pending_approval");
    const pending = pendingGuardiasList.length;
    const pendingHours = pendingGuardiasList.reduce((acc, curr) => acc + curr.hours, 0);
    
    // Hours this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const hoursThisMonth = guardias
      .filter(g => {
        const d = new Date(g.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, curr) => acc + curr.hours, 0);

    const approvedHoursThisMonth = guardias
      .filter(g => {
        const d = new Date(g.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && g.status === "approved";
      })
      .reduce((acc, curr) => acc + curr.hours, 0);

    // Last registered guardia
    const sortedByDate = [...guardias].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastGuardia = sortedByDate.length > 0 ? sortedByDate[0] : null;

    // 1. Hora Más Concurrente
    const hourCounts: Record<number, number> = {};
    guardias.forEach(g => {
      try {
        const start = parseInt(g.startTime.split(":")[0], 10);
        let end = parseInt(g.endTime.split(":")[0], 10);
        if (end < start) {
          end += 24;
        }
        for (let h = start; h <= end; h++) {
          const hr = h % 24;
          hourCounts[hr] = (hourCounts[hr] || 0) + 1;
        }
      } catch (e) {}
    });
    let busiestHour = -1;
    let maxHourCount = 0;
    Object.entries(hourCounts).forEach(([hStr, count]) => {
      const h = parseInt(hStr, 10);
      if (count > maxHourCount) {
        maxHourCount = count;
        busiestHour = h;
      }
    });

    // 2. Día Más Ajetreado
    const dateMap: Record<string, { hours: number; count: number }> = {};
    guardias.forEach(g => {
      if (!dateMap[g.date]) {
        dateMap[g.date] = { hours: 0, count: 0 };
      }
      dateMap[g.date].hours += g.hours;
      dateMap[g.date].count += 1;
    });
    let busiestDate = "Sin registros";
    let busiestDateStats = { hours: 0, count: 0 };
    Object.entries(dateMap).forEach(([date, statsObj]) => {
      if (statsObj.hours > busiestDateStats.hours) {
        busiestDate = date;
        busiestDateStats = statsObj;
      }
    });

    // Developer hourly breakdown
    const devMap: Record<string, { hours: number; count: number; name: string }> = {};
    guardias.forEach(g => {
      if (!devMap[g.userId]) {
        devMap[g.userId] = { hours: 0, count: 0, name: g.userName };
      }
      devMap[g.userId].hours += g.hours;
      devMap[g.userId].count += 1;
    });

    const devBreakdown = Object.values(devMap).sort((a, b) => b.hours - a.hours);
    const mostActive = devBreakdown.length > 0 ? devBreakdown[0].name : "Ninguno";

    const monthGuardias = guardias.filter((g) => {
      const d = new Date(g.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const monthPending = monthGuardias.filter((g) => g.status === "pending_approval");
    const monthPendingHours = monthPending.reduce((acc, g) => acc + g.hours, 0);

    const pendingByUserMap: Record<string, { name: string; count: number; hours: number }> = {};
    pendingGuardiasList.forEach((g) => {
      if (!pendingByUserMap[g.userId]) {
        pendingByUserMap[g.userId] = { name: g.userName, count: 0, hours: 0 };
      }
      pendingByUserMap[g.userId].count += 1;
      pendingByUserMap[g.userId].hours += g.hours;
    });
    const pendingByUser = Object.values(pendingByUserMap).sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" })
    );

    const approvedHoursAll = guardias
      .filter((g) => g.status === "approved")
      .reduce((acc, g) => acc + g.hours, 0);
    const totalHoursAll = guardias.reduce((acc, g) => acc + g.hours, 0);

    return {
      total,
      totalHours,
      pending,
      pendingHours,
      hoursThisMonth,
      approvedHoursThisMonth,
      monthPendingCount: monthPending.length,
      monthPendingHours,
      pendingByUser,
      approvedHoursAll,
      totalHoursAll,
      lastGuardia,
      busiestHour,
      maxHourCount,
      busiestDate,
      busiestDateStats,
      mostActive,
      devBreakdown,
    };
  }, [filteredGuardias, guardias]);

  const openCreate = (prefilledDate?: string) => {
    setEditingGuardia(null);
    // Auto-select first systems user if available
    const initialUser =
      guardiaCollaborators.length > 0 ? guardiaCollaborators[0] : null;
    setForm({
      ...defaultForm,
      userId: initialUser?.id || "",
      userName: initialUser?.fullName || "",
      date: prefilledDate || new Date().toISOString().split("T")[0]
    });
    setDialogOpen(true);
  };

  const openEdit = (g: Guardia) => {
    setEditingGuardia(g);
    setForm({
      date: g.date,
      startTime: g.startTime,
      endTime: g.endTime,
      userId: g.userId,
      userName: g.userName,
      type: g.type,
      description: g.description,
      branchesAffected: g.branchesAffected || "",
      status: g.status,
      notes: g.notes || ""
    });
    setDialogOpen(true);
  };

  const handleUserSelect = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      setForm(prev => ({
        ...prev,
        userId: selectedUser.id,
        userName: selectedUser.fullName
      }));
    }
  };

  const handleSave = () => {
    if (!form.userId || !form.date || !form.startTime || !form.endTime || !form.description) {
      toast.error("Completá los campos obligatorios (*)");
      return;
    }

    if (editingGuardia) {
      updateGuardia(editingGuardia.id, form);
    } else {
      addGuardia(form);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este registro de guardia?")) {
      deleteGuardia(id);
    }
  };

  const handleToggleStatus = (id: string) => {
    const guardiaObj = guardias.find(g => g.id === id);
    if (guardiaObj) {
      const nextStatus = guardiaObj.status === "approved" ? "pending_approval" : "approved";
      updateGuardia(id, { status: nextStatus });
      toast.success(nextStatus === "approved" ? "Guardia aprobada correctamente" : "Guardia marcada como pendiente");
    }
  };

  const exportToPdf = async () => {
    if (filteredGuardias.length === 0) {
      toast.error("No hay guardias para exportar con los filtros actuales");
      return;
    }
    try {
      const { exportGuardiasPdf } = await import("@/lib/exportGuardiasPdf");
      const ok = exportGuardiasPdf(filteredGuardias);
      if (ok) toast.success("PDF descargado correctamente");
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      toast.error("No se pudo generar el PDF");
    }
  };

  // Browser Print
  const handlePrint = () => {
    window.print();
  };

  const getGuardTypeBadgeColor = (type: string) => {
    switch (type) {
      case "soporte": return "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800";
      case "promocion": return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "actualizacion": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      case "incidencia": return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
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

  // Generate calendar grid
  const pad = (n: number) => n.toString().padStart(2, "0");
  const firstDayIndex = new Date(currentCalYear, currentCalMonth, 1).getDay();
  // Adjust JS day (Sunday=0, Monday=1, ..., Saturday=6) to Lunes=0, ..., Domingo=6
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentCalYear, currentCalMonth, 0).getDate();

  const cells = useMemo(() => {
    const gridCells: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Faded days of previous month
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

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      gridCells.push({
        day,
        dateStr: `${currentCalYear}-${pad(currentCalMonth + 1)}-${pad(day)}`,
        isCurrentMonth: true
      });
    }

    // Faded days of next month to fill to multiple of 7
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

  return (
    <div className="space-y-6 p-6 print:p-0 print:space-y-4">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guardias del Personal IT</h1>
          <p className="text-sm text-muted-foreground">
            Registro, control operativo y visualización de horas de guardia trabajadas fuera de horario.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToPdf}>
            <FileDown className="size-4 mr-1.5" />
            Exportar PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="size-4 mr-1.5" />
            Imprimir Reporte
          </Button>
          <Button onClick={() => openCreate()}>
            <Plus className="size-4 mr-1.5" />
            Registrar Guardia
          </Button>
        </div>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:block border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold text-center text-gray-800">REPORTE OFICIAL DE GUARDIAS IT</h1>
        <p className="text-sm text-center text-gray-500">Generado el: {formatToday()} - Centro de Operaciones IT</p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Horas totales de este mes */}
        <Card className="border-muted-foreground/10 bg-card/65 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <Calendar className="size-10 text-primary" />
          </div>
          <CardHeader className="pb-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Horas totales de este mes</p>
          </CardHeader>
          <CardContent>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">{stats.hoursThisMonth.toFixed(1)} hs</h2>
            <p className="text-xs text-muted-foreground mt-1">Aprobadas + pendientes</p>
          </CardContent>
        </Card>

        {/* 2. Pendientes de aprobación */}
        <Card className="border-muted-foreground/10 bg-card/65 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <AlertCircle className="size-10 text-amber-500" />
          </div>
          <CardHeader className="pb-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pendientes Aprobación</p>
          </CardHeader>
          <CardContent>
            <h2 className={`text-3xl font-extrabold tracking-tight ${stats.pending > 0 ? "text-amber-600 dark:text-amber-400" : ""}`}>
              {stats.pending} {stats.pending === 1 ? "guardia" : "guardias"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">{stats.pendingHours.toFixed(1)} hs esperando revisión</p>
          </CardContent>
        </Card>

        {/* 3. Hora Más Concurrente */}
        <Card className="border-muted-foreground/10 bg-card/65 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <Clock className="size-10 text-sky-500" />
          </div>
          <CardHeader className="pb-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Hora Más Concurrente</p>
          </CardHeader>
          <CardContent className="min-w-0">
            <h2 className="text-3xl font-extrabold tracking-tight text-sky-600 dark:text-sky-400 mt-1">
              {stats.busiestHour !== -1 
                ? `${stats.busiestHour.toString().padStart(2, "0")}:00 hs` 
                : "Sin registros"
              }
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.maxHourCount} {stats.maxHourCount === 1 ? "guardia activa" : "guardias activas"}
            </p>
          </CardContent>
        </Card>

        {/* 4. Día Más Ajetreado */}
        <Card className="border-muted-foreground/10 bg-card/65 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <Award className="size-10 text-purple-500" />
          </div>
          <CardHeader className="pb-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Día Más Ajetreado</p>
          </CardHeader>
          <CardContent className="min-w-0">
            <h2 className="text-2xl font-extrabold tracking-tight text-purple-600 dark:text-purple-400 mt-1">
              {stats.busiestDate !== "Sin registros" 
                ? formatDate(stats.busiestDate) 
                : "Sin registros"
              }
            </h2>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {stats.busiestDate !== "Sin registros"
                ? `${stats.busiestDateStats.hours.toFixed(1)} hs (${stats.busiestDateStats.count} ${stats.busiestDateStats.count === 1 ? "guardia" : "guardias"})`
                : "No hay guardias registradas"
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-muted-foreground/10 pb-2 mb-2 print:hidden">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="font-semibold text-xs h-8"
          >
            <FileText className="size-3.5 mr-1.5" />
            Vista de Lista
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("calendar")}
            className="font-semibold text-xs h-8"
          >
            <Calendar className="size-3.5 mr-1.5" />
            Vista de Calendario
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left / Guardias Content (Takes 2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {viewMode === "list" ? (
            <Card className="border-muted-foreground/10 bg-card/45 backdrop-blur-xs print:border-none print:shadow-none">
            <CardHeader className="pb-3 flex flex-row items-center justify-between print:hidden">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Registros de Guardia ({filteredGuardias.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-wrap items-center gap-3 print:hidden">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar descripción, sucursal..."
                    className="pl-8 h-9 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-1.5">
                  <Filter className="size-3.5 text-muted-foreground shrink-0" />
                  <select
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Todos los Estados</option>
                    <option value="approved">Aprobado</option>
                    <option value="pending_approval">Pendiente</option>
                  </select>
                </div>

                {/* Type filter */}
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Todos los Tipos</option>
                  {GUARDIA_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.shortLabel}
                    </option>
                  ))}
                </select>

                {/* Developer filter */}
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring max-w-[150px]"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                >
                  <option value="all">Todos los Colaboradores</option>
                  {guardiaCollaborators.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <Separator className="print:hidden" />

              {filteredGuardias.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No hay guardias registradas"
                  description="Registra la primera guardia de sistemas utilizando el botón superior."
                  action={
                    <Button onClick={() => openCreate()} size="sm" className="print:hidden">
                      <Plus className="size-4 mr-1.5" /> Registrar Guardia
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {filteredGuardias.map((g) => {
                    const isApproved = g.status === "approved";
                    const collaborator = usersById.get(g.userId);
                    return (
                      <Card 
                        key={g.id} 
                        className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md border border-muted-foreground/10 print:break-inside-avoid print:shadow-none`}
                      >
                        {/* Status side bar indicator */}
                        <div className={`absolute left-0 top-0 h-full w-1 ${isApproved ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                        
                        <CardContent className="p-4 space-y-3">
                          {/* Header of Guardia card */}
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="space-y-1 min-w-[200px]">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground text-sm flex items-center gap-2">
                                  <CollaboratorAvatar
                                    userName={g.userName}
                                    avatarUrl={collaborator?.avatarUrl}
                                  />
                                  {g.userName}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-[10px] h-5 py-0 px-2 uppercase tracking-wide font-semibold ${getGuardTypeBadgeColor(g.type)}`}
                                >
                                  {getGuardiaTypeShortLabel(g.type)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="size-3" />
                                  {formatDate(g.date)}
                                </span>
                                <span className="flex items-center gap-1 font-mono">
                                  <Clock className="size-3" />
                                  {g.startTime} - {g.endTime} ({g.hours} hs)
                                </span>
                              </div>
                            </div>

                            {/* Status Badge & Actions */}
                            <div className="flex items-center gap-2 print:hidden">
                              {/* Quick Approve Button for Boss */}
                              {!isApproved ? (
                                <Button 
                                  variant="outline" 
                                  size="xs" 
                                  className="h-7 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900"
                                  onClick={() => handleToggleStatus(g.id)}
                                  title="Aprobar guardia"
                                >
                                  <Check className="size-3.5 mr-1" />
                                  Aprobar
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="xs" 
                                  className="h-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                                  onClick={() => handleToggleStatus(g.id)}
                                  title="Revertir aprobación"
                                >
                                  Desaprobar
                                </Button>
                              )}

                              <Badge 
                                variant={isApproved ? "default" : "secondary"}
                                className={`text-[10px] h-6 px-2 capitalize cursor-pointer print:cursor-default ${
                                  isApproved 
                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-900"
                                }`}
                                onClick={() => handleToggleStatus(g.id)}
                              >
                                {isApproved ? (
                                  <span className="flex items-center gap-1 font-semibold">
                                    <CheckCircle2 className="size-3" />
                                    Aprobado
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 font-semibold">
                                    <Clock className="size-3" />
                                    Pendiente
                                  </span>
                                )}
                              </Badge>
                            </div>
                            
                            {/* Print status display */}
                            <div className="hidden print:block">
                              <span className={`text-xs font-bold border px-2 py-0.5 rounded ${isApproved ? "border-green-600 text-green-600" : "border-amber-600 text-amber-600"}`}>
                                {isApproved ? "APROBADO" : "PENDIENTE"}
                              </span>
                            </div>
                          </div>

                          {/* Body details */}
                          <div className="text-sm text-foreground/80 pl-5 border-l-2 border-muted/30">
                            <p className="font-medium whitespace-pre-wrap">{g.description}</p>
                            {g.notes && (
                              <p className="text-xs text-muted-foreground mt-2 italic bg-muted/20 p-2 rounded border border-muted/10">
                                <strong>Nota Técnica:</strong> {g.notes}
                              </p>
                            )}
                          </div>

                          {/* Footer details (Branches Affected) */}
                          {g.branchesAffected && (
                            <div className="flex flex-wrap items-center gap-1 text-xs pl-5 text-muted-foreground">
                              <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                              <span className="font-semibold mr-1">Alcance/Sucursales:</span>
                              <div className="flex flex-wrap gap-1">
                                {g.branchesAffected.split(",").map((br, idx) => (
                                  <Badge key={idx} variant="outline" className="text-[10px] bg-background/50 border-muted-foreground/15">
                                    {br.trim()}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-2 pt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 print:hidden">
                            <Button variant="ghost" size="icon-xs" onClick={() => openEdit(g)} title="Editar guardia">
                              <Edit className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon-xs" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(g.id)} title="Eliminar registro">
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-muted-foreground/10 bg-card/45 backdrop-blur-xs print:border-none print:shadow-none">
            <CardHeader className="pb-3 flex flex-row items-center justify-between print:hidden border-b border-muted-foreground/5 mb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                Calendario de Guardias
              </CardTitle>
              
              {/* Month Navigation */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon-xs" className="size-7" onClick={handlePrevMonth} title="Mes anterior">
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-sm font-semibold min-w-[110px] text-center capitalize">
                  {MONTH_NAMES[currentCalMonth]} {currentCalYear}
                </span>
                <Button variant="outline" size="icon-xs" className="size-7" onClick={handleNextMonth} title="Mes siguiente">
                  <ChevronRight className="size-4" />
                </Button>
                <Button variant="ghost" size="xs" onClick={handleGoToday} className="text-xs font-semibold h-7">
                  Hoy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid Header */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-muted-foreground mb-2 border-b border-muted-foreground/5 pb-1">
                {WEEK_DAYS.map(d => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>
              
              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 gap-1.5 auto-rows-[100px]">
                {cells.map((cell, idx) => {
                  const dayGuardias = guardias.filter(g => g.date === cell.dateStr);
                  const isToday = cell.dateStr === new Date().toISOString().split("T")[0];
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (dayGuardias.length > 0) {
                          setSelectedCalDate(cell.dateStr);
                        } else {
                          openCreate(cell.dateStr);
                        }
                      }}
                      className={`group relative rounded-lg border p-1.5 flex flex-col justify-between transition-all cursor-pointer hover:border-primary/40 hover:bg-muted-foreground/5 ${
                        cell.isCurrentMonth
                          ? "bg-background/40 border-muted-foreground/10"
                          : "bg-background/10 border-muted-foreground/5 opacity-40 hover:opacity-80"
                      } ${isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                      title={dayGuardias.length > 0 ? "Hacé click para ver las guardias de este día" : "Hacé click para registrar una guardia en este día"}
                    >
                      {/* Day Number and Add Icon */}
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isToday 
                            ? "bg-primary text-primary-foreground font-black" 
                            : "text-muted-foreground"
                        }`}>
                          {cell.day}
                        </span>
                        <Plus className="size-3 opacity-0 group-hover:opacity-60 transition-opacity text-primary shrink-0" />
                      </div>
                      
                      {/* Guardias in this day */}
                      <div className="flex flex-col gap-1 overflow-y-auto max-h-[70px] mt-1 pr-0.5 scrollbar-thin">
                        {dayGuardias.map(g => {
                          let userColor = "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20";
                          if (g.userId === "usr-031") {
                            userColor = "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-100 dark:border-sky-900/50 hover:bg-sky-100/50 dark:hover:bg-sky-900/50";
                          } else if (g.userId === "usr-076") {
                            userColor = "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-100 dark:border-purple-900/50 hover:bg-purple-100/50 dark:hover:bg-purple-900/50";
                          } else if (g.userId === "usr-039") {
                            userColor = "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-100 dark:border-amber-900/50 hover:bg-amber-100/50 dark:hover:bg-amber-900/50";
                          }
                          
                          return (
                            <button
                              key={g.id}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent opening create dialog
                                openEdit(g);
                              }}
                              className={`w-full text-left text-[9px] font-bold py-0.5 px-1 rounded border transition-all truncate flex items-center justify-between gap-0.5 ${userColor}`}
                              title={`${g.userName}: ${g.description} (${g.hours} hs) - Click para editar`}
                            >
                              <span className="truncate">{g.userName.split(" ")[0]}</span>
                              <span className="shrink-0 text-[8px] opacity-75">{g.hours}h</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

        {/* Right / Boss Overview and Hours Summary (Takes 1 Col) */}
        <div className="space-y-6">
          <Card className="border-muted-foreground/10 bg-card/65 backdrop-blur-sm print:break-inside-avoid">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Award className="size-4 text-primary" />
                Resumen para Jefe de Sistemas
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Totalización de horas y guardias acumuladas por colaborador del equipo.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {stats.devBreakdown.map((dev, index) => (
                  <div key={dev.name} className="flex items-center justify-between p-2.5 rounded-lg border border-muted-foreground/5 bg-background/30 hover:bg-background/60 transition-all">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                        <span className="text-sm font-semibold truncate text-foreground">{dev.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{dev.count} {dev.count === 1 ? "guardia registrada" : "guardias registradas"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-primary font-mono">{dev.hours.toFixed(1)} hs</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Liquidables</p>
                    </div>
                  </div>
                ))}
                {stats.devBreakdown.length === 0 && (
                  <p className="text-xs text-muted-foreground italic text-center py-4">No hay datos acumulados para resumir.</p>
                )}
              </div>

              <Separator />

              <div
                className={`rounded-lg border p-3 text-xs space-y-2 ${
                  stats.pending > 0
                    ? "bg-amber-500/5 border-amber-500/20 text-amber-900 dark:text-amber-300"
                    : "bg-emerald-500/5 border-emerald-500/20 text-emerald-900 dark:text-emerald-300"
                }`}
              >
                <p className="font-bold flex items-center gap-1">
                  {stats.pending > 0 ? (
                    <AlertCircle className="size-3.5 shrink-0" />
                  ) : (
                    <CheckCircle2 className="size-3.5 shrink-0" />
                  )}
                  {stats.pending > 0 ? "Requiere tu revisión" : "Estado al día"}
                </p>

                {stats.pending > 0 ? (
                  <>
                    <p className="text-[11px] leading-relaxed opacity-95">
                      Hay{" "}
                      <span className="font-semibold">
                        {stats.pending} {stats.pending === 1 ? "guardia" : "guardias"}
                      </span>{" "}
                      ({stats.pendingHours.toFixed(1)} hs) sin aprobar. Revisá el detalle en la lista
                      y confirmá con <span className="font-semibold">Aprobar</span> antes de liquidar.
                    </p>
                    <ul className="text-[11px] leading-relaxed opacity-95 space-y-0.5 pl-3 list-disc">
                      {stats.pendingByUser.map((u) => (
                        <li key={u.name}>
                          {u.name}: {u.count} {u.count === 1 ? "pendiente" : "pendientes"} (
                          {u.hours.toFixed(1)} hs)
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-[11px] leading-relaxed opacity-95">
                    No hay guardias pendientes. Podés exportar el PDF como respaldo para RRHH o
                    liquidación.
                  </p>
                )}

                <Separator className="opacity-40" />

                <p className="text-[11px] leading-relaxed opacity-90">
                  <span className="font-semibold">Mes en curso:</span>{" "}
                  {stats.approvedHoursThisMonth.toFixed(1)} hs aprobadas de{" "}
                  {stats.hoursThisMonth.toFixed(1)} hs registradas
                  {stats.monthPendingCount > 0 && (
                    <>
                      {" "}
                      · {stats.monthPendingHours.toFixed(1)} hs aún pendientes
                    </>
                  )}
                  .
                </p>
                <p className="text-[11px] leading-relaxed opacity-90">
                  <span className="font-semibold">Histórico del equipo:</span>{" "}
                  {stats.approvedHoursAll.toFixed(1)} hs aprobadas de{" "}
                  {stats.totalHoursAll.toFixed(1)} hs totales en el sistema.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Register/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingGuardia ? "Modificar Registro de Guardia" : "Registrar Nueva Guardia de Sistemas"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Colaborador */}
            <div className="grid gap-2">
              <Label htmlFor="userId">Colaborador *</Label>
              <Select
                value={form.userId || undefined}
                onValueChange={handleUserSelect}
              >
                <SelectTrigger id="userId" className="h-auto min-h-9 py-2">
                  <SelectValue placeholder="Seleccioná un colaborador del equipo IT..." />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-72">
                  <SelectGroup>
                    <SelectLabel>Equipo de Sistemas IT</SelectLabel>
                    {guardiaCollaborators.map((u) => (
                      <SelectItem
                        key={u.id}
                        value={u.id}
                        className="items-start py-2.5"
                      >
                        <span className="flex flex-col gap-0.5 text-left">
                          <span className="font-medium leading-tight">{u.fullName}</span>
                          <span className="text-xs text-muted-foreground font-normal">
                            {formatCollaboratorRole(u)}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Date and Times */}
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2 col-span-1">
                <Label htmlFor="date">Fecha *</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={form.date} 
                  onChange={(e) => setForm({ ...form, date: e.target.value })} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startTime">Hora Inicio *</Label>
                <Input 
                  id="startTime" 
                  type="time" 
                  value={form.startTime} 
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">Hora Fin *</Label>
                <Input 
                  id="endTime" 
                  type="time" 
                  value={form.endTime} 
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })} 
                />
              </div>
            </div>

            {/* Tipo / motivo */}
            <div className="grid gap-2">
              <Label htmlFor="type">Motivo / Tipo de Guardia *</Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm({ ...form, type: value as Guardia["type"] })
                }
              >
                <SelectTrigger id="type" className="h-auto min-h-9 py-2">
                  <SelectValue placeholder="Seleccioná el motivo de la guardia..." />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-80">
                  {GUARDIA_TYPES.map((t) => (
                    <SelectItem
                      key={t.value}
                      value={t.value}
                      className="items-start py-2.5"
                    >
                      <span className="flex flex-col gap-0.5 text-left">
                        <span className="font-medium leading-tight">{t.label}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {t.description}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Branches affected */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="branchesAffected">Alcance / Sucursales afectadas</Label>
                <span className="text-[10px] text-muted-foreground">Opcional</span>
              </div>
              <Input 
                id="branchesAffected" 
                placeholder="Ej. Belgrano, San Miguel, Online" 
                value={form.branchesAffected} 
                onChange={(e) => setForm({ ...form, branchesAffected: e.target.value })} 
              />
              {/* Branch quick recommendation tags */}
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="text-[10px] text-muted-foreground self-center mr-1">Sugeridos:</span>
                {["TODAS", "San Miguel", "Palermo", "Belgrano", "Florida", "Jose C Paz", "Ballester"].map(br => (
                  <button
                    key={br}
                    type="button"
                    className="text-[10px] border rounded-md px-1.5 py-0.5 bg-muted/40 hover:bg-muted-foreground/10 transition-colors"
                    onClick={() => handleAddBranch(br)}
                  >
                    {br}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción detallada del Trabajo *</Label>
              <textarea
                id="description"
                placeholder="Indicar qué se realizó (ej: Reestablecimiento de base de datos tras corte de luz o monitoreo de carga en server durante promo)"
                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Technical notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas técnicas / Observaciones</Label>
              <textarea
                id="notes"
                placeholder="Ej: Se coordinó con Fibertel, IP wan cambió a..."
                className="flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            {/* Status (Pending/Approved) */}
            <div className="flex items-center gap-2 mt-2 bg-muted/30 p-2.5 rounded-lg border border-muted/50">
              <input 
                type="checkbox" 
                id="statusCheck" 
                checked={form.status === "approved"} 
                onChange={(e) => setForm({ ...form, status: e.target.checked ? "approved" : "pending_approval" })}
                className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <div className="grid">
                <Label htmlFor="statusCheck" className="cursor-pointer font-bold text-xs">Aprobar Guardia Inmediatamente</Label>
                <span className="text-[10px] text-muted-foreground">Si sos el jefe o registrás una guardia ya autorizada</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>
              <Save className="size-4 mr-1.5" />
              Guardar Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Guardias del Día */}
      <Dialog 
        open={!!selectedCalDate} 
        onOpenChange={(open) => {
          if (!open) setSelectedCalDate(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-muted-foreground/10 pb-4 mb-4">
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Calendar className="size-5 text-primary" />
                Guardias del día: {selectedCalDate ? formatDate(selectedCalDate) : ""}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Registros activos y control operativo para esta jornada.
              </p>
            </div>
            {selectedCalDate && (
              <Button 
                onClick={() => {
                  const dateToPass = selectedCalDate;
                  setSelectedCalDate(null);
                  openCreate(dateToPass);
                }} 
                size="sm" 
                className="gap-1.5 h-8 mr-6 print:hidden"
              >
                <Plus className="size-3.5" /> 
                Registrar Nueva
              </Button>
            )}
          </DialogHeader>

          <div className="space-y-4 py-2">
            {selectedCalDate && (() => {
              const dayGuardias = guardias.filter(g => g.date === selectedCalDate);
              
              if (dayGuardias.length === 0) {
                return (
                  <p className="text-sm text-center text-muted-foreground py-8">
                    No hay guardias registradas para este día.
                  </p>
                );
              }
              
              return (
                <div className="space-y-4">
                  {dayGuardias.map((g) => {
                    const isApproved = g.status === "approved";
                    return (
                      <Card 
                        key={g.id} 
                        className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md border border-muted-foreground/10`}
                      >
                        {/* Status side bar indicator */}
                        <div className={`absolute left-0 top-0 h-full w-1 ${isApproved ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                        
                        <CardContent className="p-4 space-y-3">
                          {/* Header of Guardia card */}
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="space-y-1 min-w-[200px]">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                                  <UserIcon className="size-3.5 text-muted-foreground" />
                                  {g.userName}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-[10px] h-5 py-0 px-2 uppercase tracking-wide font-semibold ${getGuardTypeBadgeColor(g.type)}`}
                                >
                                  {getGuardiaTypeShortLabel(g.type)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="size-3" />
                                  {formatDate(g.date)}
                                </span>
                                <span className="flex items-center gap-1 font-mono">
                                  <Clock className="size-3" />
                                  {g.startTime} - {g.endTime} ({g.hours} hs)
                                </span>
                              </div>
                            </div>

                            {/* Status Badge & Actions */}
                            <div className="flex items-center gap-2">
                              {/* Quick Approve Button for Boss */}
                              {!isApproved ? (
                                <Button 
                                  variant="outline" 
                                  size="xs" 
                                  className="h-7 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900"
                                  onClick={() => handleToggleStatus(g.id)}
                                  title="Aprobar guardia"
                                >
                                  <Check className="size-3.5 mr-1" />
                                  Aprobar
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="xs" 
                                  className="h-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                                  onClick={() => handleToggleStatus(g.id)}
                                  title="Revertir aprobación"
                                >
                                  Desaprobar
                                </Button>
                              )}

                              <Badge 
                                variant={isApproved ? "default" : "secondary"}
                                className={`text-[10px] h-6 px-2 capitalize cursor-pointer ${
                                  isApproved 
                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-900"
                                }`}
                                onClick={() => handleToggleStatus(g.id)}
                              >
                                {isApproved ? (
                                  <span className="flex items-center gap-1 font-semibold">
                                    <CheckCircle2 className="size-3" />
                                    Aprobado
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 font-semibold">
                                    <Clock className="size-3" />
                                    Pendiente
                                  </span>
                                )}
                              </Badge>
                            </div>
                          </div>

                          {/* Body details */}
                          <div className="text-sm text-foreground/80 pl-5 border-l-2 border-muted/30">
                            <p className="font-medium whitespace-pre-wrap">{g.description}</p>
                            {g.notes && (
                              <p className="text-xs text-muted-foreground mt-2 italic bg-muted/20 p-2 rounded border border-muted/10">
                                <strong>Nota Técnica:</strong> {g.notes}
                              </p>
                            )}
                          </div>

                          {/* Footer details (Branches Affected) */}
                          {g.branchesAffected && (
                            <div className="flex flex-wrap items-center gap-1 text-xs pl-5 text-muted-foreground">
                              <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                              <span className="font-semibold mr-1">Alcance/Sucursales:</span>
                              <div className="flex flex-wrap gap-1">
                                {g.branchesAffected.split(",").map((br, idx) => (
                                  <Badge key={idx} variant="outline" className="text-[10px] bg-background/50 border-muted-foreground/15">
                                    {br.trim()}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-2 pt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                            <Button 
                              variant="ghost" 
                              size="icon-xs" 
                              onClick={() => {
                                setSelectedCalDate(null);
                                openEdit(g);
                              }} 
                              title="Editar guardia"
                            >
                              <Edit className="size-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon-xs" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                              onClick={() => handleDelete(g.id)} 
                              title="Eliminar registro"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
