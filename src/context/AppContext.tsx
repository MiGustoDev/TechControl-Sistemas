import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type {
  StockItem,
  Printer,
  Notebook,
  Order,
  Movement,
  OrderStatus,
  NotebookStatus,
  DataliveTV,
  Monitor,
  User,
  Guardia,
} from "../types";
import {
  stockItems as initialItems,
  printers as initialPrinters,
  notebooks as initialNotebooks,
  monitors as initialMonitors,
  users as initialUsers,
  orders as initialOrders,
  movements as initialMovements,
  dataliveTVs as initialTVs,
  guardias as initialGuardias,
} from "../data/mock";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

function guardiaFromDb(g: Record<string, unknown>): Guardia {
  return {
    id: g.id as string,
    date: g.date as string,
    startTime: g.start_time as string,
    endTime: g.end_time as string,
    hours: Number(g.hours),
    userId: g.user_id as string,
    userName: g.user_name as string,
    type: g.type as Guardia["type"],
    description: g.description as string,
    branchesAffected: (g.branches_affected as string) || undefined,
    status: g.status as Guardia["status"],
    notes: (g.notes as string) || undefined,
    createdAt: g.created_at as string,
    updatedAt: g.updated_at as string,
  };
}

function guardiaToDb(g: Guardia) {
  return {
    id: g.id,
    date: g.date,
    start_time: g.startTime,
    end_time: g.endTime,
    hours: g.hours,
    user_id: g.userId,
    user_name: g.userName,
    type: g.type,
    description: g.description,
    branches_affected: g.branchesAffected || "",
    status: g.status,
    notes: g.notes || "",
    created_at: g.createdAt,
    updated_at: g.updatedAt,
  };
}

function dedupeGuardias(list: Guardia[]): Guardia[] {
  const byId = new Map<string, Guardia>();
  for (const g of list) byId.set(g.id, g);
  return Array.from(byId.values());
}

interface AppContextValue {
  // Data
  stockItems: StockItem[];
  printers: Printer[];
  notebooks: Notebook[];
  monitors: Monitor[];
  users: User[];
  orders: Order[];
  movements: Movement[];
  dataliveTVs: DataliveTV[];
  guardias: Guardia[];

  // Stock actions
  addStockItem: (item: Omit<StockItem, "id" | "createdAt" | "updatedAt">) => void;
  updateStockItem: (id: string, data: Partial<StockItem>) => void;
  deleteStockItem: (id: string) => void;

  // Printer actions
  addPrinter: (p: Omit<Printer, "id" | "createdAt" | "updatedAt">) => void;
  updatePrinter: (id: string, data: Partial<Printer>) => void;
  deletePrinter: (id: string) => void;

  // Notebook actions
  addNotebook: (n: Omit<Notebook, "id" | "createdAt" | "updatedAt">) => void;
  updateNotebook: (id: string, data: Partial<Notebook>) => void;
  updateNotebookStatus: (id: string, status: NotebookStatus) => void;
  deleteNotebook: (id: string) => void;

  // Monitor actions
  addMonitor: (m: Omit<Monitor, "id" | "createdAt" | "updatedAt">) => void;
  updateMonitor: (id: string, data: Partial<Monitor>) => void;
  deleteMonitor: (id: string) => void;

  // User actions
  addUser: (u: Omit<User, "id" | "createdAt" | "updatedAt">) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Order actions
  addOrder: (o: Omit<Order, "id" | "requestedAt" | "history">) => void;
  updateOrder: (id: string, data: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: OrderStatus, notes?: string, changedBy?: string) => void;
  deleteOrder: (id: string) => void;

  // Movement actions
  addMovement: (m: Omit<Movement, "id">) => void;

  // DataliveTV actions
  addDataliveTV: (tv: Omit<DataliveTV, "id" | "createdAt" | "updatedAt">) => void;
  updateDataliveTV: (id: string, data: Partial<DataliveTV>) => void;
  deleteDataliveTV: (id: string) => void;

  // Guardia actions
  addGuardia: (g: Omit<Guardia, "id" | "createdAt" | "updatedAt" | "hours">) => void;
  updateGuardia: (id: string, data: Partial<Guardia>) => void;
  deleteGuardia: (id: string) => void;

