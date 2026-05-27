import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const iconButtonVariants = cva("a3-icon-button", {
  variants: {
    colorScheme: {
      accent: "a3-icon-button--accent",
      neutral: "a3-icon-button--neutral",
    },
    size: {
      default: "a3-icon-button--m",
      s: "a3-icon-button--s",
      sm: "a3-icon-button--s",
      m: "a3-icon-button--m",
      l: "a3-icon-button--l",
      lg: "a3-icon-button--l",
      xl: "a3-icon-button--xl",
    },
    variant: {
      default: "a3-icon-button--primary",
      primary: "a3-icon-button--primary",
      secondary: "a3-icon-button--secondary",
      outline: "a3-icon-button--outline",
      ghost: "a3-icon-button--ghost",
    },
  },
  defaultVariants: {
    colorScheme: "accent",
    size: "default",
    variant: "default",
  },
});

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, colorScheme, icon, size, type = "button", variant, ...props }, ref) => (
    <button
      className={cn(iconButtonVariants({ colorScheme, size, variant, className }))}
      ref={ref}
      type={type}
      {...props}
    >
      <span className="a3-icon-button__icon">{icon}</span>
    </button>
  ),
);

IconButton.displayName = "IconButton";

export { iconButtonVariants };
