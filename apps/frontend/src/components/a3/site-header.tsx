import * as React from "react"
import { ChevronRight, Menu } from "lucide-react"

import { Button } from "@/components/shadcn/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/shadcn/sheet"
import { cn } from "@/lib/utils"

import { Container } from "./layout"

/** Логотип-марка: квадрат 28 радиусом 6 и слово рядом. Собран вёрсткой. */
export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <a
      aria-label="ООО РНКО «А3 Финанс» — на начало страницы"
      className="flex items-center gap-2"
      data-testid="a3-logo"
      href="#top"
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-7 place-items-center rounded-[6px] text-[0.8125rem]/[1rem] font-semibold",
          inverse ? "bg-white text-[#003399]" : "bg-primary text-primary-foreground",
        )}
      >
        А3
      </span>
      <span className="text-[1rem]/[1.5rem] font-semibold">Финанс</span>
    </a>
  )
}

export interface NavItem {
  href: string
  label: string
}

/**
 * Шапка страницы: sticky, три якоря на desktop и панель-список на mobile.
 *
 * `navigation-menu` из реестра здесь избыточен — он про раскрывающиеся
 * подменю, которых у трёх якорей нет. Мобильное меню — `Sheet`, а не
 * dropdown: в образце это панель со строками и шевроном, и Radix даёт к ней
 * фокус-ловушку и возврат фокуса на бургер бесплатно.
 *
 * Состояние `scrolled` приходит пропом, а не считается внутри: только так оно
 * снимается эталоном детерминированно. Тень появляется за 150 ms и только в
 * прокрученном состоянии — под неприкреплённой шапкой тени нет.
 */
export function SiteHeader({
  items,
  menuOpen = false,
  onMenuOpenChange,
  onNavigate,
  scrolled = false,
}: {
  items: readonly NavItem[]
  menuOpen?: boolean
  onMenuOpenChange?: (open: boolean) => void
  onNavigate?: (href: string) => void
  scrolled?: boolean
}) {
  return (
    <header
      className={cn(
        "bg-background border-border sticky top-0 z-30 border-b transition-shadow duration-150 ease-out",
        scrolled && "shadow-[var(--shadow-header)]",
      )}
      data-scrolled={scrolled}
      data-testid="a3-header"
    >
      <Container>
        <div className="flex h-15 items-center justify-between lg:h-18">
          <Logo />

          <nav aria-label="Разделы страницы" className="hidden sm:block">
            <ul className="flex items-center gap-8">
              {items.map((item) => (
                <li key={item.href}>
                  <a
                    className="hover:text-primary focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-sm text-[0.875rem]/[1.375rem] transition-colors duration-150 ease-out outline-none"
                    href={item.href}
                    onClick={() => onNavigate?.(item.href)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <Sheet onOpenChange={onMenuOpenChange} open={menuOpen}>
            <Button
              aria-controls="a3-mobile-menu"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              className="size-11 sm:hidden"
              data-testid="a3-menu-toggle"
              onClick={() => onMenuOpenChange?.(!menuOpen)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Menu className="size-5" />
            </Button>

            <SheetContent
              className="w-[min(320px,85vw)] gap-0"
              data-testid="a3-mobile-menu"
              id="a3-mobile-menu"
              side="right"
            >
              <SheetHeader className="border-border border-b">
                <SheetTitle className="text-left text-[1rem]/[1.5rem] font-semibold">
                  Разделы
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Разделы страницы">
                <ul>
                  {items.map((item) => (
                    <li key={item.href}>
                      <a
                        className="border-border hover:bg-accent flex min-h-12 items-center justify-between gap-3 border-b px-4 text-[0.9375rem]/[1.375rem] transition-colors duration-150 ease-out"
                        href={item.href}
                        onClick={() => {
                          onNavigate?.(item.href)
                          onMenuOpenChange?.(false)
                        }}
                      >
                        {item.label}
                        <ChevronRight aria-hidden="true" className="text-muted-foreground size-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  )
}
