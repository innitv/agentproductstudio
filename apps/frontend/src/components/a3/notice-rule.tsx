import * as React from "react"

import { Alert } from "@/components/shadcn/alert"
import { cn } from "@/lib/utils"

import { Eyebrow } from "./eyebrow"

/**
 * Правовая констатация: левый бордюр 2–3 px брендовым, без заливки.
 *
 * Собран на библиотечном `Alert`, а не написан с нуля: роль совпадает
 * (выделенное утверждение в потоке), а рамка и радиус обнуляются классами.
 * Уровня `warning` у `Alert` в библиотеке нет — здесь он и не нужен: на
 * странице ровно один тон, и второго акцентного цвета быть не должно.
 *
 * Заливки нет намеренно. Подложка сделала бы из констатации «плашку с
 * предупреждением», а страница раскрытия информации не предупреждает — она
 * сообщает.
 */
export function NoticeRule({
  children,
  className,
  label,
  weight = "thin",
  ...props
}: React.ComponentProps<"div"> & {
  /** Метка над значением (mono caps), как в callout лицензии. */
  label?: string
  /** 2 px в hero, 3 px в секции надзора — так в образце. */
  weight?: "thick" | "thin"
}) {
  return (
    <Alert
      className={cn(
        "grid-cols-1 gap-1 rounded-none border-0 bg-transparent px-4 py-1.5",
        weight === "thin" ? "border-l-2" : "border-l-[3px]",
        "border-l-primary",
        className,
      )}
      data-slot="a3-notice-rule"
      /*
       * `Alert` ставит `role="alert"` — это живая область: скринридер объявит
       * её как срочное обновление при загрузке страницы. Констатация лицензии
       * срочной не является, поэтому роль заменяется на `note`.
       */
      role="note"
      {...props}
    >
      {/*
       * Метка — тот же `Eyebrow`, что над заголовками секций, а не его копия
       * классами: копия отстала от оригинала на mobile-точке (12 против 13 на
       * desktop) и рассогласовала две одинаковые по роли надписи.
       */}
      {label ? <Eyebrow>{label}</Eyebrow> : null}
      <div className="text-[1rem]/[1.625rem]">{children}</div>
    </Alert>
  )
}
