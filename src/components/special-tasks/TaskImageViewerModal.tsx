import React from "react";
import { X, ExternalLink, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TaskImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title: string;
  subtitle?: string;
}

export function TaskImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle
}: TaskImageViewerModalProps) {
  if (!imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `comprobante-${title.toLowerCase().replace(/\s+/g, "-")}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl border border-border bg-background/95 backdrop-blur-md shadow-2xl p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              📷 {title}
            </DialogTitle>
            {subtitle && (
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {subtitle}
              </DialogDescription>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs mr-6"
          >
            <Download className="size-3.5" /> Descargar
          </Button>
        </DialogHeader>

        <div className="relative rounded-xl overflow-hidden bg-slate-950/80 border border-border/60 flex items-center justify-center min-h-[300px] max-h-[70vh]">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[68vh] w-auto object-contain rounded-lg shadow-md"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
