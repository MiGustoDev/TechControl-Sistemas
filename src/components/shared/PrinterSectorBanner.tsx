import { MapPin, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSectorAccent } from "@/lib/utils-app";

interface PrinterSectorBannerProps {
  sector: string;
  branch?: string;
  size?: "card" | "compact" | "inline";
  className?: string;
}

export function PrinterSectorBanner({
  sector,
  branch,
  size = "card",
  className,
}: PrinterSectorBannerProps) {
  const area = sector?.trim() || "Sin área";
  const accent = getSectorAccent(area);

  if (size === "inline") {
    return (
      <div className={cn("inline-flex flex-col gap-0.5", className)}>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-bold uppercase tracking-wide",
            accent.chip
          )}
        >
          <MapPin className="size-3.5 shrink-0" />
          {area}
        </span>
        {branch?.trim() && (
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider pl-0.5">
            {branch.trim()}
          </span>
        )}
      </div>
    );
  }

  if (size === "compact") {
    return (
      <div
        className={cn(
          "rounded-lg border px-3 py-2",
          accent.banner,
          className
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80">Área</p>
        <p className="text-base font-bold uppercase leading-tight tracking-wide">{area}</p>
        {branch?.trim() && (
          <p className="mt-0.5 flex items-center gap-1 text-xs font-medium opacity-90">
            <Building2 className="size-3 shrink-0" />
            {branch.trim()}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full border-b px-3 py-2.5",
        accent.banner,
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Área
          </p>
          <p className="mt-0.5 truncate text-base font-bold uppercase leading-tight tracking-wide">
            {area}
          </p>
        </div>
        {branch?.trim() && (
          <p className="flex shrink-0 items-center gap-1 pt-3 text-[11px] font-medium text-muted-foreground">
            <Building2 className="size-3 shrink-0" />
            <span className="max-w-[5.5rem] truncate">{branch.trim()}</span>
          </p>
        )}
      </div>
      {!branch?.trim() && (
        <p className="mt-0.5 text-[10px] text-muted-foreground italic">Sin sucursal</p>
      )}
    </div>
  );
}
