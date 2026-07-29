import * as React from "react"

import { ShadcnThemeScope } from "@/components/shadcn/theme-scope"

/**
 * Оболочка историй продуктового слоя А3.
 *
 * Ставит тему `a3` и полотно нужной ширины. Компонент, снятый вне темы,
 * показывал бы штатный slate и системный шрифт — то есть не тот интерфейс,
 * который увидит пользователь.
 *
 * Ширина по умолчанию 1200 — контейнер страницы на 1440. Компонентам, которые
 * живут в узкой колонке (строка меню, кнопки), ширина задаётся явно.
 */
export function A3StoryShell({
  children,
  className,
  padded = true,
  width = 1200,
}: {
  children: React.ReactNode
  className?: string
  padded?: boolean
  width?: number | string
}) {
  return (
    <ShadcnThemeScope
      className={className}
      style={{ padding: padded ? 24 : 0, width }}
      theme="a3"
    >
      {children}
    </ShadcnThemeScope>
  )
}
