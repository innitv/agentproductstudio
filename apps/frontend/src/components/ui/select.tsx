import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";

export type SelectSize = "l" | "m" | "s";

export interface SelectOption {
  disabled?: boolean;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  label: React.ReactNode;
  value: string;
}

export interface SelectProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> {
  defaultOpen?: boolean;
  defaultValue?: string;
  hint?: React.ReactNode;
  invalid?: boolean;
  label?: React.ReactNode;
  leftIcon?: React.ReactNode;
  name?: string;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (value: string, option: SelectOption) => void;
  open?: boolean;
  options?: SelectOption[];
  placeholder?: React.ReactNode;
  size?: SelectSize;
  value?: string;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      children,
      className,
      defaultOpen = false,
      defaultValue,
      disabled,
      hint,
      id,
      invalid = false,
      label,
      leftIcon,
      name,
      onClick,
      onKeyDown,
      onOpenChange,
      onValueChange,
      open,
      options = [],
      placeholder = "Placeholder",
      size = "m",
      value,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    const hintId = hint ? `${selectId}-hint` : undefined;
    const listboxId = `${selectId}-listbox`;
    const rootRef = React.useRef<HTMLDivElement>(null);
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const isOpen = open ?? uncontrolledOpen;
    const selectedValue = value ?? uncontrolledValue;
    const selectedOption = options.find((option) => option.value === selectedValue);
    const displayValue = selectedOption?.label ?? children;
    const hasValue = Boolean(displayValue);

    const setOpen = React.useCallback(
      (nextOpen: boolean) => {
        if (open === undefined) {
          setUncontrolledOpen(nextOpen);
        }
        onOpenChange?.(nextOpen);
      },
      [onOpenChange, open],
    );

    React.useEffect(() => {
      if (!isOpen) {
        return;
      }

      const handlePointerDown = (event: PointerEvent) => {
        if (!rootRef.current?.contains(event.target as Node)) {
          setOpen(false);
        }
      };

      document.addEventListener("pointerdown", handlePointerDown);
      return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [isOpen, setOpen]);

    const handleSelect = (option: SelectOption) => {
      if (option.disabled) {
        return;
      }
      if (value === undefined) {
        setUncontrolledValue(option.value);
      }
      onValueChange?.(option.value, option);
      setOpen(false);
    };

    return (
      <div
        className={cn("a3-select", `a3-select--${size}`, className)}
        data-disabled={disabled ? "true" : undefined}
        data-invalid={invalid ? "true" : undefined}
        data-open={isOpen ? "true" : undefined}
        ref={rootRef}
      >
        {label ? (
          <label className="a3-select__label" htmlFor={selectId}>
            {label}
          </label>
        ) : null}
        {name ? <input name={name} type="hidden" value={selectedValue ?? ""} /> : null}
        <button
          aria-controls={isOpen ? listboxId : undefined}
          aria-describedby={hintId}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={invalid || undefined}
          className="a3-select__control"
          disabled={disabled}
          id={selectId}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) {
              setOpen(!isOpen);
            }
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented) {
              return;
            }
            if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen(true);
            }
            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          ref={ref}
          type="button"
          {...props}
        >
          {leftIcon ? <span className="a3-select__icon">{leftIcon}</span> : null}
          <span className="a3-select__value" data-placeholder={!hasValue ? "true" : undefined}>
            {hasValue ? displayValue : placeholder}
          </span>
          <span className="a3-select__icon a3-select__chevron">
            {isOpen ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
          </span>
        </button>
        {hint ? (
          <span className="a3-select__hint" id={hintId}>
            {hint}
          </span>
        ) : null}
        {isOpen ? (
          <Dropdown className="a3-select__dropdown" id={listboxId} menuRole="listbox">
            {options.map((option) => (
              <DropdownItem
                disabled={option.disabled}
                hint={option.hint}
                icon={option.icon}
                key={option.value}
                onClick={() => handleSelect(option)}
                role="option"
                selected={option.value === selectedValue}
                size={size === "s" ? "s" : "m"}
              >
                {option.label}
              </DropdownItem>
            ))}
          </Dropdown>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";
