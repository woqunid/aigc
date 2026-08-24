import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.12em]",
  {
    variants: {
      variant: {
        default: "border-blue-600 bg-primary text-white",
        secondary: "border-slate-200 bg-slate-50 text-slate-500",
        accent: "border-blue-200 bg-blue-50 text-blue-700",
        outline: "border-slate-200 bg-transparent text-slate-500",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
