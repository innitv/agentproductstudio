import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

import { FunctionButton } from "@/components/ui/function-button";
import { cn } from "@/lib/utils";

export type InlineNotificationColorScheme = "info" | "success" | "warning" | "error";

export interface InlineNotificationAction {
  actionIcon?: React.ReactNode;
  icon?: React.ReactNode;
  label: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: "primary" | "secondary" | "tertiary";
}

export interface InlineNotificationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  actions?: InlineNotificationAction[];
  closeButton?: boolean;
  colorScheme?: InlineNotificationColorScheme;
  icon?: React.ReactNode;
  onClose?: () => void;
  subtitle?: React.ReactNode;
  title?: React.ReactNode;
}

const inlineNotificationIcons: Record<InlineNotificationColorScheme, React.ReactNode> = {
  error: <XCircle aria-hidden="true" />,
  info: <Info aria-hidden="true" />,
  success: <CheckCircle2 aria-hidden="true" />,
  warning: <AlertTriangle aria-hidden="true" />,
};

export const InlineNotification = React.forwardRef<HTMLDivElement, InlineNotificationProps>(
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
        className={cn("a3-inline-notification", className)}
        data-color-scheme={colorScheme}
        ref={ref}
        role={role ?? (colorScheme === "error" ? "alert" : "status")}
        {...props}
      >
        <div className="a3-inline-notification__icon-container">{icon ?? inlineNotificationIcons[colorScheme]}</div>
        <div className="a3-inline-notification__content">
          <div className="a3-inline-notification__body">
            <div className="a3-inline-notification__text">
              {title ? <div className="a3-inline-notification__title">{title}</div> : null}
              {subtitle ? <div className="a3-inline-notification__subtitle">{subtitle}</div> : null}
              {children}
            </div>
            {closeButton ? (
              <button
                aria-label="Close notification"
                className="a3-inline-notification__close"
                onClick={onClose}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            ) : null}
          </div>
          {actions.length > 0 ? (
            <div className="a3-inline-notification__actions">
              {actions.slice(0, 2).map((action, index) => (
                <FunctionButton
                  actionIcon={action.actionIcon}
                  icon={action.icon}
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant ?? "secondary"}
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

InlineNotification.displayName = "InlineNotification";
