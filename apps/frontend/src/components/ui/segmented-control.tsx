import * as React from "react";

import { cn } from "@/lib/utils";

export type SegmentedControlSize = "l" | "m" | "s";

export interface SegmentedControlOption {
  disabled?: boolean;
  icon?: React.ReactNode;
  label: React.ReactNode;
  value: string;
}

interface SegmentedControlContextValue {
  iconOnly: boolean;
  onValueChange?: (value: string) => void;
  size: SegmentedControlSize;
  value?: string;
}

const SegmentedControlContext = React.createContext<SegmentedControlContextValue | null>(null);

export interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  defaultValue?: string;
  iconOnly?: boolean;
  name?: string;
  onValueChange?: (value: string) => void;
  options?: SegmentedControlOption[];
  size?: SegmentedControlSize;
  value?: string;
}

export const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(
  (
    {
      children,
      className,
      defaultValue,
      iconOnly = false,
      name,
      onValueChange,
      options,
      size = "m",
      value,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? options?.[0]?.value);
    const selectedValue = value ?? uncontrolledValue;

    const handleValueChange = React.useCallback(
      (nextValue: string) => {
        if (value === undefined) {
          setUncontrolledValue(nextValue);
        }
        onValueChange?.(nextValue);
      },
      [onValueChange, value],
    );

    return (
      <SegmentedControlContext.Provider
        value={{
          iconOnly,
          onValueChange: handleValueChange,
          size,
          value: selectedValue,
        }}
      >
        <div
          className={cn("a3-segmented-control", `a3-segmented-control--${size}`, className)}
          data-icon-only={iconOnly ? "true" : undefined}
          ref={ref}
          role="radiogroup"
          {...props}
        >
          {name ? <input name={name} type="hidden" value={selectedValue ?? ""} /> : null}
          {(options ?? []).map((option) => (
            <SegmentedControlItem
              disabled={option.disabled}
              icon={option.icon}
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SegmentedControlItem>
          ))}
          {children}
        </div>
      </SegmentedControlContext.Provider>
    );
  },
);

SegmentedControl.displayName = "SegmentedControl";

export interface SegmentedControlItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  value: string;
}

export const SegmentedControlItem = React.forwardRef<HTMLButtonElement, SegmentedControlItemProps>(
  ({ children, className, disabled, icon, onClick, type = "button", value, ...props }, ref) => {
    const context = React.useContext(SegmentedControlContext);
    const selected = context?.value === value;
    const iconOnly = context?.iconOnly ?? false;
    const size = context?.size ?? "m";

    return (
      <button
        aria-checked={selected}
        className={cn("a3-segment", `a3-segment--${size}`, className)}
        data-disabled={disabled ? "true" : undefined}
        data-icon-only={iconOnly ? "true" : undefined}
        data-selected={selected ? "true" : undefined}
        disabled={disabled}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && !disabled) {
            context?.onValueChange?.(value);
          }
        }}
        ref={ref}
        role="radio"
        type={type}
        {...props}
      >
        {icon ? <span className="a3-segment__icon">{icon}</span> : null}
        {iconOnly ? null : <span className="a3-segment__label">{children}</span>}
      </button>
    );
  },
);

SegmentedControlItem.displayName = "SegmentedControlItem";
