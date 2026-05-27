import * as React from "react";
import { CreditCard, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type InputCardSize = "l" | "m" | "s";

export interface InputCardProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  brandIcon?: React.ReactNode;
  counter?: React.ReactNode;
  hint?: React.ReactNode;
  invalid?: boolean;
  label?: React.ReactNode;
  onClear?: () => void;
  rightIcon?: React.ReactNode;
  size?: InputCardSize;
}

export const InputCard = React.forwardRef<HTMLInputElement, InputCardProps>(
  (
    {
      brandIcon,
      className,
      counter,
      disabled,
      hint,
      id,
      invalid = false,
      label,
      onClear,
      rightIcon,
      size = "m",
      value,
      defaultValue,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const counterId = counter ? `${inputId}-counter` : undefined;
    const describedBy = [props["aria-describedby"], hintId, counterId].filter(Boolean).join(" ") || undefined;
    const hasValue = value !== undefined ? String(value).length > 0 : defaultValue !== undefined;
    const leadingIcon = brandIcon ?? <CreditCard aria-hidden="true" />;
    const trailingIcon = rightIcon ?? (onClear ? <X aria-hidden="true" /> : null);

    return (
      <div
        className={cn("a3-input-card", `a3-input-card--${size}`, className)}
        data-disabled={disabled ? "true" : undefined}
        data-filled={hasValue ? "true" : undefined}
        data-invalid={invalid ? "true" : undefined}
      >
        {label && size !== "l" ? (
          <label className="a3-input-card__label" htmlFor={inputId}>
            {label}
          </label>
        ) : null}
        <div className="a3-input-card__control">
          <span className="a3-input-card__icon">{leadingIcon}</span>
          <span className="a3-input-card__content">
            {label && size === "l" ? (
              <label className="a3-input-card__label a3-input-card__label--inside" htmlFor={inputId}>
                {label}
              </label>
            ) : null}
            <input
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              className="a3-input-card__field"
              defaultValue={defaultValue}
              disabled={disabled}
              id={inputId}
              inputMode="numeric"
              ref={ref}
              value={value}
              {...props}
            />
          </span>
          {trailingIcon ? (
            onClear ? (
              <button
                aria-label="Clear card number"
                className="a3-input-card__action"
                disabled={disabled}
                onClick={onClear}
                type="button"
              >
                {trailingIcon}
              </button>
            ) : (
              <span className="a3-input-card__icon">{trailingIcon}</span>
            )
          ) : null}
        </div>
        {hint || counter ? (
          <div className="a3-input-card__footer">
            {hint ? (
              <span className="a3-input-card__hint" id={hintId}>
                {hint}
              </span>
            ) : (
              <span />
            )}
            {counter ? (
              <span className="a3-input-card__counter" id={counterId}>
                {counter}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);

InputCard.displayName = "InputCard";
