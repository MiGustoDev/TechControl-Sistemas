import React, { useState, useMemo } from "react";
import { 
  Plus, Search, Edit2, Trash2, Tag, Sparkles, ArrowRightLeft, 
  LayoutGrid, List, Package, Layers, 
  ArrowUpDown, X, Flame, Percent, Coffee,
  CupSoda, Cookie, CakeSlice, Sandwich, UtensilsCrossed,
  Beef, Disc, PieChart, Globe, ExternalLink
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
import { toast } from "sonner";
import type { ProductPrice, ProductPriceCategory } from "@/types";

export function PricesPage() {
  const { productPrices, addProductPrice, updateProductPrice, deleteProductPrice } = useApp();
  
  const [search, setSearch] = useState("");
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "price-asc" | "price-desc">("name-asc");
  
  // Selection state for bulk change
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<ProductPrice | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductPriceCategory>("empanadas");
  const [priceInput, setPriceInput] = useState("");

  // Bulk Edit Dialog state
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkPriceInput, setBulkPriceInput] = useState("");

  // Delete Confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const formatCurrencyDisplay = (num: number): string => {
    return `$ ${num.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const defaultCategoriesMap: Record<string, { label: string; color: string; activeColor: string; icon: React.ElementType }> = {
    empanadas: { 
      label: "Empanadas", 
      color: "bg-orange-500/10 text-orange-500 border-orange-500/20", 
      activeColor: "bg-orange-500 text-white border-orange-500",
      icon: Flame 
    },
    pizzas: { 
      label: "Pizzas", 
      color: "bg-red-500/10 text-red-500 border-red-500/20", 
      activeColor: "bg-red-500 text-white border-red-500",
      icon: Layers 
    },
    pizzas_indi: { 
      label: "Pizzas INDI", 
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20", 
      activeColor: "bg-amber-500 text-slate-950 border-amber-500 font-bold",
      icon: Layers 
    },
    cafeteria: { 
      label: "Cafetería", 
      color: "bg-amber-700/10 text-amber-700 dark:text-amber-400 border-amber-700/20", 
      activeColor: "bg-amber-700 text-white border-amber-700",
      icon: Coffee 
    },
    promos: { 
      label: "Promos", 
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20", 
      activeColor: "bg-purple-500 text-white border-purple-500",
      icon: Percent 
    },
    packs: { 
      label: "Packs", 
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", 
      activeColor: "bg-emerald-500 text-white border-emerald-500",
      icon: Package 
    }
  };

  const getCategoryInfo = (catKey: string) => {
    if (defaultCategoriesMap[catKey]) {
      return defaultCategoriesMap[catKey];
    }
    return {
      label: catKey.charAt(0).toUpperCase() + catKey.slice(1).replace("_", " "),
      color: "bg-slate-500/10 text-slate-500 border-slate-500/20",
      activeColor: "bg-slate-700 text-white border-slate-700",
      icon: Tag
    };
  };

  // Dynamically extract all available categories present in dataset + defaults
  const availableCategoryKeys = useMemo(() => {
    const set = new Set<string>(Object.keys(defaultCategoriesMap));
    productPrices.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [productPrices]);

  const getProductIcon = (prod: ProductPrice): React.ElementType => {
    const nameLower = prod.name.toLowerCase();
    const cat = prod.category;

    if (cat === "cafeteria") {
      if (nameLower.includes("jugo") || nameLower.includes("ice") || nameLower.includes("iced") || nameLower.includes("frappe")) {
        return CupSoda;
      }
      if (nameLower.includes("cookie")) {
        return Cookie;
      }
      if (nameLower.includes("budín") || nameLower.includes("budin")) {
        return CakeSlice;
      }
      if (nameLower.includes("tostado") || nameLower.includes("croissant") || nameLower.includes("medialuna j&q") || nameLower.includes("roll")) {
        return Sandwich;
      }
      if (nameLower.includes("medialuna")) {
        return Cookie;
      }
      if (nameLower.includes("café +") || nameLower.includes("combo")) {
        return UtensilsCrossed;
      }
      return Coffee;
    }

    if (cat === "empanadas") {
      if (isProductPremium(prod)) {
        return Sparkles;
      }
      if (nameLower.includes("carne") || nameLower.includes("burger") || nameLower.includes("vacío") || nameLower.includes("vacio")) {
        return Beef;
      }
      return Flame;
    }

    if (cat === "pizzas" || cat === "pizzas_indi") {
      if (nameLower.includes("pepperoni") || nameLower.includes("panceta") || nameLower.includes("jamon")) {
        return Disc;
      }
      return PieChart;
    }

    if (cat === "promos") return Percent;
    if (cat === "packs") return Package;

    return getCategoryInfo(cat).icon;
  };

  // Compute Stats
  const stats = useMemo(() => {
    const total = productPrices.length;
    const nonZeroPrices = productPrices.filter(p => p.price > 0 && p.category !== "packs");
    const avg = nonZeroPrices.length > 0 ? nonZeroPrices.reduce((acc, p) => acc + p.price, 0) / nonZeroPrices.length : 0;
    const maxPrice = nonZeroPrices.length > 0 ? Math.max(...nonZeroPrices.map(p => p.price)) : 0;
    const minPrice = nonZeroPrices.length > 0 ? Math.min(...nonZeroPrices.map(p => p.price)) : 0;
    const hasPricedProducts = nonZeroPrices.length > 0;

    const categoryCounts: Record<string, number> = { all: total };
    productPrices.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    return { total, avg, maxPrice, minPrice, hasPricedProducts, categoryCounts };
  }, [productPrices]);

  const premiumEmpanadaNames = useMemo(() => [
    "american chicken",
    "big burger",
    "doble bacon cheese burger",
    "la sagrada",
    "matambre a la pizza",
    "mexican pibil pork",
    "vacío y provoleta",
    "vacio y provoleta"
  ], []);

  const isProductPremium = (prod: ProductPrice) => {
    if (prod.isPremium) return true;
    if (prod.category === "empanadas") {
      const nameClean = prod.name.toLowerCase().trim();
      return premiumEmpanadaNames.some(p => nameClean.includes(p));
    }
    return false;
  };

  const handleOpenCreate = () => {
    setEditingPrice(null);
    setName("");
    setCategory("empanadas");
    setPriceInput("");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (prod: ProductPrice) => {
    setEditingPrice(prod);
    setName(prod.name);
    setCategory(prod.category);
    setPriceInput(prod.price.toString());
    setIsDialogOpen(true);
  };

  const handleDeleteTrigger = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Por favor, ingresá el nombre del producto");
      return;
    }

    const priceNum = parseFloat(priceInput);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Por favor, ingresá un precio válido");
      return;
    }

    try {
      if (editingPrice) {
        await updateProductPrice(editingPrice.id, {
          name: name.trim(),
          category,
          price: priceNum
        });
        toast.success("Precio actualizado correctamente");
      } else {
        await addProductPrice({
          name: name.trim(),
          category,
          price: priceNum
        });
        toast.success("Producto registrado correctamente");
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error("Ocurrió un error al guardar");
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPriceNum = parseFloat(bulkPriceInput);
    if (isNaN(newPriceNum) || newPriceNum < 0) {
      toast.error("Por favor, ingresá un precio válido");
      return;
    }

    try {
      toast.loading(`Aplicando cambio de precio a ${selectedIds.length} productos...`, { id: "bulk-update" });
      
      await Promise.all(selectedIds.map(id => updateProductPrice(id, { price: newPriceNum })));
      
      toast.success("Precios actualizados en masa correctamente", { id: "bulk-update" });
      setSelectedIds([]);
      setIsBulkDialogOpen(false);
      setBulkPriceInput("");
    } catch (err) {
      toast.error("Error al aplicar cambios en masa", { id: "bulk-update" });
    }
  };

  const handleToggleCategory = (key: string) => {
    setActiveCategories(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });
    setSelectedIds([]);
  };

  const getPackQuantity = (name: string): number => {
    const match = name.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const filteredPrices = useMemo(() => {
    const list = productPrices.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategories.length === 0 || activeCategories.includes(p.category);
      return matchesSearch && matchesCategory;
    });

    return list.sort((a, b) => {
      const aPrem = isProductPremium(a);
      const bPrem = isProductPremium(b);

      // Premium items always placed first at top
      if (aPrem && !bPrem) return -1;
      if (!aPrem && bPrem) return 1;

      // Natural numerical sorting for packs (2, 3, 4, 6, 8, 12, 18 empanadas)
      if (a.category === "packs" && b.category === "packs") {
        const qtyA = getPackQuantity(a.name);
        const qtyB = getPackQuantity(b.name);
        if (qtyA !== qtyB) {
          return sortBy.includes("desc") ? qtyB - qtyA : qtyA - qtyB;
        }
      }

      if (sortBy === "name-asc") return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      if (sortBy === "name-desc") return b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' });
      if (sortBy === "price-asc") {
        if (a.price !== b.price) return a.price - b.price;
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      }
      if (sortBy === "price-desc") {
        if (a.price !== b.price) return b.price - a.price;
        return b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' });
      }
      return 0;
    });
  }, [productPrices, search, activeCategories, sortBy]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredPrices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPrices.map(p => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 p-6 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            Lista de Precios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión centralizada, actualización masiva y consulta de la carta oficial de precios de Mi Gusto.
          </p>
        </div>
        <div className="flex gap-2.5 flex-wrap items-center">
          <Button
            onClick={() => setIsBulkDialogOpen(true)}
            disabled={selectedIds.length === 0}
            variant="outline"
            className="border-input hover:bg-accent font-bold flex items-center gap-2 shadow-xs"
          >
            <ArrowRightLeft className="size-4" /> Actualizar Masivo ({selectedIds.length})
          </Button>
          <Button onClick={handleOpenCreate} className="bg-white text-slate-950 hover:bg-slate-100 font-bold flex items-center gap-2 shadow-md">
            <Plus className="size-4.5" /> Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs hover:border-orange-500/30 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Productos</p>
              <h3 className="text-2xl font-black text-foreground mt-0.5">{stats.total}</h3>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
              <Tag className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs hover:border-purple-500/30 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categorías</p>
              <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">{availableCategoryKeys.length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <Layers className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs hover:border-emerald-500/30 transition-all">
          <CardContent className="p-4 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">Rango de Precios</p>
              <h3 className="text-base sm:text-lg md:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate" title={stats.hasPricedProducts ? `${formatCurrencyDisplay(stats.minPrice)} a ${formatCurrencyDisplay(stats.maxPrice)}` : "$ 0"}>
                {stats.hasPricedProducts ? `${formatCurrencyDisplay(stats.minPrice)} - ${formatCurrencyDisplay(stats.maxPrice)}` : "$ 0"}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <ArrowUpDown className="size-5" />
            </div>
          </CardContent>
        </Card>

        <a 
          href="https://www.migusto.com.ar/cartadigital/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block group"
        >
          <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer h-full">
            <CardContent className="p-4 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-blue-500 transition-colors">Carta Digital</p>
                <h3 className="text-sm sm:text-base font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 flex items-center gap-1 truncate group-hover:underline">
                  Ver Menú Web <ExternalLink className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0">
                <Globe className="size-5" />
              </div>
            </CardContent>
          </Card>
        </a>
      </div>

      {/* Toolbar & Category Navigation */}
      <Card className="border-border/60 bg-card/50 backdrop-blur-xs shadow-xs">
        <CardContent className="p-4 space-y-4">
          {/* Category Filter Tabs (Multi-selection) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => {
                setActiveCategories([]);
                setSelectedIds([]);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 ${
                activeCategories.length === 0
                  ? "bg-foreground text-background shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
              }`}
            >
              <Sparkles className="size-3.5" />
              <span>Todos</span>
              <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                activeCategories.length === 0 ? "bg-background text-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {stats.total}
              </span>
            </button>

            {availableCategoryKeys.map((key) => {
              const catInfo = getCategoryInfo(key);
              const Icon = catInfo.icon;
              const count = stats.categoryCounts[key] || 0;
              const isActive = activeCategories.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => handleToggleCategory(key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 select-none ${
                    isActive
                      ? `${catInfo.activeColor} shadow-xs ring-2 ring-primary/20 scale-[1.02]`
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{catInfo.label}</span>
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? "bg-black/20 text-current font-black" : "bg-muted text-muted-foreground"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search, Sort and Layout Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2 border-t border-border/40">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre de producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-8 h-9.5 rounded-lg bg-background/50 text-xs"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Sorting & Layout View Toggle */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-background/50 border border-input rounded-lg px-2.5 h-9.5">
                <ArrowUpDown className="size-3.5 text-muted-foreground shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="name-asc">Nombre (A - Z)</option>
                  <option value="name-desc">Nombre (Z - A)</option>
                  <option value="price-asc">Precio (Menor a Mayor)</option>
                  <option value="price-desc">Precio (Mayor a Menor)</option>
                </select>
              </div>

              {/* View Switcher */}
              <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/40">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "table" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Vista de Tabla"
                >
                  <List className="size-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "grid" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Vista de Tarjetas"
                >
                  <LayoutGrid className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Rendering: Table or Grid */}
      {filteredPrices.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-card/20 p-12 text-center shadow-xs">
          <CardContent className="space-y-3 p-0">
            <div className="inline-flex p-3 rounded-full bg-muted text-muted-foreground">
              <Tag className="size-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No se encontraron productos</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {search 
                ? `No hay coincidencia para "${search}". Probá ajustando el término de búsqueda.` 
                : "No hay productos registrados en esta categoría."}
            </p>
            {search && (
              <Button variant="outline" size="sm" onClick={() => setSearch("")} className="mt-2 text-xs font-semibold">
                Limpiar Búsqueda
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        /* Table View */
        <Card className="border-border/60 bg-card/40 backdrop-blur-xs overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-foreground">
              <thead>
                <tr className="border-b border-border/60 bg-muted/60 text-xs font-extrabold uppercase tracking-wider text-muted-foreground select-none">
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={filteredPrices.length > 0 && selectedIds.length === filteredPrices.length}
                      onChange={handleToggleSelectAll}
                      className="size-4 rounded accent-orange-600 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4 text-right">Precio Oficial</th>
                  <th className="p-4 text-center w-28">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredPrices.map((prod) => {
                  const isSelected = selectedIds.includes(prod.id);
                  const catInfo = getCategoryInfo(prod.category);
                  const Icon = getProductIcon(prod);

                  return (
                    <tr 
                      key={prod.id} 
                      className={`hover:bg-muted/20 transition-colors group ${
                        isSelected ? "bg-orange-500/10 hover:bg-orange-500/15" : ""
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(prod.id)}
                          className="size-4 rounded accent-orange-600 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-md ${catInfo.color}`}>
                            <Icon className="size-3.5" />
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>{prod.name}</span>
                            {isProductPremium(prod) && (
                              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 shadow-2xs border-none">
                                ⭐ Premium
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={`${catInfo.color} font-bold text-[10px] uppercase tracking-wider px-2 py-0.5`}>
                          {catInfo.label}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-base">
                        {formatCurrencyDisplay(prod.price)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all"
                            onClick={() => handleOpenEdit(prod)}
                            title="Editar producto"
                          >
                            <Edit2 className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                            onClick={() => handleDeleteTrigger(prod.id)}
                            title="Eliminar producto"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Cards Grid View */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPrices.map((prod) => {
            const isSelected = selectedIds.includes(prod.id);
            const catInfo = getCategoryInfo(prod.category);
            const Icon = getProductIcon(prod);
            const isPremium = isProductPremium(prod);

            return (
              <Card 
                key={prod.id} 
                className={`relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-xs transition-all duration-200 hover:shadow-md hover:border-orange-500/40 group ${
                  isSelected ? "ring-2 ring-orange-500 bg-orange-500/5" : ""
                }`}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(prod.id)}
                        className="size-4 rounded accent-orange-600 cursor-pointer"
                      />
                      <Badge variant="outline" className={`${catInfo?.color || ""} font-bold text-[10px] uppercase tracking-wider`}>
                        <Icon className="size-3 mr-1" />
                        {catInfo?.label || prod.category}
                      </Badge>
                      {isPremium && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[9px] uppercase tracking-wider px-1.5 py-0.2 shadow-2xs border-none">
                          ⭐ Premium
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 rounded-md"
                        onClick={() => handleOpenEdit(prod)}
                        title="Editar"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-md"
                        onClick={() => handleDeleteTrigger(prod.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Product Title & Price */}
                  <div className="pt-1">
                    <div className="flex items-start gap-2 min-h-[2.5rem]">
                      <div className={`p-1.5 rounded-md ${catInfo.color} shrink-0 mt-0.5`}>
                        <Icon className="size-3.5" />
                      </div>
                      <h4 className="font-bold text-foreground text-sm line-clamp-2">
                        {prod.name}
                      </h4>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between border-t border-border/30 pt-2">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Precio Actual</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrencyDisplay(prod.price)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 dark:bg-slate-950/95 text-white border border-slate-700 p-3 px-5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
            <span className="relative flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2.5 bg-orange-500"></span>
            </span>
            <span className="text-xs font-black">
              {selectedIds.length} producto{selectedIds.length > 1 ? "s" : ""} seleccionado{selectedIds.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsBulkDialogOpen(true)}
              size="sm"
              className="bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs shadow-sm gap-1.5 h-8"
            >
              <ArrowRightLeft className="size-3.5" /> Cambiar Precios Masivo
            </Button>

            <Button
              onClick={() => setSelectedIds([])}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs h-8"
            >
              Desmarcar Todo
            </Button>
          </div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="size-5 text-orange-500" />
              {editingPrice ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Completá los datos correspondientes para registrar el precio oficial en el menú.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Nombre del Producto <span className="text-rose-500">*</span></label>
              <Input
                placeholder="ej. Pizza Muzzarella Doble"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductPriceCategory)}
                  className="w-full h-9.5 px-3 py-2 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring font-semibold"
                >
                  <option value="empanadas">Empanadas</option>
                  <option value="pizzas">Pizzas</option>
                  <option value="pizzas_indi">Pizzas INDI</option>
                  <option value="cafeteria">Cafetería</option>
                  <option value="promos">Promos</option>
                  <option value="packs">Packs</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Precio ($) <span className="text-rose-500">*</span></label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  required
                  className="text-xs font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2 sm:justify-end">
              <Button type="submit" className="bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs shadow-sm">
                {editingPrice ? "Guardar Cambios" : "Registrar Producto"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="text-xs">
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <ArrowRightLeft className="size-5 text-orange-500" />
              Cambiador Masivo de Precios
            </DialogTitle>
            <DialogDescription className="text-xs">
              Estás modificando simultáneamente el precio de <strong>{selectedIds.length}</strong> productos seleccionados.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBulkSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Nuevo Precio Común ($)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={bulkPriceInput}
                onChange={(e) => setBulkPriceInput(e.target.value)}
                required
                autoFocus
                className="text-sm font-black text-emerald-600 dark:text-emerald-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="p-3 bg-muted/30 border border-border/60 rounded-xl space-y-1.5 text-xs">
              <span className="text-muted-foreground font-extrabold uppercase tracking-wider text-[10px]">
                Productos Afectados ({selectedIds.length}):
              </span>
              <div className="max-h-32 overflow-y-auto no-scrollbar pt-1 space-y-1.5 divide-y divide-border/20">
                {productPrices
                  .filter(p => selectedIds.includes(p.id))
                  .map(p => (
                    <div key={p.id} className="flex justify-between items-center gap-2 pt-1">
                      <span className="truncate text-foreground font-medium">{p.name}</span>
                      <span className="text-muted-foreground shrink-0 font-bold">{formatCurrencyDisplay(p.price)}</span>
                    </div>
                  ))}
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2 sm:justify-end">
              <Button type="submit" className="bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs shadow-sm">
                Aplicar Precio Masivo
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsBulkDialogOpen(false)} className="text-xs">
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              ¿Estás seguro de eliminar este producto y su precio registrado? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 gap-2 sm:justify-end">
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              onClick={async () => {
                if (deleteConfirmId) {
                  await deleteProductPrice(deleteConfirmId);
                  setSelectedIds(prev => prev.filter(x => x !== deleteConfirmId));
                  toast.success("Producto eliminado correctamente");
                  setDeleteConfirmId(null);
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

