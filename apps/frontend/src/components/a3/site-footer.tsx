import * as React from "react"

import { cn } from "@/lib/utils"

import { Eyebrow } from "./eyebrow"
import { Container } from "./layout"
import { Logo } from "./site-header"
import type { FooterColumn, TariffsMode } from "@/views/a3-finance.data"

/**
 * Футер: реквизитный столбец 420 плюс три столбца ссылок.
 *
 * Вторая тёмная поверхность страницы (ink-navy без градиента) — тоже
 * локальный scope переменных, а не глобальная схема.
 *
 * Пункт «Тарифы» ведёт в раздел, которого на странице нет ни на одной точке
 * образца. Вёрстка не имеет права оставить ссылку в никуда, поэтому оба
 * решения живут в ОДНОМ компоненте и переключаются полем `tariffs`:
 *   `hidden`   — пункт не рендерится (дефолт первого релиза);
 *   `disabled` — пункт остаётся текстом с подписью «раздел готовится»,
 *                `aria-disabled` и вне порядка табуляции.
 * Две вёрстки под два ответа заказчика разъехались бы на первой же правке.
 */
export function SiteFooter({
  className,
  columns,
  copyright,
  licence,
  name,
  onNavigate,
  regulated,
  tariffs = "hidden",
}: {
  className?: string
  columns: FooterColumn[]
  copyright: string
  licence: string
  name: string
  onNavigate?: (href: string) => void
  regulated: string
  tariffs?: TariffsMode
}) {
  return (
    <footer className={cn("a3-footer", className)} data-testid="a3-footer">
      <Container className="py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-12">
          <div>
            <Logo inverse />
            <p className="mt-5 text-[1.125rem]/[1.625rem] font-semibold text-white">{name}</p>
            {/*
             * Строка лицензии — mono 13/20. Это машиночитаемое значение (номер
             * и ОГРН), то есть одна из трёх разрешённых ролей моноширинного, и
             * так же она набрана в образце (`41:374`). До 2026-07-29 здесь
             * стоял Sans 14 — зеркальная ошибка к mono на прозаических
             * значениях реквизитов.
             */}
            <p className="text-muted-foreground mt-2 font-mono text-[0.8125rem]/[1.25rem]">
              {licence}
            </p>
            <p className="text-muted-foreground mt-4 text-[0.875rem]/[1.375rem]">{copyright}</p>
            <p className="text-muted-foreground mt-1 text-[0.875rem]/[1.375rem]">{regulated}</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.heading}>
                <Eyebrow tone="footer">{column.heading}</Eyebrow>
                <ul className="mt-4 space-y-3">
                  {column.links
                    .filter((link) => !(link.key === "tariffs" && tariffs === "hidden"))
                    .map((link) => (
                      <li key={link.key}>
                        {link.href === null ? (
                          /*
                           * Цели нет — элемент не ссылка. `aria-disabled` без
                           * `href` держит пункт вне порядка табуляции: иначе
                           * клавиатура заводит пользователя в тупик.
                           */
                          <span
                            aria-disabled="true"
                            className="text-muted-foreground block text-[0.875rem]/[1.375rem]"
                            data-testid={`a3-footer-${link.key}`}
                          >
                            {link.text}
                            {link.note ? (
                              <span className="block text-[0.8125rem]/[1.25rem] opacity-80">
                                {link.note}
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          <a
                            className="focus-visible:ring-ring/50 rounded-sm text-[0.875rem]/[1.375rem] text-white/90 transition-colors duration-150 ease-out outline-none hover:text-white focus-visible:ring-[3px]"
                            data-testid={`a3-footer-${link.key}`}
                            href={link.href}
                            onClick={() => onNavigate?.(link.href as string)}
                          >
                            {link.text}
                          </a>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  )
}
