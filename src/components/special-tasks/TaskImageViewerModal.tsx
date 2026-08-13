import React from "react";
import { X, ExternalLink, Download, Image as ImageIcon, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TaskImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title: string;
  subtitle?: string;
  isCurrentBanner?: boolean;
  onSetAsBanner?: () => void;
}

export function TaskImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
  isCurrentBanner,
  onSetAsBanner
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
      <DialogContent className="max-w-3xl border border-border bg-background/95 backdrop-blur-md shadow-2xl p-4 sm:p-6 overflow-hidden space-y-3">
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
          <div className="flex items-center gap-2 mr-6">
            {onSetAsBanner && (
              <Button
                type="button"
                variant={isCurrentBanner ? "secondary" : "outline"}
                size="sm"
                onClick={onSetAsBanner}
                className={`flex items-center gap-1.5 text-xs transition-all ${
                  isCurrentBanner
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-semibold"
                    : "hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/30"
                }`}
              >
                {isCurrentBanner ? (
                  <>
                    <Check className="size-3.5 text-emerald-500" /> Banner Asignado
                  </>
                ) : (
                  <>
                    <ImageIcon className="size-3.5 text-orange-500" /> Fijar como Banner
                  </>
                )}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs"
            >
              <Download className="size-3.5" /> Descargar
            </Button>
          </div>
        </DialogHeader>

        <div className="relative rounded-xl overflow-hidden bg-slate-950/80 border border-border/60 flex items-center justify-center min-h-[300px] max-h-[65vh]">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[63vh] w-auto object-contain rounded-lg shadow-md"
          />
        </div>

        {onSetAsBanner && (
          <div className="pt-2 flex items-center justify-between border-t border-border/50 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={!!isCurrentBanner}
                onChange={() => {
                  if (onSetAsBanner) {
                    onSetAsBanner();
                  }
                }}
                className="size-4 rounded accent-orange-600 cursor-pointer"
              />
              <span className="text-muted-foreground group-hover:text-foreground font-medium transition-colors">
                Asignar esta imagen como el banner visible en la tarjeta del evento/campaña
              </span>
            </label>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
