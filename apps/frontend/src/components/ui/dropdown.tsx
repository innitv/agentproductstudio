import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type DropdownItemSize = "m" | "s";

export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  bottomPanel?: React.ReactNode;
  listClassName?: string;
  menuRole?: React.AriaRole;
  scroll?: boolean;
  topPanel?: React.ReactNode;
}

export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      bottomPanel,
      children,
      className,
      listClassName,
      menuRole = "menu",
      scroll = false,
      topPanel,
      ...props
    },
    ref,
  ) => (
    <div className={cn("a3-dropdown", className)} ref={ref} {...props}>
      {topPanel ? <div className="a3-dropdown__panel">{topPanel}</div> : null}
      <div
        className={cn("a3-dropdown__list", scroll && "a3-dropdown__list--scroll", listClassName)}
        role={menuRole}
      >
        {children}
      </div>
      {bottomPanel ? <div className="a3-dropdown__panel">{bottomPanel}</div> : null}
    </div>
  ),
);

Dropdown.displayName = "Dropdown";

export interface DropdownItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "prefix"> {
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  multiselect?: boolean;
  prefix?: React.ReactNode;
  selected?: boolean;
  size?: DropdownItemSize;
}

export const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  (
    {
      children,
      className,
      disabled,
      hint,
      icon,
      multiselect = false,
      prefix,
      role,
      selected = false,
      size = "m",
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      aria-checked={multiselect ? selected : undefined}
      className={cn("a3-dropdown-item", `a3-dropdown-item--${size}`, className)}
      data-disabled={disabled ? "true" : undefined}
      data-multiselect={multiselect ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      disabled={disabled}
      ref={ref}
      role={role ?? (multiselect ? "menuitemcheckbox" : "menuitem")}
      type={type}
      {...props}
    >
      {multiselect ? (
        <span className="a3-dropdown-item__check-slot" data-visible={selected ? "true" : undefined}>
          <Check aria-hidden="true" />
        </span>
      ) : null}
      {prefix ? <span className="a3-dropdown-item__prefix">{prefix}</span> : null}
      {icon ? <span className="a3-dropdown-item__icon">{icon}</span> : null}
      <span className="a3-dropdown-item__content">
        <span className="a3-dropdown-item__text">{children}</span>
        {hint ? <span className="a3-dropdown-item__hint">{hint}</span> : null}
      </span>
    </button>
  ),
);

DropdownItem.displayName = "DropdownItem";

export interface DropdownGroupTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: DropdownItemSize;
}

export const DropdownGroupTitle = React.forwardRef<HTMLDivElement, DropdownGroupTitleProps>(
  ({ children, className, size = "m", ...props }, ref) => (
    <div
      className={cn("a3-dropdown-group-title", `a3-dropdown-group-title--${size}`, className)}
      ref={ref}
      role="presentation"
      {...props}
    >
      {children}
    </div>
  ),
);

DropdownGroupTitle.displayName = "DropdownGroupTitle";

export interface DropdownDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: DropdownItemSize;
}

export const DropdownDivider = React.forwardRef<HTMLDivElement, DropdownDividerProps>(
  ({ className, size = "m", ...props }, ref) => (
    <div
      aria-hidden="true"
      className={cn("a3-dropdown-divider", `a3-dropdown-divider--${size}`, className)}
      ref={ref}
      role="separator"
      {...props}
    />
  ),
);

DropdownDivider.displayName = "DropdownDivider";
