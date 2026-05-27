import * as React from "react";

import { cn } from "@/lib/utils";

export type RadioSize = "s" | "xs";

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label?: React.ReactNode;
  size?: RadioSize;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, disabled, id, label, size = "s", ...props }, ref) => {
    const generatedId = React.useId();
    const radioId = id ?? generatedId;

    return (
      <label
        className={cn("a3-radio", `a3-radio--${size}`, className)}
        data-disabled={disabled ? "true" : undefined}
      >
        <input
          className="a3-radio__input"
          disabled={disabled}
          id={radioId}
          ref={ref}
          type="radio"
          {...props}
        />
        <span className="a3-radio__control" aria-hidden="true">
          <span className="a3-radio__circle">
            <span className="a3-radio__dot" />
          </span>
        </span>
        {label ? <span className="a3-radio__label">{label}</span> : null}
      </label>
    );
  },
);

Radio.displayName = "Radio";
