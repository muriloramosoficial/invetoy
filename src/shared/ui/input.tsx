import * as React from "react";
import { cn } from "@core/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-[4px] border bg-bg-surface px-3 py-2 text-sm text-text-primary",
              "placeholder:text-text-muted-60",
              "border-border-default focus:border-brand-40 focus:ring-1 focus:ring-brand-20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-colors duration-150",
              icon && "pl-10",
              error && "border-brand-danger focus:border-brand-danger focus:ring-brand-danger-20",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-brand-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
