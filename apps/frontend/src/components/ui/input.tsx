import * as React from "react";

import { cn } from "@/lib/utils";

export type InputSize = "l" | "m" | "s";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  counter?: React.ReactNode;
  hint?: React.ReactNode;
  invalid?: boolean;
  label?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: InputSize;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      counter,
      disabled,
      hint,
      id,
      invalid = false,
      label,
      leftIcon,
      rightIcon,
      size = "m",
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const counterId = counter ? `${inputId}-counter` : undefined;
    const describedBy = [props["aria-describedby"], hintId, counterId].filter(Boolean).join(" ") || undefined;

    return (
      <div
        className={cn("a3-input", `a3-input--${size}`, className)}
        data-disabled={disabled ? "true" : undefined}
        data-invalid={invalid ? "true" : undefined}
      >
        {label ? (
          <label className="a3-input__label" htmlFor={inputId}>
            {label}
          </label>
        ) : null}
        <div className="a3-input__control">
          {leftIcon ? <span className="a3-input__icon">{leftIcon}</span> : null}
          <input
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            className="a3-input__field"
            disabled={disabled}
            id={inputId}
            ref={ref}
            {...props}
          />
          {rightIcon ? <span className="a3-input__icon">{rightIcon}</span> : null}
        </div>
        {hint || counter ? (
          <div className="a3-input__footer">
            {hint ? (
              <span className="a3-input__hint" id={hintId}>
                {hint}
              </span>
            ) : (
              <span />
            )}
            {counter ? (
              <span className="a3-input__counter" id={counterId}>
                {counter}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
