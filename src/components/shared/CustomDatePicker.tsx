import { useState, useMemo, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface CustomDatePickerProps {
  value?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  minDate?: string;
  placeholder?: string;
  allowClear?: boolean;
  className?: string;
}

export function CustomDatePicker({
  value = "",
  onChange,
  disabled = false,
  minDate,
  placeholder = "dd/mm/aaaa",
  allowClear = false,
  className,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [today]);

  const selectedParts = useMemo(() => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [y, m, d] = value.split("-").map(Number);
    return { year: y, month: m - 1, day: d };
  }, [value]);

  const [viewYear, setViewYear] = useState(() => selectedParts?.year || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selectedParts?.month ?? today.getMonth());

  useEffect(() => {
    if (isOpen) {
      if (selectedParts) {
        setViewYear(selectedParts.year);
        setViewMonth(selectedParts.month);
      } else {
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
      }
    }
  }, [isOpen, selectedParts, today]);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const pad = (n: number) => n.toString().padStart(2, "0");

  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      const prevDay = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({
        day: prevDay,
        dateStr: `${prevY}-${pad(prevM + 1)}-${pad(prevDay)}`,
        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        day,
        dateStr: `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`,
        isCurrentMonth: true,
      });
    }

    const total = cells.length;
    const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (let day = 1; day <= remaining; day++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({
        day,
        dateStr: `${nextY}-${pad(nextM + 1)}-${pad(day)}`,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const displayFormattedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split("-");
    if (parts.length !== 3) return value;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }, [value]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-all flex items-center justify-between text-left select-none",
            disabled
              ? "opacity-50 cursor-not-allowed bg-muted/40"
              : "cursor-pointer hover:bg-accent/40 hover:border-orange-500/40 focus:outline-hidden focus:ring-1 focus:ring-orange-500",
            isOpen && "ring-1 ring-orange-500 border-orange-500/60",
            className
          )}
        >
          <span className={value ? "text-foreground font-semibold" : "text-muted-foreground font-normal"}>
            {value ? displayFormattedDate : placeholder}
          </span>
          <Calendar className="size-4 text-muted-foreground shrink-0 ml-2" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[280px] p-3 bg-popover/95 border border-border/80 shadow-2xl backdrop-blur-md rounded-xl z-[70] duration-150 ease-out"
      >
        <div className="space-y-3">
          {/* Header: Month & Year + Navigation */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black tracking-wide text-foreground capitalize">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="size-7 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md cursor-pointer"
                title="Mes anterior"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="size-7 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md cursor-pointer"
                title="Mes siguiente"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-muted-foreground uppercase tracking-wider">
            {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarGrid.map((c, idx) => {
              const isSelected = c.dateStr === value;
              const isToday = c.dateStr === todayStr;
              const isDisabled = Boolean(minDate && c.dateStr < minDate);

              return (
                <button
                  key={`${c.dateStr}-${idx}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(c.dateStr);
                    setIsOpen(false);
                  }}
                  className={`size-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all select-none cursor-pointer ${
                    isSelected
                      ? "bg-orange-500 text-white font-black shadow-md shadow-orange-500/25 scale-[1.05]"
                      : isDisabled
                      ? "text-muted-foreground/30 cursor-not-allowed opacity-40"
                      : isToday
                      ? "text-orange-500 font-extrabold ring-1 ring-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20"
                      : c.isCurrentMonth
                      ? "text-foreground hover:bg-accent/80 hover:text-foreground"
                      : "text-muted-foreground/40 hover:bg-accent/40"
                  }`}
                >
                  {c.day}
                </button>
              );
            })}
          </div>

          {/* Footer with Clear and Today shortcuts */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px]">
            {allowClear ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className="h-7 px-2 text-xs font-semibold text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
              >
                Borrar
              </Button>
            ) : (
              <span />
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(todayStr);
                setIsOpen(false);
              }}
              className="h-7 px-2 text-xs font-bold text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 ml-auto cursor-pointer"
            >
              Hoy
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

