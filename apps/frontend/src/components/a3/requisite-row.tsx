import * as React from "react"

import { Button } from "@/components/shadcn/button"
import { cn } from "@/lib/utils"
import type { ValueKind } from "@/views/a3-finance.data"

/**
 * Строка таблицы реквизитов.
 *
 * Собственный компонент, а не `Item`, и это не вкусовщина: `Item` собран на
 * `flex-wrap`, а образцу нужна ЖЁСТКАЯ трёхколоночная сетка
 * `384 / 24 / 659 / 24 / 109`. Подписи всех 16 строк обязаны стоять в одну
 * вертикаль — иначе таблица перестаёт читаться как таблица, а перестаёт она
 * ровно на той строке, где подпись длиннее соседних (`screens.md` → узел 4).
 *
 * Разметка — `dt`/`dd` внутри общего `dl`, а не набор `div`: пара «подпись —
 * значение» это определение, и скринридер должен получить её парой.
 *
 * Кнопка копирования на mobile поднята с 36 до 44 px: тач-таргеты образца
 * (20–36) не проходят WCAG 2.5.8, и воспроизводить этот дефект не надо.
 */
export function RequisiteRow({
  className,
  copyLabel = "Скопировать",
  hint,
  kind = "data",
  label,
  onCopy,
  slug,
  value,
}: {
  className?: string
  copyLabel?: string
  hint?: string
  /**
   * Начертание значения. `data` — mono 15/24: цифры, коды, счета, почта.
   * `prose` — Sans 16/26: наименование, адрес, фраза. Признак приходит от
   * значения, а не назначается всей колонке: до 2026-07-29 mono стоял на всех
   * шестнадцати строках, включая шесть прозаических, и mobile-строки вырастали
   * до 213 px против 126–178 в образце.
   */
  kind?: ValueKind
  label: string
  onCopy?: (slug: string) => void
  slug: string
  value: string
}) {
  return (
    <div
      className={cn(
        "a3-requisite-grid a3-row-hover border-border border-b py-3.5 last:border-b-0 lg:py-4",
        className,
      )}
      data-testid={`a3-requisite-${slug}`}
    >
      <dt className="text-muted-foreground text-[0.8125rem]/[1.25rem] md:text-[0.875rem]/[1.375rem]">
        {label}
        {/*
         * Уточнение подписи — тот же `muted-foreground` (4.97:1 на белом), без
         * ослабления прозрачностью. Замер axe на `/80` дал провал 1.4.3: 80%
         * от #667085 над белым — это ≈3.4:1, то есть ниже порога для мелкого
         * текста. Второй уровень читается вложенностью, а не блёклостью.
         */}
        {hint ? (
          <span className="text-muted-foreground block text-[0.8125rem]/[1.25rem]">{hint}</span>
        ) : null}
      </dt>
      <dd
        className={cn(
          "a3-value m-0",
          kind === "prose"
            ? "text-[1rem]/[1.625rem]"
            : "font-mono text-[1rem]/[1.625rem] md:text-[0.9375rem]/[1.5rem]",
        )}
      >
        {value}
      </dd>
      {/*
       * `dd` вторым узлом: кнопка относится к тому же определению, а не к
       * следующему. Отдельный `div` между `dd` и `dt` сломал бы структуру `dl`.
       */}
      <dd className="m-0 justify-self-start md:justify-self-end">
        <Button
          aria-label={`Скопировать ${label}`}
          className="h-11 w-[109px] md:h-8"
          data-testid={`a3-requisite-${slug}-copy`}
          onClick={() => onCopy?.(slug)}
          size="sm"
          type="button"
          variant="outline"
        >
          {copyLabel}
        </Button>
      </dd>
    </div>
  )
}
