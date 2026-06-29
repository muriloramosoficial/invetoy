"use client";

import * as React from "react";
import { cn } from "@core/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              "flex h-10 w-full rounded-[4px] border bg-bg-surface px-3 py-2 pr-10 text-sm text-text-primary appearance-none",
              "border-border-default focus:border-brand-40 focus:ring-1 focus:ring-brand-20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-colors duration-150",
              error && "border-brand-danger",
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
        </div>
        {error && <p className="mt-1 text-xs text-brand-danger">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
