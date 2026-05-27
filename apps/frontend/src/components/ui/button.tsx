import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "a3-button",
  {
    variants: {
      variant: {
        default: "a3-button--primary",
        primary: "a3-button--primary",
        secondary: "a3-button--secondary",
        outline: "a3-button--outline",
        ghost: "a3-button--ghost",
      },
      size: {
        default: "a3-button--m",
        s: "a3-button--s",
        sm: "a3-button--s",
        m: "a3-button--m",
        l: "a3-button--l",
        lg: "a3-button--l",
        xl: "a3-button--xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  leadingIcon?: React.ReactNode;
  actionIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ actionIcon, children, className, leadingIcon, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const content =
      asChild && !leadingIcon && !actionIcon ? (
        children
      ) : (
        <>
          {leadingIcon ? <span className="a3-button__icon">{leadingIcon}</span> : null}
          <span className="a3-button__label">{children}</span>
          {actionIcon ? <span className="a3-button__icon">{actionIcon}</span> : null}
        </>
      );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {content}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { buttonVariants };
