import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const functionButtonVariants = cva("a3-function-button", {
  variants: {
    variant: {
      default: "a3-function-button--primary",
      primary: "a3-function-button--primary",
      secondary: "a3-function-button--secondary",
      tertiary: "a3-function-button--tertiary",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface FunctionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof functionButtonVariants> {
  actionIcon?: React.ReactNode;
  icon?: React.ReactNode;
}

export const FunctionButton = React.forwardRef<HTMLButtonElement, FunctionButtonProps>(
  ({ actionIcon, children, className, icon, type = "button", variant, ...props }, ref) => (
    <button className={cn(functionButtonVariants({ variant, className }))} ref={ref} type={type} {...props}>
      {icon ? <span className="a3-function-button__icon">{icon}</span> : null}
      {children ? <span className="a3-function-button__label">{children}</span> : null}
      {actionIcon ? <span className="a3-function-button__icon">{actionIcon}</span> : null}
    </button>
  ),
);

FunctionButton.displayName = "FunctionButton";

export { functionButtonVariants };
