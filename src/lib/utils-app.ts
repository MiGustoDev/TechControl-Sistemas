import type {
  Category,
  ItemStatus,
  PrinterStatus,
  NotebookStatus,
  OrderStatus,
  OrderPriority,
  MovementType,
} from "../types";

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function categoryLabel(cat: Category): string {
  const map: Record<Category, string> = {
    printer: "Impresora",
    toner: "Toner",
    "image-unit": "Unidad de Imagen",
    notebook: "Notebook",
    peripheral: "Periférico",
    cable: "Cable",
    accessory: "Accesorio",
    desktop: "PC de Escritorio",
    monitor: "Monitor",
    other: "Otro",
  };
  return map[cat] ?? cat;
}

export function itemStatusLabel(s: ItemStatus): string {
  const map: Record<ItemStatus, string> = {
    active: "OK",
    low: "Stock Bajo",
    out: "Sin Stock",
    discontinued: "Descontinuado",
  };
  return map[s] ?? s;
}

export function printerStatusLabel(s: PrinterStatus): string {
  const map: Record<PrinterStatus, string> = {
    ok: "OK",
    "toner-low": "Toner Bajo",
    "image-unit-low": "Unidad Imagen Baja",
    maintenance: "En Mantenimiento",
    offline: "Sin Conexión",
  };
  return map[s] ?? s;
}

export function notebookStatusLabel(s: NotebookStatus): string {
  const map: Record<NotebookStatus, string> = {
    "in-use": "En Uso",
    "in-repair": "En Reparación",
    "in-stock": "En Stock",
    loaned: "Prestada",
    decommissioned: "Dada de Baja",
  };
  return map[s] ?? s;
}

export function orderStatusLabel(s: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    requested: "Solicitado",
    "in-process": "En Proceso",
    ordered: "Pedido Realizado",
    delivered: "Entregado",
    returned: "Devuelto",
    cancelled: "Cancelado",
  };
  return map[s] ?? s;
}

export function orderPriorityLabel(p: OrderPriority): string {
  const map: Record<OrderPriority, string> = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
    critical: "Crítica",
  };
  return map[p] ?? p;
}

export function movementTypeLabel(t: MovementType): string {
  const map: Record<MovementType, string> = {
    entry: "Ingreso",
    exit: "Egreso",
    return: "Devolución",
    reassignment: "Reasignación",
    loan: "Préstamo",
    adjustment: "Ajuste",
    decommission: "Baja",
    repair: "Reparación",
  };
  return map[t] ?? t;
}

export function printerStatusColor(s: PrinterStatus): string {
  const map: Record<PrinterStatus, string> = {
    ok: "text-emerald-600 bg-emerald-50 border-emerald-200",
    "toner-low": "text-amber-600 bg-amber-50 border-amber-200",
    "image-unit-low": "text-amber-600 bg-amber-50 border-amber-200",
    maintenance: "text-rose-600 bg-rose-50 border-rose-200",
    offline: "text-slate-500 bg-slate-50 border-slate-200",
  };
  return map[s] ?? "text-muted-foreground bg-muted border-border";
}

export function notebookStatusColor(s: NotebookStatus): string {
  const map: Record<NotebookStatus, string> = {
    "in-use": "text-emerald-600 bg-emerald-50 border-emerald-200",
    "in-repair": "text-amber-600 bg-amber-50 border-amber-200",
    "in-stock": "text-sky-600 bg-sky-50 border-sky-200",
    loaned: "text-violet-600 bg-violet-50 border-violet-200",
    decommissioned: "text-rose-600 bg-rose-50 border-rose-200",
  };
  return map[s] ?? "text-muted-foreground bg-muted border-border";
}

export function orderStatusColor(s: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    requested: "text-sky-600 bg-sky-50 border-sky-200",
    "in-process": "text-amber-600 bg-amber-50 border-amber-200",
    ordered: "text-violet-600 bg-violet-50 border-violet-200",
    delivered: "text-emerald-600 bg-emerald-50 border-emerald-200",
    returned: "text-slate-500 bg-slate-50 border-slate-200",
    cancelled: "text-rose-600 bg-rose-50 border-rose-200",
  };
  return map[s] ?? "text-muted-foreground bg-muted border-border";
}

export function orderPriorityColor(p: OrderPriority): string {
  const map: Record<OrderPriority, string> = {
    low: "text-slate-600 bg-slate-50 border-slate-200",
    medium: "text-amber-600 bg-amber-50 border-amber-200",
    high: "text-orange-600 bg-orange-50 border-orange-200",
    critical: "text-rose-600 bg-rose-50 border-rose-200",
  };
  return map[p] ?? "text-muted-foreground bg-muted border-border";
}

export function itemStatusColor(s: ItemStatus): string {
  const map: Record<ItemStatus, string> = {
    active: "text-emerald-600 bg-emerald-50 border-emerald-200",
    low: "text-amber-600 bg-amber-50 border-amber-200",
    out: "text-rose-600 bg-rose-50 border-rose-200",
    discontinued: "text-slate-500 bg-slate-50 border-slate-200",
  };
  return map[s] ?? "text-muted-foreground bg-muted border-border";
}

export function movementTypeColor(t: MovementType): string {
  const map: Record<MovementType, string> = {
    entry: "text-emerald-600 bg-emerald-50 border-emerald-200",
    exit: "text-sky-600 bg-sky-50 border-sky-200",
    return: "text-amber-600 bg-amber-50 border-amber-200",
    reassignment: "text-violet-600 bg-violet-50 border-violet-200",
    loan: "text-orange-600 bg-orange-50 border-orange-200",
    adjustment: "text-slate-600 bg-slate-50 border-slate-200",
    decommission: "text-rose-600 bg-rose-50 border-rose-200",
    repair: "text-amber-600 bg-amber-50 border-amber-200",
  };
  return map[t] ?? "text-muted-foreground bg-muted border-border";
}

export function levelColor(level: number): string {
  if (level <= 15) return "bg-rose-500";
  if (level <= 30) return "bg-amber-500";
  return "bg-emerald-500";
}
