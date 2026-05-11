import { cn } from "@/lib/utils";
import { levelColor } from "@/lib/utils-app";

interface LevelBarProps {
  level: number;
  label?: string;
  className?: string;
}

export function LevelBar({ level, label, className }: LevelBarProps) {
  const color = levelColor(level);
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span className="font-medium text-foreground">{level}%</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  );
}