  // Navigation state
  currentPage: string;
  setCurrentPage: (page: string) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  loading: boolean;
  migrateAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [stockItems, setStockItems] = useState<StockItem[]>(initialItems);
  const [printers, setPrinters] = useState<Printer[]>(initialPrinters);
  const [notebooks, setNotebooks] = useState<Notebook[]>(initialNotebooks);
  const [monitors, setMonitors] = useState<Monitor[]>(initialMonitors);
  const [users, setUsers] = useState<User[]>(() => [
    {
      id: "usr-031",
      username: "facundo.carrizo",
      fullName: "Facundo Carrizo",
      email: "facundocarrizo@migusto.com.ar",
      location: "Sistemas",
      role: "Analista de sistemas / Programador",
      avatarUrl: "Colaboradores/Facu.jpg",
      active: true,
      createdAt: "2026-01-01T08:00:00Z",
      updatedAt: "2026-01-01T08:00:00Z"
    },
    {
      id: "usr-076",
      username: "ramiro.lacci",
      fullName: "Ramiro Lacci",
      email: "ramirolacci@migusto.com.ar",
      location: "Sistemas",
      role: "Analista de sistemas / Programador",
      avatarUrl: "Colaboradores/Rami.jpg",
      active: true,
      createdAt: "2026-01-01T08:00:00Z",
      updatedAt: "2026-01-01T08:00:00Z"
    },
    {
      id: "usr-039",
      username: "gustavo.gonzalez",
      fullName: "Gustavo Gonzalez",
      email: "gustavogonzalez@migusto.com.ar",
      location: "Sistemas",
      role: "Jefe de sistemas / Lider tecnico",
      avatarUrl: "Colaboradores/Gus.jpg",
      active: true,
      createdAt: "2026-01-01T08:00:00Z",
      updatedAt: "2026-01-01T08:00:00Z"
    }
  ]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [dataliveTVs, setDataliveTVs] = useState<DataliveTV[]>([]);
  const [guardias, setGuardias] = useState<Guardia[]>(() => {
    const local = localStorage.getItem("techcontrol_guardias");
    if (local) {
      try {
        const parsed = JSON.parse(local) as Guardia[];
        // Si no existen guardias de Facundo (usr-031), re-sincronizamos con las nuevas guardias iniciales
        const hasFacundo = parsed.some(g => g.userId === "usr-031");
        if (!hasFacundo) {
          localStorage.setItem("techcontrol_guardias", JSON.stringify(initialGuardias));
          return initialGuardias;
        }
        return parsed;
      } catch (e) {
        console.error("Error parsing local guardias", e);
      }
    }
    return initialGuardias;
  });
  const [currentPage, setCurrentPage] = useState("guardias");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: items },
        { data: pts },
        { data: nbs },
        { data: mons },
        { data: usr },
        { data: ords },
        { data: movs },
        { data: tvs }
      ] = await Promise.all([
        supabase.from("stock_items").select("*"),
        supabase.from("printers").select("*"),
        supabase.from("notebooks").select("*"),
        supabase.from("monitors").select("*"),
        supabase.from("users").select("*"),
        supabase.from("orders").select("*"),
        supabase.from("movements").select("*"),
        supabase.from("datalive_tvs").select("*")
      ]);

      if (items) setStockItems(items.map(i => ({
        ...i,
        internalCode: i.internal_code,
        currentStock: i.current_stock,
        minStock: i.min_stock,
        createdAt: i.created_at,
        updatedAt: i.updated_at
      })));

      if (pts) setPrinters(pts.map(p => ({
        ...p,
        tonerModel: p.toner_model,
        tonerLevel: p.toner_level,
        imageUnitModel: p.image_unit_model,
        imageUnitLevel: p.image_unit_level,
        lastTonerChange: p.last_toner_change,
        lastImageUnitChange: p.last_image_unit_change,
        ipAddress: p.ip_address,
        serialNumber: p.serial_number,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      })));

      if (nbs) setNotebooks(nbs.map(n => ({
        ...n,
        serialNumber: n.serial_number,
        internalCode: n.internal_code,
        functionalStatus: n.functional_status,
        physicalCondition: n.physical_condition,
        currentAssignment: n.current_assignment,
        assignmentHistory: n.assignment_history,
        entryDate: n.entry_date,
        lastReviewDate: n.last_review_date,
        createdAt: n.created_at,
        updatedAt: n.updated_at
      })));

      if (mons) setMonitors(mons.map(m => ({
        ...m,
        serialNumber: m.serial_number,
        internalCode: m.internal_code,
        physicalCondition: m.physical_condition,
        currentAssignment: m.current_assignment,
        entryDate: m.entry_date,
        createdAt: m.created_at,
        updatedAt: m.updated_at
      })));

      if (usr) {
        const allowedUsernames = ["facundo.carrizo", "ramiro.lacci", "gustavo.gonzalez"];
        const filteredUsrs = usr
          .filter(u => allowedUsernames.includes(u.username))
          .map(u => {
            let role = "Analista de sistemas / Programador";
            if (u.username === "gustavo.gonzalez") {
              role = "Jefe de sistemas / Lider tecnico";
            }
            return {
              ...u,
              fullName: u.full_name,
              role,
              createdAt: u.created_at,
              updatedAt: u.updated_at
            };
          });

        const defaultTeam = [
          {
            id: "usr-031",
            username: "facundo.carrizo",
            fullName: "Facundo Carrizo",
            email: "facundocarrizo@migusto.com.ar",
            location: "Sistemas",
            role: "Analista de sistemas / Programador",
            avatarUrl: "Colaboradores/Facu.jpg",
            active: true,
            createdAt: "2026-01-01T08:00:00Z",
            updatedAt: "2026-01-01T08:00:00Z"
          },
          {
            id: "usr-076",
            username: "ramiro.lacci",
            fullName: "Ramiro Lacci",
            email: "ramirolacci@migusto.com.ar",
            location: "Sistemas",
            role: "Analista de sistemas / Programador",
            avatarUrl: "Colaboradores/Rami.jpg",
            active: true,
            createdAt: "2026-01-01T08:00:00Z",
            updatedAt: "2026-01-01T08:00:00Z"
          },
          {
            id: "usr-039",
            username: "gustavo.gonzalez",
            fullName: "Gustavo Gonzalez",
            email: "gustavogonzalez@migusto.com.ar",
            location: "Sistemas",
            role: "Jefe de sistemas / Lider tecnico",
            avatarUrl: "Colaboradores/Gus.jpg",
            active: true,
            createdAt: "2026-01-01T08:00:00Z",
            updatedAt: "2026-01-01T08:00:00Z"
          }
        ];

        const finalTeam = [...defaultTeam];
        filteredUsrs.forEach(fu => {
          const index = finalTeam.findIndex(x => x.username === fu.username);
          if (index !== -1) {
            finalTeam[index] = { ...finalTeam[index], ...fu };
          }
        });

        setUsers(finalTeam);
      }

      if (ords) setOrders(ords.map(o => ({
        ...o,
        itemName: o.item_name,
        requestedAt: o.requested_at,
        requestedBy: o.requested_by,
        relatedItemId: o.related_item_id,
        expectedDeliveryDate: o.expected_delivery_date
      })).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()));

      if (movs) setMovements(movs.map(m => ({
        ...m,
        itemCategory: m.item_category,
        relatedOrderId: m.related_order_id,
        relatedAssetId: m.related_asset_id
      })));

      if (tvs) setDataliveTVs(tvs.map(tv => ({
        id: tv.id,
        branch: tv.branch,
        name: tv.name,
        user: tv.username,
        deviceId: tv.device_id,
        pin: tv.pin,
        notes: tv.notes,
        createdAt: tv.created_at,
        updatedAt: tv.updated_at
      })));

      // Fetch guardias separately to handle missing table gracefully
      try {
        const { data: gds, error: gdsError } = await supabase.from("guardias").select("*");
        if (gds && !gdsError) {
          let mappedGuardias = dedupeGuardias(gds.map((g) => guardiaFromDb(g as Record<string, unknown>)));

          const readLocalGuardias = (): Guardia[] => {
            const localStr = localStorage.getItem("techcontrol_guardias");
            if (!localStr) return dedupeGuardias(initialGuardias);
            try {
              const parsed = JSON.parse(localStr) as Guardia[];
              return dedupeGuardias(parsed.length > 0 ? parsed : initialGuardias);
            } catch {
              return dedupeGuardias(initialGuardias);
            }
          };

          // Si Supabase está vacío, subir datos locales o iniciales (no borrar el estado local)
          if (mappedGuardias.length === 0) {
            const source = readLocalGuardias();
            const { error: seedError } = await supabase
              .from("guardias")
              .upsert(source.map(guardiaToDb), { onConflict: "id" });
            if (seedError) {
              console.warn("Error seeding guardias to Supabase:", seedError);
              setGuardias(source);
              localStorage.setItem("techcontrol_guardias", JSON.stringify(source));
            } else {
              mappedGuardias = source;
              setGuardias(source);
              localStorage.setItem("techcontrol_guardias", JSON.stringify(source));
            }
          } else {
            // Subir guardias locales que aún no están en Supabase
            const localGds = readLocalGuardias();
            const missingLocals = localGds.filter(
              (lg) => !mappedGuardias.some((mg) => mg.id === lg.id)
            );

            if (missingLocals.length > 0) {
              const { error: syncError } = await supabase
                .from("guardias")
                .upsert(missingLocals.map(guardiaToDb), { onConflict: "id" });
              if (syncError) {
                console.error("Error syncing local guardias to Supabase:", syncError);
              } else {
                mappedGuardias = dedupeGuardias([...mappedGuardias, ...missingLocals]);
              }
            }

            setGuardias(mappedGuardias);
            localStorage.setItem("techcontrol_guardias", JSON.stringify(mappedGuardias));
          }
        } else if (gdsError) {
          console.warn("Supabase guardias query returned error (table might not exist yet):", gdsError);
        }
      } catch (err) {
        console.warn("Could not load guardias from Supabase:", err);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar los datos de Supabase");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const migrateAllData = async () => {
    setLoading(true);
    const t = toast.loading("Migrando datos a Supabase...");
    try {
      // 1. Users
      await supabase.from("users").upsert(initialUsers.map(u => ({
        id: u.id,
        username: u.username,
        full_name: u.fullName,
        email: u.email,
        phone: u.phone,
        location: u.location,
        active: u.active,
        created_at: u.createdAt,
        updated_at: u.updatedAt
      })));

      // 2. Stock Items
      await supabase.from("stock_items").upsert(initialItems.map(i => ({
        id: i.id,
        name: i.name,
        category: i.category,
        internal_code: i.internalCode,
        current_stock: i.currentStock,
        min_stock: i.minStock,
        location: i.location,
        status: i.status,
        supplier: i.supplier,
        notes: i.notes,
        created_at: i.createdAt,
        updated_at: i.updatedAt
      })));

      // 3. Printers
      await supabase.from("printers").upsert(initialPrinters.map(p => ({
        id: p.id,
        name: p.name,
        code: p.code,
        brand: p.brand,
        model: p.model,
        branch: p.branch,
        sector: p.sector,
        status: p.status,
        toner_model: p.tonerModel,
        toner_level: p.tonerLevel,
        image_unit_model: p.imageUnitModel,
        image_unit_level: p.imageUnitLevel,
        last_toner_change: p.lastTonerChange,
        last_image_unit_change: p.lastImageUnitChange,
        notes: p.notes,
        ip_address: p.ipAddress,
        serial_number: p.serialNumber,
        created_at: p.createdAt,
        updated_at: p.updatedAt
      })));

      // 4. Notebooks
      await supabase.from("notebooks").upsert(initialNotebooks.map(n => ({
        id: n.id,
        category: n.category,
        brand: n.brand,
        model: n.model,
        serial_number: n.serialNumber,
        internal_code: n.internalCode,
        processor: n.processor,
        ram: n.ram,
        storage: n.storage,
        screen_size: n.screenSize,
        os: n.os,
        physical_condition: n.physicalCondition,
        functional_status: n.functionalStatus,
        status: n.status,
        current_assignment: n.currentAssignment,
        assignment_history: n.assignmentHistory,
        entry_date: n.entryDate,
        last_review_date: n.lastReviewDate,
        notes: n.notes,
        created_at: n.createdAt,
        updated_at: n.updatedAt
      })));

      // 5. Monitors
      await supabase.from("monitors").upsert(initialMonitors.map(m => ({
        id: m.id,
        category: m.category,
        brand: m.brand,
        model: m.model,
        serial_number: m.serialNumber,
        internal_code: m.internalCode,
        size: m.size,
        status: m.status,
        physical_condition: m.physicalCondition,
        current_assignment: m.currentAssignment,
        location: m.location,
        entry_date: m.entryDate,
        notes: m.notes,
        created_at: m.createdAt,
        updated_at: m.updatedAt
      })));

      // 6. Orders
      await supabase.from("orders").upsert(initialOrders.map(o => ({
        id: o.id,
        item_name: o.itemName,
        quantity: o.quantity,
        category: o.category,
        reason: o.reason,
        priority: o.priority,
        requested_at: o.requestedAt,
        requested_by: o.requestedBy,
        status: o.status,
        history: o.history,
        related_item_id: o.relatedItemId,
        notes: o.notes,
        expected_delivery_date: o.expectedDeliveryDate
      })));

      // 7. Movements
      await supabase.from("movements").upsert(initialMovements.map(m => ({
        id: m.id,
        date: m.date,
        user: m.user,
        type: m.type,
        item_id: m.itemId,
        item_name: m.itemName,
        item_category: m.itemCategory,
        quantity: m.quantity,
        reason: m.reason,
        related_order_id: m.relatedOrderId,
        related_asset_id: m.relatedAssetId,
        notes: m.notes
      })));

      // 8. DataliveTV
      await supabase.from("datalive_tvs").upsert(initialTVs.map(tv => ({
        id: tv.id,
        branch: tv.branch,
        name: tv.name,
        username: tv.user,
        device_id: tv.deviceId,
        pin: tv.pin,
        notes: tv.notes,
        created_at: tv.createdAt,
        updated_at: tv.updatedAt
      })));

      // 9. Guardias
      await supabase
        .from("guardias")
        .upsert(dedupeGuardias(initialGuardias).map(guardiaToDb), { onConflict: "id" });

      toast.success("Migración completada con éxito", { id: t });
      fetchData();
    } catch (err) {
      console.error("Migration error:", err);
      toast.error("Error durante la migración", { id: t });
    } finally {
      setLoading(false);
    }
  };

  const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const now = () => new Date().toISOString();

  // Stock Items
  const addStockItem = useCallback(
    async (item: Omit<StockItem, "id" | "createdAt" | "updatedAt">) => {
      const id = genId();
      const createdAt = now();
      const newItem: StockItem = { ...item, id, createdAt, updatedAt: createdAt };
      
      setStockItems((prev) => [...prev, newItem]);

      const { error } = await supabase.from("stock_items").insert({
        id: newItem.id,
        name: newItem.name,
        category: newItem.category,
        internal_code: newItem.internalCode,
        current_stock: newItem.currentStock,
        min_stock: newItem.minStock,
        location: newItem.location,
        status: newItem.status,
        supplier: newItem.supplier,
        notes: newItem.notes,
        created_at: newItem.createdAt,
        updated_at: newItem.updatedAt
      });

      if (error) {
        toast.error("Error al guardar en base de datos");
        fetchData();
      }
    },
    [fetchData]
  );

  const updateStockItem = useCallback(async (id: string, data: Partial<StockItem>) => {
    setStockItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data, updatedAt: now() } : item))
    );

    const updateData: any = { ...data, updated_at: now() };
    if (data.internalCode) updateData.internal_code = data.internalCode;
    if (data.currentStock !== undefined) updateData.current_stock = data.currentStock;
    if (data.minStock !== undefined) updateData.min_stock = data.minStock;

    const { error } = await supabase.from("stock_items").update(updateData).eq("id", id);
    if (error) {
      toast.error("Error al actualizar stock");
      fetchData();
    }
  }, [fetchData]);

  const deleteStockItem = useCallback(async (id: string) => {
    setStockItems((prev) => prev.filter((item) => item.id !== id));
    const { error } = await supabase.from("stock_items").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar item");
      fetchData();
    }
  }, [fetchData]);

  // Printers
  const addPrinter = useCallback(
    async (p: Omit<Printer, "id" | "createdAt" | "updatedAt">) => {
      const id = genId();
      const createdAt = now();
      const newPrinter: Printer = { ...p, id, createdAt, updatedAt: createdAt };

      setPrinters((prev) => [...prev, newPrinter]);

      const { error } = await supabase.from("printers").insert({
        id: newPrinter.id,
        name: newPrinter.name,
        code: newPrinter.code,
        brand: newPrinter.brand,
        model: newPrinter.model,
        branch: newPrinter.branch,
        sector: newPrinter.sector,
        status: newPrinter.status,
        toner_model: newPrinter.tonerModel,
        toner_level: newPrinter.tonerLevel,
        image_unit_model: newPrinter.imageUnitModel,
        image_unit_level: newPrinter.imageUnitLevel,
        last_toner_change: newPrinter.lastTonerChange,
        last_image_unit_change: newPrinter.lastImageUnitChange,
        notes: newPrinter.notes,
        ip_address: newPrinter.ipAddress,
        serial_number: newPrinter.serialNumber,
        created_at: newPrinter.createdAt,
        updated_at: newPrinter.updatedAt
      });

      if (error) {
        toast.error("Error al guardar impresora");
        fetchData();
      }
    },
    [fetchData]
  );

  const updatePrinter = useCallback(async (id: string, data: Partial<Printer>) => {
    setPrinters((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data, updatedAt: now() } : p))
    );

    const updateData: any = { ...data, updated_at: now() };
    if (data.tonerModel) updateData.toner_model = data.tonerModel;
    if (data.tonerLevel !== undefined) updateData.toner_level = data.tonerLevel;
    if (data.imageUnitModel) updateData.image_unit_model = data.imageUnitModel;
    if (data.imageUnitLevel !== undefined) updateData.image_unit_level = data.imageUnitLevel;
    if (data.lastTonerChange) updateData.last_toner_change = data.lastTonerChange;
    if (data.lastImageUnitChange) updateData.last_image_unit_change = data.lastImageUnitChange;
    if (data.ipAddress) updateData.ip_address = data.ipAddress;
    if (data.serialNumber) updateData.serial_number = data.serialNumber;

    const { error } = await supabase.from("printers").update(updateData).eq("id", id);
    if (error) {
      toast.error("Error al actualizar impresora");
      fetchData();
    }
  }, [fetchData]);

  const deletePrinter = useCallback(async (id: string) => {
    setPrinters((prev) => prev.filter((p) => p.id !== id));
    const { error } = await supabase.from("printers").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar impresora");
      fetchData();
    }
  }, [fetchData]);

  // Notebooks
  const addNotebook = useCallback(
    async (n: Omit<Notebook, "id" | "createdAt" | "updatedAt">) => {
      const id = genId();
      const createdAt = now();
      const newNB: Notebook = { ...n, id, createdAt, updatedAt: createdAt };

      setNotebooks((prev) => [...prev, newNB]);

      const { error } = await supabase.from("notebooks").insert({
        id: newNB.id,
        category: newNB.category,
        brand: newNB.brand,
        model: newNB.model,
        serial_number: newNB.serialNumber,
        internal_code: newNB.internalCode,
        processor: newNB.processor,
        ram: newNB.ram,
        storage: newNB.storage,
        screen_size: newNB.screenSize,
        os: newNB.os,
        physical_condition: newNB.physicalCondition,
        functional_status: newNB.functionalStatus,
        status: newNB.status,
        current_assignment: newNB.currentAssignment,
        assignment_history: newNB.assignmentHistory,
        entry_date: newNB.entryDate,
        last_review_date: newNB.lastReviewDate,
        notes: newNB.notes,
        created_at: newNB.createdAt,
        updated_at: newNB.updatedAt
      });

      if (error) {
        toast.error("Error al guardar notebook");
        fetchData();
      }
    },
    [fetchData]
  );

  const updateNotebook = useCallback(async (id: string, data: Partial<Notebook>) => {
    setNotebooks((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...data, updatedAt: now() } : n))
    );

    const updateData: any = { ...data, updated_at: now() };
    if (data.serialNumber) updateData.serial_number = data.serialNumber;
    if (data.internalCode) updateData.internal_code = data.internalCode;
    if (data.screenSize) updateData.screen_size = data.screenSize;
    if (data.physicalCondition) updateData.physical_condition = data.physicalCondition;
    if (data.functionalStatus) updateData.functional_status = data.functionalStatus;
    if (data.currentAssignment !== undefined) updateData.current_assignment = data.currentAssignment;
    if (data.assignmentHistory) updateData.assignment_history = data.assignmentHistory;
    if (data.entryDate) updateData.entry_date = data.entryDate;
    if (data.lastReviewDate) updateData.last_review_date = data.lastReviewDate;

    const { error } = await supabase.from("notebooks").update(updateData).eq("id", id);
    if (error) {
      toast.error("Error al actualizar notebook");
      fetchData();
    }
  }, [fetchData]);

  const updateNotebookStatus = useCallback(async (id: string, status: NotebookStatus) => {
    updateNotebook(id, { status });
  }, [updateNotebook]);

  const deleteNotebook = useCallback(async (id: string) => {
    setNotebooks((prev) => prev.filter((n) => n.id !== id));
    const { error } = await supabase.from("notebooks").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar notebook");
      fetchData();
    }
  }, [fetchData]);

  // Monitors
  const addMonitor = useCallback(
    async (m: Omit<Monitor, "id" | "createdAt" | "updatedAt">) => {
      const id = genId();
      const createdAt = now();
      const newMonitor: Monitor = { ...m, id, createdAt, updatedAt: createdAt };

      setMonitors((prev) => [...prev, newMonitor]);

      const { error } = await supabase.from("monitors").insert({
        id: newMonitor.id,
        category: newMonitor.category,
        brand: newMonitor.brand,
        model: newMonitor.model,
        serial_number: newMonitor.serialNumber,
        internal_code: newMonitor.internalCode,
        size: newMonitor.size,
        status: newMonitor.status,
        physical_condition: newMonitor.physicalCondition,
        current_assignment: newMonitor.currentAssignment,
        location: newMonitor.location,
        entry_date: newMonitor.entryDate,
        notes: newMonitor.notes,
        created_at: newMonitor.createdAt,
        updated_at: newMonitor.updatedAt
      });

      if (error) {
        toast.error("Error al guardar monitor");
        fetchData();
      }
    },
    [fetchData]
  );

  const updateMonitor = useCallback(async (id: string, data: Partial<Monitor>) => {
    setMonitors((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data, updatedAt: now() } : m))
    );

    const updateData: any = { ...data, updated_at: now() };
    if (data.serialNumber) updateData.serial_number = data.serialNumber;
    if (data.internalCode) updateData.internal_code = data.internalCode;
    if (data.physicalCondition) updateData.physical_condition = data.physicalCondition;
    if (data.currentAssignment !== undefined) updateData.current_assignment = data.currentAssignment;
    if (data.entryDate) updateData.entry_date = data.entryDate;

    const { error } = await supabase.from("monitors").update(updateData).eq("id", id);
    if (error) {
      toast.error("Error al actualizar monitor");
      fetchData();
    }
  }, [fetchData]);

  const deleteMonitor = useCallback(async (id: string) => {
    setMonitors((prev) => prev.filter((m) => m.id !== id));
    const { error } = await supabase.from("monitors").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar monitor");
      fetchData();
    }
  }, [fetchData]);

  // Users
  const addUser = useCallback(
    async (u: Omit<User, "id" | "createdAt" | "updatedAt">) => {
      const id = genId();
      const createdAt = now();
      const newUser: User = { ...u, id, createdAt, updatedAt: createdAt };

      setUsers((prev) => [...prev, newUser]);

      const { error } = await supabase.from("users").insert({
        id: newUser.id,
        username: newUser.username,
        full_name: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        location: newUser.location,
        active: newUser.active,
        created_at: newUser.createdAt,
        updated_at: newUser.updatedAt
      });

      if (error) {
        toast.error("Error al guardar usuario");
        fetchData();
      }
    },
    [fetchData]
  );

  const updateUser = useCallback(async (id: string, data: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...data, updatedAt: now() } : u))
    );

    const updateData: any = { ...data, updated_at: now() };
    if (data.fullName) updateData.full_name = data.fullName;

    const { error } = await supabase.from("users").update(updateData).eq("id", id);
    if (error) {
      toast.error("Error al actualizar usuario");
      fetchData();
    }
  }, [fetchData]);

  const deleteUser = useCallback(async (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar usuario");
      fetchData();
    }
  }, [fetchData]);

  // Orders
  const addOrder = useCallback(
    async (o: Omit<Order, "id" | "requestedAt" | "history">) => {
      const id = `ord-${genId()}`;
      const requestedAt = now();
      const newOrder: Order = {
        ...o,
        id,
        requestedAt,
        history: [
          {
            id: genId(),
            orderId: id,
            status: "requested",
            date: requestedAt,
            changedBy: o.requestedBy,
          },
        ],
      };

      // Optimistic update
      setOrders((prev) => [newOrder, ...prev]);

      const { error } = await supabase.from("orders").insert({
        id: newOrder.id,
        item_name: newOrder.itemName,
        quantity: newOrder.quantity,
        category: newOrder.category,
        reason: newOrder.reason,
        priority: newOrder.priority,
        requested_at: newOrder.requestedAt,
        requested_by: newOrder.requestedBy,
        status: newOrder.status,
        history: newOrder.history,
        related_item_id: newOrder.relatedItemId,
        notes: newOrder.notes,
        expected_delivery_date: newOrder.expectedDeliveryDate
      });

      if (error) {
        toast.error("Error al crear el pedido");
        fetchData(); // Rollback
      } else {
        toast.success("Pedido creado con éxito");
      }
    },
    [fetchData]
  );

  const updateOrder = useCallback(async (id: string, data: Partial<Order>) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...data, updatedAt: now() } : o))
    );

    const updateData: any = {};
    if (data.itemName) updateData.item_name = data.itemName;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.category) updateData.category = data.category;
    if (data.reason) updateData.reason = data.reason;
    if (data.priority) updateData.priority = data.priority;
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.expectedDeliveryDate !== undefined) updateData.expected_delivery_date = data.expectedDeliveryDate;
    if (data.history) updateData.history = data.history;

    const { error } = await supabase.from("orders").update(updateData).eq("id", id);

    if (error) {
      toast.error("Error al actualizar el pedido");
      fetchData(); // Rollback
    }
  }, [fetchData]);

  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus, notes?: string, changedBy = "Sistema") => {
      const order = orders.find(o => o.id === id);
      if (!order) return;

      const newHistory = [
        ...order.history,
        { id: genId(), orderId: id, status, date: now(), notes, changedBy },
      ];

      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== id) return o;
          return {
            ...o,
            status,
            history: newHistory,
          };
        })
      );

      const { error } = await supabase.from("orders").update({
        status,
        history: newHistory
      }).eq("id", id);

      if (error) {
        toast.error("Error al actualizar el estado");
        fetchData();
      } else {
        toast.success(`Pedido ${status === 'delivered' ? 'entregado' : 'actualizado'}`);
      }
    },
    [orders, fetchData]
  );

  const deleteOrder = useCallback(async (id: string) => {
    // Optimistic update
    setOrders((prev) => prev.filter((o) => o.id !== id));

    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) {
      toast.error("Error al eliminar el pedido");
      fetchData();
    } else {
      toast.success("Pedido eliminado");
    }
  }, [fetchData]);

  // Movements
  const addMovement = useCallback((m: Omit<Movement, "id">) => {
    setMovements((prev) => [{ ...m, id: genId() }, ...prev]);
  }, []);

  // DataliveTV
  const addDataliveTV = useCallback(
    async (tv: Omit<DataliveTV, "id" | "createdAt" | "updatedAt">) => {
      const id = genId();
      const createdAt = now();
      const newTV: DataliveTV = { ...tv, id, createdAt, updatedAt: createdAt };

      setDataliveTVs((prev) => [...prev, newTV]);

      const { error } = await supabase.from("datalive_tvs").insert({
        id: newTV.id,
        branch: newTV.branch,
        name: newTV.name,
        username: newTV.user,
        device_id: newTV.deviceId,
        pin: newTV.pin,
        notes: newTV.notes,
        created_at: newTV.createdAt,
        updated_at: newTV.updatedAt
      });

      if (error) {
        toast.error("Error al registrar TV");
        fetchData();
      } else {
        toast.success("TV registrada con éxito");
      }
    },
    [fetchData]
  );

  const updateDataliveTV = useCallback(async (id: string, data: Partial<DataliveTV>) => {
    setDataliveTVs((prev) =>
      prev.map((tv) => (tv.id === id ? { ...tv, ...data, updatedAt: now() } : tv))
    );

    const updateData: any = {};
    if (data.branch) updateData.branch = data.branch;
    if (data.name) updateData.name = data.name;
    if (data.user) updateData.username = data.user;
    if (data.deviceId) updateData.device_id = data.deviceId;
    if (data.pin) updateData.pin = data.pin;
    if (data.notes !== undefined) updateData.notes = data.notes;
    updateData.updated_at = now();

    const { error } = await supabase.from("datalive_tvs").update(updateData).eq("id", id);

    if (error) {
      toast.error("Error al actualizar TV");
      fetchData();
    }
  }, [fetchData]);

  const deleteDataliveTV = useCallback(async (id: string) => {
    setDataliveTVs((prev) => prev.filter((tv) => tv.id !== id));

    const { error } = await supabase.from("datalive_tvs").delete().eq("id", id);

    if (error) {
      toast.error("Error al eliminar TV");
      fetchData();
    }
  }, [fetchData]);

  const calculateHours = (date: string, startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    try {
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);
      
      let startMinutes = startH * 60 + startM;
      let endMinutes = endH * 60 + endM;
      
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60;
      }
      
      const diffMinutes = endMinutes - startMinutes;
      return Math.round((diffMinutes / 60) * 100) / 100;
    } catch (e) {
      return 0;
    }
  };

  const addGuardia = useCallback(
    async (g: Omit<Guardia, "id" | "createdAt" | "updatedAt" | "hours">) => {
      const id = `gd-${genId()}`;
      const createdAt = now();
      const hours = calculateHours(g.date, g.startTime, g.endTime);
      const newGuardia: Guardia = { ...g, id, hours, createdAt, updatedAt: createdAt };

      setGuardias((prev) => {
        const next = [...prev, newGuardia];
        localStorage.setItem("techcontrol_guardias", JSON.stringify(next));
        return next;
      });

      const { error } = await supabase.from("guardias").insert(guardiaToDb(newGuardia));

      if (error) {
        console.warn("Error inserting guardia into Supabase:", error);
        toast.info("Guardia guardada localmente");
      } else {
        toast.success("Guardia registrada con éxito");
      }
    },
    [fetchData]
  );

  const updateGuardia = useCallback(
    async (id: string, data: Partial<Guardia>) => {
      setGuardias((prev) => {
        const next = prev.map((g) => {
          if (g.id !== id) return g;
          const merged = { ...g, ...data, updatedAt: now() };
          if (data.startTime || data.endTime || data.date) {
            merged.hours = calculateHours(merged.date, merged.startTime, merged.endTime);
          }
          return merged;
        });
        localStorage.setItem("techcontrol_guardias", JSON.stringify(next));
        return next;
      });

      const current = guardias.find((g) => g.id === id);
      if (!current) return;

      const merged = { ...current, ...data };
      const hours = calculateHours(merged.date, merged.startTime, merged.endTime);

      const updateData: any = {
        updated_at: now(),
        hours
      };
      if (data.date) updateData.date = data.date;
      if (data.startTime) updateData.start_time = data.startTime;
      if (data.endTime) updateData.end_time = data.endTime;
      if (data.userId) updateData.user_id = data.userId;
      if (data.userName) updateData.user_name = data.userName;
      if (data.type) updateData.type = data.type;
      if (data.description) updateData.description = data.description;
      if (data.branchesAffected !== undefined) updateData.branches_affected = data.branchesAffected;
      if (data.status) updateData.status = data.status;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const { error } = await supabase.from("guardias").update(updateData).eq("id", id);
      if (error) {
        console.warn("Error updating guardia in Supabase:", error);
      } else {
        toast.success("Guardia actualizada");
      }
    },
    [guardias, fetchData]
  );

  const deleteGuardia = useCallback(
    async (id: string) => {
      setGuardias((prev) => {
        const next = prev.filter((g) => g.id !== id);
        localStorage.setItem("techcontrol_guardias", JSON.stringify(next));
        return next;
      });

      const { error } = await supabase.from("guardias").delete().eq("id", id);
      if (error) {
        console.warn("Error deleting guardia from Supabase:", error);
      } else {
        toast.success("Guardia eliminada");
      }
    },
    [fetchData]
  );

  return (
    <AppContext.Provider
      value={{
        stockItems,
        printers,
        notebooks,
        monitors,
        users,
        orders,
        movements,
        addStockItem,
        updateStockItem,
        deleteStockItem,
        addPrinter,
        updatePrinter,
        deletePrinter,
        addNotebook,
        updateNotebook,
        updateNotebookStatus,
        deleteNotebook,
        addMonitor,
        updateMonitor,
        deleteMonitor,
        addUser,
        updateUser,
        deleteUser,
        addOrder,
        updateOrder,
        updateOrderStatus,
        deleteOrder,
        addMovement,
        dataliveTVs,
        addDataliveTV,
        updateDataliveTV,
        deleteDataliveTV,
        guardias,
        addGuardia,
        updateGuardia,
        deleteGuardia,
        currentPage,
        setCurrentPage,
        selectedId,
        setSelectedId,
        loading,
        migrateAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
