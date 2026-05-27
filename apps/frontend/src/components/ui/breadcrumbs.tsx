import * as React from "react";
import { MoreHorizontal } from "lucide-react";

import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  current?: boolean;
  disabled?: boolean;
  href?: string;
  label: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  defaultMenuOpen?: boolean;
  hiddenItems?: BreadcrumbItem[];
  items?: BreadcrumbItem[];
  menuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
}

export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  (
    {
      children,
      className,
      defaultMenuOpen = false,
      hiddenItems = [],
      items = [],
      menuOpen,
      onMenuOpenChange,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledMenuOpen, setUncontrolledMenuOpen] = React.useState(defaultMenuOpen);
    const isMenuOpen = menuOpen ?? uncontrolledMenuOpen;
    const hasHiddenItems = hiddenItems.length > 0;

    const setMenuOpen = (nextOpen: boolean) => {
      if (menuOpen === undefined) {
        setUncontrolledMenuOpen(nextOpen);
      }
      onMenuOpenChange?.(nextOpen);
    };

    const renderedItems = items.map((item, index) => (
      <React.Fragment key={index}>
        <BreadcrumbLink {...item} />
        {index < items.length - 1 ? <BreadcrumbSeparator /> : null}
      </React.Fragment>
    ));

    return (
      <nav aria-label="Breadcrumb" className={cn("a3-breadcrumbs", className)} ref={ref} {...props}>
        <ol className="a3-breadcrumbs__list">
          {hasHiddenItems && items[0] ? (
            <>
              <li>
                <BreadcrumbLink {...items[0]} />
              </li>
              <li>
                <BreadcrumbMoreButton
                  active={isMenuOpen}
                  hiddenItems={hiddenItems}
                  onOpenChange={setMenuOpen}
                  open={isMenuOpen}
                />
              </li>
              {items.slice(1).map((item, index) => (
                <React.Fragment key={index}>
                  <li>
                    <BreadcrumbSeparator />
                  </li>
                  <li>
                    <BreadcrumbLink {...item} />
                  </li>
                </React.Fragment>
              ))}
            </>
          ) : (
            renderedItems.map((item, index) => <li key={index}>{item}</li>)
          )}
          {children}
        </ol>
      </nav>
    );
  },
);

Breadcrumbs.displayName = "Breadcrumbs";

export interface BreadcrumbLinkProps extends BreadcrumbItem {
  className?: string;
}

export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, BreadcrumbLinkProps>(
  ({ className, current = false, disabled = false, href, label, onClick }, ref) => {
    const commonProps = {
      "aria-current": current ? ("page" as const) : undefined,
      className: cn("a3-breadcrumb", className),
      "data-current": current ? "true" : undefined,
      "data-disabled": disabled ? "true" : undefined,
    };

    if (href && !disabled && !current) {
      return (
        <a {...commonProps} href={href} onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>} ref={ref as React.Ref<HTMLAnchorElement>}>
          {label}
        </a>
      );
    }

    return (
      <button
        {...commonProps}
        disabled={disabled || current}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
      >
        {label}
      </button>
    );
  },
);

BreadcrumbLink.displayName = "BreadcrumbLink";

export const BreadcrumbSeparator = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span aria-hidden="true" className={cn("a3-breadcrumb-separator", className)} ref={ref} {...props} />
  ),
);

BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

export interface BreadcrumbMoreButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  hiddenItems?: BreadcrumbItem[];
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

export const BreadcrumbMoreButton = React.forwardRef<HTMLButtonElement, BreadcrumbMoreButtonProps>(
  ({ active = false, className, hiddenItems = [], onClick, onOpenChange, open = false, type = "button", ...props }, ref) => (
    <span className="a3-breadcrumb-more">
      <button
        aria-expanded={open}
        aria-haspopup={hiddenItems.length > 0 ? "menu" : undefined}
        aria-label="Show hidden breadcrumbs"
        className={cn("a3-breadcrumb-more__button", className)}
        data-active={active || open ? "true" : undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && hiddenItems.length > 0) {
            onOpenChange?.(!open);
          }
        }}
        ref={ref}
        type={type}
        {...props}
      >
        <MoreHorizontal aria-hidden="true" />
      </button>
      {open && hiddenItems.length > 0 ? (
        <Dropdown className="a3-breadcrumb-more__dropdown" menuRole="menu">
          {hiddenItems.map((item, index) => (
            <DropdownItem disabled={item.disabled} key={index} onClick={item.onClick as React.MouseEventHandler<HTMLButtonElement>} size="s">
              {item.label}
            </DropdownItem>
          ))}
        </Dropdown>
      ) : null}
    </span>
  ),
);

BreadcrumbMoreButton.displayName = "BreadcrumbMoreButton";
