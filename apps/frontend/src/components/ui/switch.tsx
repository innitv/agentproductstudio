import * as React from "react";

import { cn } from "@/lib/utils";

export type SwitchSize = "s" | "xs";
export type SwitchLabelPosition = "right" | "left";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label?: React.ReactNode;
  labelPosition?: SwitchLabelPosition;
  size?: SwitchSize;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      checked,
      className,
      defaultChecked,
      disabled,
      id,
      label,
      labelPosition = "right",
      size = "s",
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const switchId = id ?? generatedId;

    return (
      <label
        className={cn("a3-switch", `a3-switch--${size}`, `a3-switch--label-${labelPosition}`, className)}
        data-disabled={disabled ? "true" : undefined}
      >
        <input
          checked={checked}
          className="a3-switch__input"
          defaultChecked={defaultChecked}
          disabled={disabled}
          id={switchId}
          ref={ref}
          role="switch"
          type="checkbox"
          {...props}
        />
        <span className="a3-switch__track" aria-hidden="true">
          <span className="a3-switch__knob" />
        </span>
        {label ? (
          <span className="a3-switch__label" data-position={labelPosition}>
            {label}
          </span>
        ) : null}
      </label>
    );
  },
);

Switch.displayName = "Switch";
