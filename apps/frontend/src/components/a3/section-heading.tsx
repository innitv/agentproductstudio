import * as React from "react"

import { cn } from "@/lib/utils"

import { Eyebrow, type EyebrowTone } from "./eyebrow"

/**
 * Заголовочная тройка `eyebrow → H2 → лид`.
 *
 * Главный повторяемый узел страницы — важнее любого компонента
 * (STYLE_GUIDE.md → Слой B). Именно поэтому она компонент, а не три элемента
 * подряд в каждой секции: пять копий разъехались бы по отступам на первой же
 * правке.
 *
 * Кегль H2 берётся утилитой продуктового слоя: 22/28 на mobile и 28/36 на
 * desktop — обе точки сняты с образца (`43:299` и `41:114`). Библиотечная шкала
 * `--text-*` не правится: 28 стоит между `text-2xl` (24) и `text-3xl` (30), и
 * переопределение шкалы доехало бы до экранов, которые об этом не просили.
 *
 * Мобильное значение раньше отсутствовало (`reference-analysis.md` помечал его
 * `needs validation`), и заголовок шёл на mobile тем же кеглем 28/36, что на
 * desktop.
 *
 * Лид ограничен 680 px и стоит слева — правая половина остаётся пустой
 * намеренно (осознанная асимметрия образца, занимать её контентом запрещено).
 */
export function SectionHeading({
  className,
  eyebrow,
  id,
  lead,
  title,
  tone = "brand",
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  eyebrow: string
  /** id заголовка — на него ссылается `aria-labelledby` секции. */
  id: string
  lead?: React.ReactNode
  title: React.ReactNode
  tone?: EyebrowTone
}) {
  return (
    <div className={cn("max-w-[680px]", className)} {...props}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2
        className="mt-3.5 text-[1.375rem]/[1.75rem] font-semibold tracking-tight lg:text-[1.75rem]/[2.25rem]"
        id={id}
      >
        {title}
      </h2>
      {lead ? (
        <p className="text-muted-foreground mt-6 text-[1rem]/[1.625rem] lg:mt-8 lg:text-[1.125rem]/[1.75rem]">
          {lead}
        </p>
      ) : null}
    </div>
  )
}
