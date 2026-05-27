import * as React from "react";
import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

export type CheckboxSize = "s" | "xs";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label?: React.ReactNode;
  size?: CheckboxSize;
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, size = "s", indeterminate = false, disabled, id, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <label
        className={cn("a3-checkbox", `a3-checkbox--${size}`, className)}
        data-disabled={disabled ? "true" : undefined}
        data-indeterminate={indeterminate ? "true" : undefined}
        htmlFor={inputId}
      >
        <input
          aria-checked={indeterminate ? "mixed" : props.checked}
          className="a3-checkbox__input"
          disabled={disabled}
          id={inputId}
          ref={inputRef}
          type="checkbox"
          {...props}
        />
        <span className="a3-checkbox__control" aria-hidden="true">
          <span className="a3-checkbox__box">
            {indeterminate ? (
              <Minus className="a3-checkbox__icon a3-checkbox__icon--minus" />
            ) : (
              <Check className="a3-checkbox__icon a3-checkbox__icon--check" />
            )}
          </span>
        </span>
        {label ? <span className="a3-checkbox__label">{label}</span> : null}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
