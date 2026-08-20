import React, { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Tag, Sparkles, ArrowRightLeft } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { ProductPrice, ProductPriceCategory } from "@/types";

export function PricesPage() {
  const { productPrices, addProductPrice, updateProductPrice, deleteProductPrice } = useApp();
  
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ProductPriceCategory | "all">("all");
  
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

  const formatCurrencyDisplay = (num: number): string => {
    return `$ ${num.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este producto y su precio registrado?")) {
      await deleteProductPrice(id);
      setSelectedIds(prev => prev.filter(x => x !== id));
      toast.success("Producto eliminado correctamente");
    }
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
      
      // Perform sequential updates (will update local state & hit Supabase)
      await Promise.all(selectedIds.map(id => updateProductPrice(id, { price: newPriceNum })));
      
      toast.success("Precios actualizados en masa correctamente", { id: "bulk-update" });
      setSelectedIds([]);
      setIsBulkDialogOpen(false);
      setBulkPriceInput("");
    } catch (err) {
      toast.error("Error al aplicar cambios en masa", { id: "bulk-update" });
    }
  };

  const categoriesMap: Record<ProductPriceCategory, { label: string; color: string }> = {
    empanadas: { label: "Empanadas", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    pizzas: { label: "Pizzas", color: "bg-red-500/10 text-red-500 border-red-500/20" },
    pizzas_indi: { label: "Pizzas INDI", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    promos: { label: "Promos", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    packs: { label: "Packs", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" }
  };

  const filteredPrices = useMemo(() => {
    return productPrices.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [productPrices, search, activeCategory]);

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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Lista de Precios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión y consulta de los precios oficiales de productos y combos de Mi Gusto.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setIsBulkDialogOpen(true)}
            disabled={selectedIds.length === 0}
            variant="outline"
            className="border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-500 font-semibold flex items-center gap-1.5"
          >
            <ArrowRightLeft className="size-4" /> Cambiador de precios ({selectedIds.length})
          </Button>
          <Button onClick={handleOpenCreate} className="bg-white text-slate-900 hover:bg-slate-100 font-bold flex items-center gap-1.5 shadow-sm">
            <Plus className="size-4.5" /> Agregar Producto
          </Button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <Card className="border-border/60 bg-card/50 backdrop-blur-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Categories Tabs */}
          <div className="flex gap-1.5 flex-wrap w-full md:w-auto">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              onClick={() => {
                setActiveCategory("all");
                setSelectedIds([]);
              }}
              className={`text-xs px-3 h-8.5 rounded-lg ${activeCategory === "all" ? "bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-xs border-white" : ""}`}
            >
              Todos
            </Button>
            {Object.entries(categoriesMap).map(([key, value]) => (
              <Button
                key={key}
                variant={activeCategory === key ? "default" : "outline"}
                onClick={() => {
                  setActiveCategory(key as ProductPriceCategory);
                  setSelectedIds([]);
                }}
                className={`text-xs px-3 h-8.5 rounded-lg ${activeCategory === key ? "bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-xs border-white" : ""}`}
              >
                {value.label}
              </Button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar producto por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9.5 rounded-lg bg-background/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products List (Table Style) */}
      {filteredPrices.length > 0 ? (
        <Card className="border-border/60 bg-card/30 backdrop-blur-xs overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-foreground">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground select-none">
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
                  <th className="p-4 text-right">Precio</th>
                  <th className="p-4 text-center w-28">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredPrices.map((prod) => {
                  const isSelected = selectedIds.includes(prod.id);
                  return (
                    <tr 
                      key={prod.id} 
                      className={`hover:bg-muted/10 transition-colors group ${
                        isSelected ? "bg-orange-500/5 hover:bg-orange-500/10" : ""
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
                      <td className="p-4 font-semibold text-foreground">
                        {prod.name}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={`${categoriesMap[prod.category]?.color || ""} font-semibold text-[10px]`}>
                          {categoriesMap[prod.category]?.label || prod.category}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-black text-orange-500 dark:text-orange-400 text-[15px]">
                        {formatCurrencyDisplay(prod.price)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 rounded-full"
                            onClick={() => handleOpenEdit(prod)}
                            title="Editar"
                          >
                            <Edit2 className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-full"
                            onClick={() => handleDelete(prod.id)}
                            title="Eliminar"
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
        <Card className="border-dashed border-border/80 bg-card/20 p-12 text-center shadow-sm">
          <CardContent className="space-y-3">
            <div className="inline-flex p-3 rounded-full bg-muted text-muted-foreground">
              <Tag className="size-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No se encontraron productos</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Probá cambiando la categoría o ajustando los términos de búsqueda para encontrar los precios.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-1.5">
              <Sparkles className="size-5 text-orange-500" />
              {editingPrice ? "Editar Producto" : "Registrar Producto"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Completá los datos correspondientes para registrar el precio oficial.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Nombre del Producto</label>
              <Input
                placeholder="ej. Pizza Muzzarella Doble"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductPriceCategory)}
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="empanadas">Empanadas</option>
                  <option value="pizzas">Pizzas</option>
                  <option value="pizzas_indi">Pizzas INDI</option>
                  <option value="promos">Promos</option>
                  <option value="packs">Packs</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Precio ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button type="submit" className="bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-sm">
                {editingPrice ? "Guardar Cambios" : "Registrar Producto"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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
            <DialogTitle className="text-lg font-bold flex items-center gap-1.5">
              <ArrowRightLeft className="size-5 text-orange-500" />
              Cambiador de precios masivo
            </DialogTitle>
            <DialogDescription className="text-xs">
              Estás modificando simultáneamente el precio de <strong>{selectedIds.length}</strong> productos seleccionados.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBulkSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Nuevo precio común ($)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={bulkPriceInput}
                onChange={(e) => setBulkPriceInput(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="p-3 bg-muted/20 border border-border/60 rounded-xl space-y-1 text-xs">
              <span className="text-muted-foreground font-semibold">Productos seleccionados:</span>
              <div className="max-h-24 overflow-y-auto no-scrollbar pt-1 space-y-1">
                {productPrices
                  .filter(p => selectedIds.includes(p.id))
                  .map(p => (
                    <div key={p.id} className="flex justify-between items-center gap-2">
                      <span className="truncate text-foreground font-medium">{p.name}</span>
                      <span className="text-muted-foreground shrink-0">{formatCurrencyDisplay(p.price)}</span>
                    </div>
                  ))}
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button type="submit" className="bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-sm">
                Aplicar Precio Común
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
