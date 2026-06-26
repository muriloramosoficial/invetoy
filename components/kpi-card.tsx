import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

type KpiAccent = "brand" | "info" | "warning" | "danger";

const accentStyles: Record<KpiAccent, string> = {
  brand: "border-t-brand",
  info: "border-t-brand-info",
  warning: "border-t-brand-warning",
  danger: "border-t-brand-danger",
};

interface KpiCardProps {
  label: string;
  value: string | number;
  accent?: KpiAccent;
  trend?: {
    direction: "up" | "down";
    percentage: number;
  };
  subtitle?: string;
  className?: string;
}

export function KpiCard({
  label,
  value,
  accent = "brand",
  trend,
  subtitle,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-[6px] bg-bg-surface border border-border-default p-5",
        "border-t-2 transition-all duration-200",
        accentStyles[accent],
        className
      )}
    >
      <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-text-muted mb-2">
        {label}
      </p>

      <p className="text-4xl font-semibold leading-none text-text-primary tracking-tight font-mono">
        {value}
      </p>

      {trend && (
        <div className="flex items-center gap-1.5 mt-2">
          {trend.direction === "up" ? (
            <TrendingUp className="h-3.5 w-3.5 text-brand" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-brand-danger" />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              trend.direction === "up" ? "text-brand" : "text-brand-danger"
            )}
          >
            {trend.percentage}%
          </span>
          {subtitle && (
            <span className="text-xs text-text-muted">{subtitle}</span>
          )}
        </div>
      )}

      {!trend && subtitle && (
        <p className="text-xs text-text-muted mt-2">{subtitle}</p>
      )}
    </div>
  );
}
