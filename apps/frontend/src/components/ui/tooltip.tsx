import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export type TooltipPlacement =
  | "bottom-center"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "top-left"
  | "top-right"
  | "left-center"
  | "left-top"
  | "left-bottom"
  | "right-center"
  | "right-top"
  | "right-bottom";

export interface TooltipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "content" | "title"> {
  autoWidth?: boolean;
  closeButton?: boolean;
  content?: React.ReactNode;
  defaultOpen?: boolean;
  onClose?: () => void;
  open?: boolean;
  placement?: TooltipPlacement;
  subtitle?: React.ReactNode;
  title?: React.ReactNode;
}

export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(
  (
    {
      autoWidth = false,
      children,
      className,
      closeButton = false,
      content,
      defaultOpen = false,
      onClose,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      open,
      placement = "top-center",
      subtitle,
      title,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const tooltipId = props.id ?? generatedId;
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const isOpen = open ?? uncontrolledOpen;

    const setOpen = (nextOpen: boolean) => {
      if (open === undefined) {
        setUncontrolledOpen(nextOpen);
      }
    };

    return (
      <span
        className={cn("a3-tooltip-root", className)}
        onBlur={(event) => {
          onBlur?.(event);
          setOpen(false);
        }}
        onFocus={(event) => {
          onFocus?.(event);
          setOpen(true);
        }}
        onMouseEnter={(event) => {
          onMouseEnter?.(event);
          setOpen(true);
        }}
        onMouseLeave={(event) => {
          onMouseLeave?.(event);
          setOpen(false);
        }}
        ref={ref}
        {...props}
      >
        {children ? (
          <span aria-describedby={isOpen ? tooltipId : undefined} className="a3-tooltip__trigger">
            {children}
          </span>
        ) : null}
        {isOpen ? (
          <TooltipContent
            autoWidth={autoWidth}
            closeButton={closeButton}
            id={tooltipId}
            onClose={() => {
              onClose?.();
              setOpen(false);
            }}
            placement={placement}
            subtitle={subtitle}
            title={title}
          >
            {content}
          </TooltipContent>
        ) : null}
      </span>
    );
  },
);

Tooltip.displayName = "Tooltip";

export interface TooltipContentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  autoWidth?: boolean;
  closeButton?: boolean;
  onClose?: () => void;
  placement?: TooltipPlacement;
  subtitle?: React.ReactNode;
  title?: React.ReactNode;
}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  (
    {
      autoWidth = false,
      children,
      className,
      closeButton = false,
      onClose,
      placement = "top-center",
      subtitle,
      title,
      ...props
    },
    ref,
  ) => (
    <div
      className={cn("a3-tooltip", className)}
      data-auto-width={autoWidth ? "true" : undefined}
      data-placement={placement}
      ref={ref}
      role="tooltip"
      {...props}
    >
      <div className="a3-tooltip__content">
        {children ?? <TooltipLayout subtitle={subtitle} title={title} />}
        {closeButton ? (
          <button aria-label="Close tooltip" className="a3-tooltip__close" onClick={onClose} type="button">
            <X aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  ),
);

TooltipContent.displayName = "TooltipContent";

export interface TooltipLayoutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  subtitle?: React.ReactNode;
  title?: React.ReactNode;
}

export const TooltipLayout = React.forwardRef<HTMLDivElement, TooltipLayoutProps>(
  ({ className, subtitle, title, ...props }, ref) => (
    <div className={cn("a3-tooltip-layout", className)} ref={ref} {...props}>
      {title ? <div className="a3-tooltip-layout__title">{title}</div> : null}
      {subtitle ? <div className="a3-tooltip-layout__subtitle">{subtitle}</div> : null}
    </div>
  ),
);

TooltipLayout.displayName = "TooltipLayout";
