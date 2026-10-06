import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileCode, Upload, CheckCircle2, AlertCircle, Laptop, Monitor, Key, Sparkles, Loader2, Folder, Trash2 } from "lucide-react";
import { parsePowerShellInventory, type ParsedEquipmentResult, type InventoryFileItem } from "@/lib/powershellParser";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

interface ImportPowerShellModalProps {
  open: boolean;
  onClose: () => void;
}

export function ImportPowerShellModal({ open, onClose }: ImportPowerShellModalProps) {
  const { users, notebooks, addNotebook, updateNotebook } = useApp();
  const [loading, setLoading] = useState(false);
  const [parsedResults, setParsedResults] = useState<ParsedEquipmentResult[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // equipmentCode -> userId

  const removeResult = (code: string) => {
    setParsedResults((prev) => prev.filter((r) => r.equipmentCode !== code));
    toast.info(`Equipo ${code} removido de la lista.`);
  };

  const [isDragging, setIsDragging] = useState(false);

  const processFileList = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setLoading(true);
    try {
      const fileItems: InventoryFileItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith(".csv") || fileName.endsWith(".txt")) {
          try {
            const rawText = await file.text();
            fileItems.push({ name: file.name, text: rawText });
          } catch (fileErr) {
            console.warn(`No se pudo leer el archivo ${file.name}:`, fileErr);
          }
        }
      }

      if (fileItems.length === 0) {
        toast.error("No se encontraron archivos .csv o .txt válidos.");
        return;
      }

      const results = parsePowerShellInventory(fileItems);
      setParsedResults(results);

      // Pre-fill assignment if user matched
      const initialAssign: Record<string, string> = {};
      results.forEach((res) => {
        const localUser = res.notebook.currentUserLocal?.toLowerCase() || "";
        if (localUser) {
          const matchedUser = users.find((u) => (u.fullName || u.username || "").toLowerCase().includes(localUser) || u.email?.toLowerCase().includes(localUser));
          if (matchedUser) {
            initialAssign[res.equipmentCode] = matchedUser.id;
          }
        }
      });
      setAssignments(initialAssign);

      toast.success(`Se procesaron ${results.length} equipos.`);
    } catch (err: any) {
      console.error(err);
      toast.error(`Error al procesar los archivos: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFileList(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFileList(e.dataTransfer.files);
    }
  };

  const loadSampleFromInventario = async () => {
    setLoading(true);
    try {
      const sampleFiles = [
        "NTBMGSIS002_inventario_windows.csv",
        "NTBMGSIS002_claves_windows.txt",
        "NTBMGSIS002_slmgr_dlv.txt",
        "NTBMGSIS002_slmgr_xpr.txt",
      ];

      const fileItems: InventoryFileItem[] = [];

      for (const fileName of sampleFiles) {
        try {
          const res = await fetch(`/Inventario/${fileName}`);
          if (res.ok) {
            const text = await res.text();
            fileItems.push({ name: fileName, text });
          }
        } catch {
          // Ignore if missing
        }
      }

      if (fileItems.length === 0) {
        toast.error("No se pudieron cargar los archivos de muestra desde /Inventario");
        return;
      }

      const results = parsePowerShellInventory(fileItems);
      setParsedResults(results);

      const initialAssign: Record<string, string> = {};
      results.forEach((res) => {
        const localUser = res.notebook.currentUserLocal?.toLowerCase() || "";
        if (localUser) {
          const matchedUser = users.find((u) => (u.fullName || u.username || "").toLowerCase().includes(localUser));
          if (matchedUser) {
            initialAssign[res.equipmentCode] = matchedUser.id;
          }
        }
      });
      setAssignments(initialAssign);

      toast.success(`Cargada muestra de /Inventario (${results.length} equipo)`);
    } catch (err: any) {
      console.error(err);
      toast.error(`Error al cargar archivos de muestra: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (parsedResults.length === 0) return;

    setLoading(true);
    let countAdded = 0;
    let countUpdated = 0;

    for (const item of parsedResults) {
      const nb = { ...item.notebook };
      const selectedUserId = assignments[item.equipmentCode];

      if (selectedUserId && selectedUserId !== "none") {
        const usr = users.find((u) => u.id === selectedUserId);
        if (usr) {
          nb.status = "in-use";
          nb.currentAssignment = {
            id: `asgn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            notebookId: nb.id,
            userId: usr.id,
            userName: usr.fullName || usr.username,
            area: usr.location || "N/A",
            assignedAt: new Date().toISOString(),
            type: "permanent",
          };
        }
      }

      // Check if already exists in state by internalCode
      const existing = notebooks.find((n) => n.internalCode.toLowerCase() === nb.internalCode.toLowerCase());

      if (existing) {
        await updateNotebook(existing.id, { ...existing, ...nb });
        countUpdated++;
      } else {
        await addNotebook(nb);
        countAdded++;
      }
    }

    setLoading(false);
    toast.success(`Importación completada: ${countAdded} creados, ${countUpdated} actualizados.`);
    onClose();
    setParsedResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-w-[95vw] w-full max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="shrink-0 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileCode className="size-6 text-primary" />
            Importar Inventario desde PowerShell
          </DialogTitle>
          <DialogDescription>
            Seleccioná la carpeta completa con los informes (<code>.csv</code> y <code>.txt</code>) o subí los archivos directamente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Upload Area */}
          {parsedResults.length === 0 ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                isDragging
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <Folder className={`size-12 mb-2 transition-transform ${isDragging ? "scale-110 text-primary animate-bounce" : "text-primary/70"}`} />
              <p className="text-base font-semibold">Arrastrá y soltá la carpeta o archivos acá</p>
              <p className="text-xs text-muted-foreground mt-1 mb-5 max-w-md">
                Podés arrastrar la carpeta directamente para evitar el cartel del navegador, o usar las opciones de selección abajo.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Directory picker */}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    {...({ webkitdirectory: "", directory: "" } as any)}
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button variant="default" size="lg" asChild disabled={loading} className="gap-2 shadow-sm">
                    <span>
                      {loading ? <Loader2 className="size-4 animate-spin" /> : <Folder className="size-4" />}
                      Seleccionar Carpeta Completa
                    </span>
                  </Button>
                </label>

                {/* Individual file picker */}
                <label className="cursor-pointer">
                  <Input
                    type="file"
                    multiple
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button variant="outline" size="lg" asChild disabled={loading} className="gap-2">
                    <span>
                      <Upload className="size-4" />
                      Seleccionar Archivos
                    </span>
                  </Button>
                </label>

                <Button variant="secondary" size="lg" onClick={loadSampleFromInventario} disabled={loading} className="gap-2">
                  <Sparkles className="size-4 text-amber-500" />
                  Probar con Muestra (/public/Inventario)
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-muted/40 rounded-lg p-3 border">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                <span className="font-semibold">{parsedResults.length} equipo(s) detectado(s) en la carpeta</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    {...({ webkitdirectory: "", directory: "" } as any)}
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button variant="outline" size="sm" asChild disabled={loading} className="gap-1.5 text-xs">
                    <span>
                      <Folder className="size-3.5" />
                      Cambiar Carpeta
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          )}

          {/* Results Table */}
          {parsedResults.length > 0 && (
            <div className="space-y-3">
              <div className="w-full overflow-x-auto border rounded-md bg-background">
                <Table className="w-full min-w-[650px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código / Tipo</TableHead>
                      <TableHead>Marca & Modelo</TableHead>
                      <TableHead>Hardware</TableHead>
                      <TableHead>Claves de Licencia</TableHead>
                      <TableHead>Asignar Usuario</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedResults.map((res) => {
                      const nb = res.notebook;
                      const Icon = nb.category === "desktop" ? Monitor : Laptop;

                      return (
                        <TableRow key={res.equipmentCode}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Icon className="size-4 text-muted-foreground shrink-0" />
                              <div>
                                <div className="font-bold text-sm">{nb.internalCode}</div>
                                <div className="text-xs text-muted-foreground capitalize">{nb.category}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-semibold">{nb.brand} {nb.model}</div>
                            <div className="text-xs text-muted-foreground">S/N: {nb.serialNumber || "N/A"}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">{nb.processor}</div>
                            <div className="text-xs text-muted-foreground">RAM: {nb.ram} | {nb.storage}</div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {res.oemKeyFound ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]">
                                  <Key className="mr-1 size-3" /> Clave OEM BIOS
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                  Sin Clave OEM
                                </Badge>
                              )}
                              <div>
                                <Badge variant="secondary" className="text-[10px]">
                                  {nb.activationStatus || "Activado"}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={assignments[res.equipmentCode] || "none"}
                              onValueChange={(val) =>
                                setAssignments((prev) => ({ ...prev, [res.equipmentCode]: val }))
                              }
                            >
                              <SelectTrigger className="w-[180px] h-8 text-xs">
                                <SelectValue placeholder="Sin Asignar" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Sin Asignar (En Stock)</SelectItem>
                                {users.map((u) => (
                                  <SelectItem key={u.id} value={u.id}>
                                    {u.fullName || u.username} ({u.location})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="text-muted-foreground hover:text-destructive"
                              title="Remover de la lista"
                              onClick={() => removeResult(res.equipmentCode)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={parsedResults.length === 0 || loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
            Confirmar e Importar ({parsedResults.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
