import { cn } from "@/lib/utils";
import { consumableUnitsColor } from "@/lib/utils-app";

interface ConsumableUnitsProps {
  count: number;
  min?: number;
  label?: string;
  className?: string;
}

export function ConsumableUnits({ count, min = 1, label, className }: ConsumableUnitsProps) {
  const safeCount = Math.max(0, count);
  const color = consumableUnitsColor(safeCount, min);
  const unitLabel = safeCount === 1 ? "unidad" : "unidades";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-md border border-border/50 bg-secondary/15 dark:bg-secondary/5 px-2.5 py-1.5 shadow-xs",
        className
      )}
    >
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <span className={cn("ml-auto text-sm font-semibold tabular-nums", color)}>
        {safeCount} {unitLabel}
      </span>
    </div>
  );
}
