import * as React from "react";
import { cn } from "@core/utils";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("text-xs font-medium text-text-secondary uppercase tracking-wide", className)} {...props} />
  )
);
Label.displayName = "Label";

export { Label };
