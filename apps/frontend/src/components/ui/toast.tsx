import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

import { FunctionButton } from "@/components/ui/function-button";
import { cn } from "@/lib/utils";

export type ToastColorScheme = "info" | "success" | "warning" | "error";

export interface ToastAction {
  icon?: React.ReactNode;
  label: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: "primary" | "secondary" | "tertiary";
}

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  actions?: ToastAction[];
  closeButton?: boolean;
  colorScheme?: ToastColorScheme;
  icon?: React.ReactNode;
  onClose?: () => void;
  subtitle?: React.ReactNode;
  title?: React.ReactNode;
}

const toastIcons: Record<ToastColorScheme, React.ReactNode> = {
  error: <XCircle aria-hidden="true" />,
  info: <Info aria-hidden="true" />,
  success: <CheckCircle2 aria-hidden="true" />,
  warning: <AlertTriangle aria-hidden="true" />,
};

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      actions = [],
      children,
      className,
      closeButton = true,
      colorScheme = "info",
      icon,
      onClose,
      role,
      subtitle,
      title,
      ...props
    },
    ref,
  ) => (
    <div
      className={cn("a3-toast", className)}
      data-color-scheme={colorScheme}
      ref={ref}
      role={role ?? (colorScheme === "error" ? "alert" : "status")}
      {...props}
    >
      <div className="a3-toast__icon-container">{icon ?? toastIcons[colorScheme]}</div>
      <div className="a3-toast__content">
        <div className="a3-toast__body">
          <div className="a3-toast__text">
            {title ? <div className="a3-toast__title">{title}</div> : null}
            {subtitle ? <div className="a3-toast__subtitle">{subtitle}</div> : null}
            {children}
          </div>
          {closeButton ? (
            <button aria-label="Close notification" className="a3-toast__close" onClick={onClose} type="button">
              <X aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {actions.length > 0 ? (
          <div className="a3-toast__actions">
            {actions.slice(0, 2).map((action, index) => (
              <FunctionButton
                icon={action.icon}
                key={index}
                onClick={action.onClick}
                variant={action.variant ?? (index === 0 ? "secondary" : "tertiary")}
              >
                {action.label}
              </FunctionButton>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  ),
);

Toast.displayName = "Toast";
