import type {
  Category,
  ItemStatus,
  PrinterStatus,
  NotebookStatus,
  OrderStatus,
  OrderPriority,
  MovementType,
} from "../types";

/** Parsea fechas ISO (yyyy-mm-dd o con hora) en hora local, sin corrimiento de día. */
function parseAppDate(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(dateStr)) {
    const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
    const time = dateStr.slice(11).replace(/Z$/, "");
    const [hh = 0, mm = 0, ss = 0] = time.split(":").map((n) => parseInt(n, 10) || 0);
    return new Date(y, m - 1, d, hh, mm, ss);
  }

  return new Date(dateStr);
}

/** Formato estándar de la app: dd/mm/aaaa */
export function formatDate(dateStr: string): string {
  const d = parseAppDate(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Fecha y hora: dd/mm/aaaa HH:mm */
export function formatDateTime(dateStr: string): string {
  const d = parseAppDate(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;

  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(dateStr)} ${hours}:${minutes}`;
}

/** Fecha de hoy en formato dd/mm/aaaa */
export function formatToday(): string {
  const now = new Date();
  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return formatDate(iso);
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
    ok: "text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/20",
    "toner-low": "text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/20",
    "image-unit-low": "text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/20",
    maintenance: "text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/20",
    offline: "text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-500/10 border-slate-300 dark:border-slate-500/20",
  };
  return map[s] ?? "text-muted-foreground bg-muted border-border";
}

export function notebookStatusColor(s: NotebookStatus): string {
  const map: Record<NotebookStatus, string> = {
    "in-use": "text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/20",
    "in-repair": "text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/20",
    "in-stock": "text-sky-800 dark:text-sky-400 bg-sky-100 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/20",
    loaned: "text-violet-800 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/10 border-violet-300 dark:border-violet-500/20",
    decommissioned: "text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/20",
  };
  return map[s] ?? "text-muted-foreground bg-muted border-border";
}

export function orderStatusColor(s: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    requested: "text-sky-800 dark:text-sky-400 bg-sky-100 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/20",
    "in-process": "text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/20",
    ordered: "text-violet-800 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/10 border-violet-300 dark:border-violet-500/20",
    delivered: "text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/20",
    returned: "text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-500/10 border-slate-300 dark:border-slate-500/20",
    cancelled: "text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/20",
  };
  return map[s] ?? "text-muted-foreground bg-muted border-border";
}

export function orderPriorityColor(p: OrderPriority): string {
  const map: Record<OrderPriority, string> = {
    low: "bg-slate-500 text-white border-transparent",
    medium: "bg-amber-500 text-white border-transparent",
    high: "bg-orange-500 text-white border-transparent",
    critical: "bg-rose-500 text-white border-transparent",
  };
  return map[p] ?? "bg-muted text-muted-foreground border-transparent";
}

export function itemStatusColor(s: ItemStatus): string {
  const map: Record<ItemStatus, string> = {
    active: "text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/20",
    low: "text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/20",
    out: "text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/20",
    discontinued: "text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-500/10 border-slate-300 dark:border-slate-500/20",
  };
  return map[s] ?? "text-muted-foreground bg-muted border-border";
}

export function movementTypeColor(t: MovementType): string {
  const map: Record<MovementType, string> = {
    entry: "text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/20",
    exit: "text-sky-800 dark:text-sky-400 bg-sky-100 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/20",
    return: "text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/20",
    reassignment: "text-violet-800 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/10 border-violet-300 dark:border-violet-500/20",
    loan: "text-orange-800 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/10 border-orange-300 dark:border-orange-500/20",
    adjustment: "text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-500/10 border-slate-300 dark:border-slate-500/20",
    decommission: "text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/20",
    repair: "text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/20",
  };
  return map[t] ?? "text-muted-foreground bg-muted border-border";
}

export function levelColor(level: number): string {
  if (level <= 15) return "bg-rose-500";
  if (level <= 30) return "bg-amber-500";
  return "bg-emerald-500";
}
