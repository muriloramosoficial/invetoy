import { cn } from "@/lib/utils";

type TechBadgeVariant = "green" | "yellow" | "red" | "blue" | "gray";

const variantStyles: Record<TechBadgeVariant, string> = {
  green:
    "border-brand/20 bg-brand/[0.08] text-brand",
  yellow:
    "border-brand-warning/20 bg-brand-warning/[0.08] text-brand-warning",
  red:
    "border-brand-danger/20 bg-brand-danger-dim text-brand-danger",
  blue:
    "border-brand-info/20 bg-brand-info/[0.08] text-brand-info",
  gray:
    "border-border-default bg-bg-surface text-text-secondary",
};

interface TechBadgeProps {
  children: React.ReactNode;
  variant?: TechBadgeVariant;
  className?: string;
}

export function TechBadge({
  children,
  variant = "gray",
  className,
}: TechBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] border px-2 py-0.5",
        "font-mono text-[11px] leading-5 tracking-tight uppercase",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
