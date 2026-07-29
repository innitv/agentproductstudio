import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Метка над заголовком секции — mono, caps, разрядка +6%.
 *
 * Это НЕ заголовок: элемент `p`, а не `h*`. Заголовочный тег добавил бы в
 * дерево фантомный уровень между `h1` и `h2` (`Accessibility Notes` →
 * «Порядок заголовков»), а axe-правило `heading-order` этого не ловит: там
 * иерархия формально не рвётся, просто появляется пустой смысловой уровень.
 *
 * Mono здесь одна из трёх разрешённых ролей моноширинного начертания
 * (eyebrow, машиночитаемое значение, мета документа) — STYLE_GUIDE.md.
 */
export type EyebrowTone = "brand" | "footer" | "inverse"

const toneClass: Record<EyebrowTone, string> = {
  brand: "text-primary",
  footer: "text-[#7d9ae3]",
  inverse: "text-[#aec1ef]",
}

export function Eyebrow({
  className,
  tone = "brand",
  ...props
}: React.ComponentProps<"p"> & { tone?: EyebrowTone }) {
  return (
    <p
      className={cn(
        "font-mono text-[0.75rem]/[1rem] font-medium tracking-[0.06em] uppercase lg:text-[0.8125rem]/[1rem]",
        toneClass[tone],
        className,
      )}
      data-slot="a3-eyebrow"
      {...props}
    />
  )
}
