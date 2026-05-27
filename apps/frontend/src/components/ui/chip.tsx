import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export type ChipVariant = "primary" | "secondary";
export type ChipSize = "m";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  actionIcon?: React.ReactNode;
  icon?: React.ReactNode;
  selected?: boolean;
  size?: ChipSize;
  variant?: ChipVariant;
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      actionIcon,
      children,
      className,
      disabled,
      icon,
      selected = false,
      size = "m",
      type = "button",
      variant = "primary",
      ...props
    },
    ref,
  ) => (
    <button
      aria-pressed={selected}
      className={cn("a3-chip", `a3-chip--${size}`, `a3-chip--${variant}`, className)}
      data-disabled={disabled ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      disabled={disabled}
      ref={ref}
      type={type}
      {...props}
    >
      {icon ? <span className="a3-chip__icon">{icon}</span> : null}
      <span className="a3-chip__label">{children}</span>
      {actionIcon !== undefined ? (
        <span className="a3-chip__action">{actionIcon}</span>
      ) : null}
    </button>
  ),
);

Chip.displayName = "Chip";

export const ChipDismissIcon = X;
