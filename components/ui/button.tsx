import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "border border-[#3157d5] bg-[#3157d5] text-white shadow-[0_12px_28px_-14px_rgba(49,87,213,.65)] hover:-translate-y-0.5 hover:bg-[#284bbd] hover:shadow-[0_16px_34px_-14px_rgba(49,87,213,.7)] active:translate-y-0",
        secondary:
          "border border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-200/80",
        outline:
          "border border-slate-200 bg-white/80 text-slate-600 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700",
        ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-7 text-base",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
