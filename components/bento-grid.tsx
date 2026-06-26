import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: React.ReactNode;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
  className?: string;
}

export function BentoCard({
  children,
  colSpan = 1,
  rowSpan = 1,
  className,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        colSpan > 1 && `md:col-span-${colSpan}`,
        rowSpan > 1 && `md:row-span-${rowSpan}`,
        "rounded-[6px] bg-bg-surface border border-border-default p-5",
        "min-h-[120px]",
        className
      )}
      style={{
        gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined,
        gridRow: rowSpan > 1 ? `span ${rowSpan}` : undefined,
      }}
    >
      {children}
    </div>
  );
}
