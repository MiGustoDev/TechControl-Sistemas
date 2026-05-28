export type Category =
  | "printer"
  | "toner"
  | "image-unit"
  | "notebook"
  | "desktop"
  | "peripheral"
  | "cable"
  | "accessory"
  | "monitor"
  | "other";

export type ItemStatus = "active" | "low" | "out" | "discontinued";

export type PrinterStatus = "ok" | "toner-low" | "image-unit-low" | "maintenance" | "offline";

export type NotebookStatus = "in-use" | "in-repair" | "in-stock" | "loaned" | "decommissioned";

export type OrderStatus =
  | "requested"
  | "in-process"
  | "ordered"
  | "delivered"
  | "returned"
  | "cancelled";

export type OrderPriority = "low" | "medium" | "high" | "critical";

export type MovementType =
  | "entry"
  | "exit"
  | "return"
  | "reassignment"
  | "loan"
  | "adjustment"
  | "decommission"
  | "repair";

export interface StockItem {
  id: string;
  name: string;
  category: Category;
  internalCode: string;
  currentStock: number;
  minStock: number;
  location: string;
  status: ItemStatus;
  supplier?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Printer {
  id: string;
  name: string;
  code: string;
  brand: string;
  model: string;
  branch: string;
  sector: string;
  status: PrinterStatus;
  tonerModel: string;
  tonerLevel: number; // 0-100
  imageUnitModel: string;
  imageUnitLevel: number; // 0-100
  lastTonerChange?: string;
  lastImageUnitChange?: string;
  notes?: string;
  ipAddress?: string;
  serialNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotebookAssignment {
  id: string;
  notebookId: string;
  userId: string;
  userName: string;
  area: string;
  assignedAt: string;
  expectedReturnAt?: string;
  returnedAt?: string;
  type: "permanent" | "loan";
  notes?: string;
}

export interface Notebook {
  id: string;
  category: "notebook" | "desktop";
  brand: string;
  model: string;
  serialNumber: string;
  internalCode: string;
  processor: string;
  ram: string;
  storage: string;
  screenSize: string;
  os: string;
  physicalCondition: "excellent" | "good" | "fair" | "poor";
  functionalStatus: "working" | "partial" | "not-working";
  status: NotebookStatus;
  currentAssignment?: NotebookAssignment;
  assignmentHistory: NotebookAssignment[];
  entryDate: string;
  lastReviewDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderHistoryEntry {
  id: string;
  orderId: string;
  status: OrderStatus;
  date: string;
  notes?: string;
  changedBy: string;
}

export interface Order {
  id: string;
  itemName: string;
  quantity: number;
  category: Category;
  reason: string;
  priority: OrderPriority;
  requestedAt: string;
  requestedBy: string;
  status: OrderStatus;
  history: OrderHistoryEntry[];
  relatedItemId?: string;
  notes?: string;
  expectedDeliveryDate?: string;
}

export interface Movement {
  id: string;
  date: string;
  user: string;
  type: MovementType;
  itemId: string;
  itemName: string;
  itemCategory: Category;
  quantity?: number;
  reason: string;
  relatedOrderId?: string;
  relatedAssetId?: string;
  notes?: string;
}

export interface DataliveTV {
  id: string;
  branch: string;
  name: string; // ej. TV1, TV2, VIDEOWALL1
  user: string;
  deviceId: string;
  pin: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Monitor {
  id: string;
  category: "monitor";
  brand: string;
  model: string;
  serialNumber?: string;
  internalCode?: string;
  size?: string;
  status: NotebookStatus;
  physicalCondition: "excellent" | "good" | "fair" | "poor";
  currentAssignment?: {
    userId?: string;
    userName: string;
    area: string;
    assignedAt: string;
    linkedComputerCode?: string; // e.g. DSKMGARM001
  };
  location: string;
  entryDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  location: string;
  active: boolean;
  role?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Guardia {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  userId: string;
  userName: string;
  type: "soporte" | "promocion" | "actualizacion" | "incidencia" | "otro";
  description: string;
  branchesAffected?: string;
  status: "pending_approval" | "approved";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

