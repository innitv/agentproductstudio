import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Полотно страницы: поля 120 / 48 / 20 и контейнер не шире 1200.
 *
 * Padding стоит на внешнем боксе, а ограничение ширины — на внутреннем.
 * Обратный порядок (`max-w` + `px` на одном узле) дал бы на 1440 контент 960
 * вместо измеренных 1200: поля съели бы ширину изнутри ограничения.
 *
 * Числа взяты из `reference-analysis.md`: 1440 → поля 120, контейнер 1200;
 * 390 → поля 20, контейнер 350. Точка 768 (поля 48) образцом не задана и
 * помечена `needs validation`.
 */
export function Container({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("px-5 md:px-12 lg:px-[120px]", className)} {...props}>
      <div className="mx-auto w-full max-w-[1200px]">{children}</div>
    </div>
  )
}

/**
 * Секция страницы с якорем и вертикальным ритмом 96 / 72 / 56.
 *
 * Каждая секция — `section` с `aria-labelledby` на собственный `h2`: без этого
 * восемь блоков в дереве доступности читаются одним полотном.
 */
export function Section({
  children,
  className,
  id,
  labelledBy,
  ...props
}: React.ComponentProps<"section"> & { labelledBy: string }) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn("scroll-mt-[76px] py-14 md:py-18 lg:py-24", className)}
      id={id}
      {...props}
    >
      {children}
    </section>
  )
}
