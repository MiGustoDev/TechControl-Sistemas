import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, Image as ImageIcon, X, CheckCircle2, AlertCircle, FileCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TaskImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (imageDataUrl: string) => void;
  taskTitle: string;
  cardTitle: string;
}

// Compress image using HTML5 Canvas to keep Data URL lightweight for storage
const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto 2D del Canvas"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export function TaskImageUploadModal({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  cardTitle
}: TaskImageUploadModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, seleccioná un archivo de imagen válido (JPG, PNG, WEBP)");
      return;
    }

    try {
      setIsProcessing(true);
      const compressed = await compressImage(file);
      setSelectedImage(compressed);
      toast.success("Imagen cargada correctamente");
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("No se pudo procesar la imagen");
    } finally {
      setIsProcessing(false);
    }
  }, []);

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          handleFileProcess(file);
          break;
        }
      }
    }
  };

  const handleConfirm = () => {
    if (!selectedImage) {
      toast.error("Debés cargar una imagen de comprobante para marcar la tarea");
      return;
    }
    onConfirm(selectedImage);
    handleClose();
  };

  const handleClose = () => {
    setSelectedImage(null);
    setIsDragging(false);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className="max-w-lg overflow-hidden border border-border shadow-2xl bg-background/95 backdrop-blur-md"
        onPaste={handlePaste}
      >
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
              <FileCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Comprobante de Tarea</DialogTitle>
              <DialogDescription className="text-xs">
                Adjuntá una imagen para verificar la realización de la tarea.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Card & Task context badges */}
          <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">Evento / Campaña:</span>
              <span className="font-semibold text-foreground truncate">{cardTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">Tarea a completar:</span>
              <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs font-semibold">
                {taskTitle}
              </Badge>
            </div>
          </div>

          {/* Dropzone or Image Preview */}
          {!selectedImage ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 select-none ${
                isDragging
                  ? "border-orange-500 bg-orange-500/10 scale-[1.01]"
                  : "border-muted-foreground/30 hover:border-orange-500/50 bg-muted/20 hover:bg-muted/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
              
              <div className={`p-4 rounded-full mb-3 transition-colors ${
                isDragging ? "bg-orange-500/20 text-orange-500" : "bg-muted text-muted-foreground"
              }`}>
                <UploadCloud className="size-8" />
              </div>

              <p className="text-sm font-semibold text-foreground text-center">
                {isDragging ? "Soltá la imagen aquí" : "Arrastrá tu imagen aquí o haz clic para buscar"}
              </p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Soporta JPG, PNG, WEBP (o pegá directamente con Ctrl+V)
              </p>

              {isProcessing && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-xl backdrop-blur-xs">
                  <div className="flex items-center gap-2 text-sm font-medium text-orange-500">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent" />
                    Procesando imagen...
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-border/80 bg-slate-950 group">
              <img
                src={selectedImage}
                alt="Vista previa del comprobante"
                className="w-full h-56 object-contain bg-black/60"
              />
              <div className="absolute top-2 right-2 flex gap-1.5">
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="size-8 rounded-full shadow-lg opacity-90 hover:opacity-100"
                  onClick={() => setSelectedImage(null)}
                  title="Cambiar imagen"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-center justify-between text-xs text-white">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="size-4" /> Imagen lista para adjuntar
                </span>
                <button
                  type="button"
                  className="text-xs underline text-slate-300 hover:text-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Cambiar
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2 pt-2 flex flex-row justify-end">
          <Button
            type="button"
            disabled={!selectedImage || isProcessing}
            onClick={handleConfirm}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold flex items-center gap-1.5"
          >
            <CheckCircle2 className="size-4" /> Confirmar y marcar
          </Button>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
