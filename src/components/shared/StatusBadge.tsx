import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  colorClass: string;
  className?: string;
}

export function StatusBadge({ label, colorClass, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm",
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}
