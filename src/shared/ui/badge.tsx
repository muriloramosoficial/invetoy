import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@core/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[4px] border px-2 py-0.5 text-xs font-mono leading-5 transition-colors",
  {
    variants: {
      variant: {
        default: "border-brand-20 bg-brand-8 text-brand",
        success: "border-brand-20 bg-brand-8 text-brand",
        warning: "border-brand-warning-20 bg-brand-warning-8 text-brand-warning",
        danger: "border-brand-danger-20 bg-brand-danger-dim text-brand-danger",
        info: "border-brand-info-20 bg-brand-info-8 text-brand-info",
        neutral: "border-border-default bg-bg-surface text-text-secondary",
        outline: "border-border-default bg-transparent text-text-secondary",
      },
      size: {
        sm: "px-1.5 py-0 text-[10px]",
        md: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
