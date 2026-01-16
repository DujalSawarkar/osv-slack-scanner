import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground border-border",
        outline: "bg-background text-foreground border-border",
        low: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300",
        avg: "bg-amber-500/10 text-amber-800 border-amber-500/20 dark:text-amber-300",
        high: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-300",
        unknown: "bg-muted text-muted-foreground border-border",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
