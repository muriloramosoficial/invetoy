"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@core/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[4px] text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-brand text-black hover:bg-brand-hover hover:shadow-[0_0_20px_rgba(62,207,142,0.15)] active:scale-[0.98]",
        secondary:
          "border border-border-default bg-bg-surface text-text-primary hover:bg-bg-surface-hover hover:border-[#444] active:scale-[0.98]",
        ghost:
          "text-text-secondary hover:text-text-primary hover:bg-bg-surface active:scale-[0.98]",
        danger:
          "bg-brand-danger text-white hover:bg-[#d94449] active:scale-[0.98]",
        outline:
          "border border-border-default bg-transparent text-text-primary hover:border-brand-30 hover:neon-glow-hover active:scale-[0.98]",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, asChild, ...props }, ref) => {
    if (asChild && React.Children.count(children) === 1) {
      const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;
      return React.cloneElement(child, {
        className: cn(buttonVariants({ variant, size, className }), (child.props as Record<string, unknown>).className as string | undefined),
        ...props,
      });
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
