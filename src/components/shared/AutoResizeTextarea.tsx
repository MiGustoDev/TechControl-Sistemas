import React, { useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface AutoResizeTextareaProps extends React.ComponentProps<typeof Textarea> {
  minHeight?: number;
  maxHeight?: number;
}

export function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  className,
  rows = 2,
  minHeight = 60,
  maxHeight = 240,
  ...props
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      const newHeight = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
      el.style.height = `${newHeight}px`;
      el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        adjustHeight();
      }}
      rows={rows}
      placeholder={placeholder}
      className={cn("resize-none transition-[height] duration-75", className)}
      {...props}
    />
  );
}

