import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaSize = "l" | "m" | "s";

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  counter?: React.ReactNode;
  hint?: React.ReactNode;
  invalid?: boolean;
  label?: React.ReactNode;
  scroll?: boolean;
  size?: TextareaSize;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      counter,
      disabled,
      hint,
      id,
      invalid = false,
      label,
      scroll = true,
      size = "m",
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const hintId = hint ? `${textareaId}-hint` : undefined;
    const counterId = counter ? `${textareaId}-counter` : undefined;
    const describedBy = [props["aria-describedby"], hintId, counterId].filter(Boolean).join(" ") || undefined;

    return (
      <div
        className={cn("a3-textarea", `a3-textarea--${size}`, className)}
        data-disabled={disabled ? "true" : undefined}
        data-invalid={invalid ? "true" : undefined}
        data-scroll={scroll ? "true" : undefined}
      >
        {label ? (
          <label className="a3-textarea__label" htmlFor={textareaId}>
            {label}
          </label>
        ) : null}
        <textarea
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className="a3-textarea__field"
          disabled={disabled}
          id={textareaId}
          ref={ref}
          {...props}
        />
        {hint || counter ? (
          <div className="a3-textarea__footer">
            {hint ? (
              <span className="a3-textarea__hint" id={hintId}>
                {hint}
              </span>
            ) : (
              <span />
            )}
            {counter ? (
              <span className="a3-textarea__counter" id={counterId}>
                {counter}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
