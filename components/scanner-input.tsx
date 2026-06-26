"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScanLine } from "lucide-react";

interface ScannerInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onScan?: (value: string) => void;
}

export function ScannerInput({
  className,
  label,
  onScan,
  ...props
}: ScannerInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onScan) {
      onScan((e.target as HTMLInputElement).value);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={cn(
            "flex h-14 w-full rounded-[4px] border-2 border-dashed bg-bg-primary/50 px-4 py-3 pl-12",
            "text-lg text-text-primary font-mono tracking-wider placeholder:text-text-muted/40",
            "border-brand/30 focus:border-brand focus:ring-0",
            "transition-all duration-200",
            "focus:neon-glow",
            className
          )}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
          {...props}
        />
        <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand/60" />
      </div>
      <p className="mt-1 text-[10px] text-text-muted font-mono">
        Scan or type SKU manually and press Enter
      </p>
    </div>
  );
}
