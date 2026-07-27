import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Контейнер темы shadcn.
 *
 * Компоненты под тему НЕ дублируются: все значения приходят через
 * CSS-переменные из `apps/frontend/src/styles/shadcn/tokens.generated.css`
 * (блоки `[data-shadcn-theme="default"]` и `[data-shadcn-theme="branded"]`).
 * Этот компонент только ставит атрибут — переключение темы это одна строка,
 * а не другой набор компонентов.
 *
 * Почему обёртка, а не `:root`: тема shadcn живёт РЯДОМ с дизайн-системой A3 в
 * одном приложении и одном Storybook. В `:root` переменные протекли бы на
 * страницы A3 и на всё, что рендерится вне темы.
 *
 * ─── ПРО ПОРТАЛЫ ────────────────────────────────────────────────────────────
 * Оверлеи Radix (`SelectContent`, `DropdownMenuContent`, `TooltipContent`)
 * уходят порталом в `document.body`, то есть ЗА пределы контейнера. Скоупнутые
 * переменные до них не доходят, и раскрытый список оказался бы некрашеным —
 * это не косметика, а «половина интерфейса мимо темы». Пробрасывать `container`
 * в каждый компонент — правка исходников shadcn в четырёх местах; вместо этого
 * атрибут темы зеркалится на `<body>` на время жизни контейнера. В CSS базовые
 * свойства (фон, цвет, шрифт) навешены только на `.shadcn-scope`, поэтому на
 * body попадают ровно переменные и ничего больше.
 */

/**
 * Темы shadcn, объявленные в `design/tokens/shadcn/`.
 *
 * `default` и `branded` — основная пара (штатный shadcn против брендовой
 * темы). `calm` и `calm-typed` — контрольные точки эксперимента «геометрия
 * против шрифта»: `calm` держит цвета `branded` при штатной геометрии,
 * `calm-typed` добавляет к ней реально подгруженные гарнитуры. Разделение
 * факторов проверяется машинно в `tooling/shadcn-tokens/build-shadcn-tokens.mjs`.
 */
export type ShadcnTheme = "default" | "branded" | "calm" | "calm-typed"

export interface ShadcnThemeScopeProps extends React.ComponentProps<"div"> {
  /**
   * Зеркалить тему на корень документа ради порталов и канвы. Выключается
   * только там, где оверлеев заведомо нет и нужна полная изоляция.
   */
  mirrorToBody?: boolean
  theme?: ShadcnTheme
}

export function ShadcnThemeScope({
  children,
  className,
  mirrorToBody = true,
  theme = "default",
  ...props
}: ShadcnThemeScopeProps) {
  React.useEffect(() => {
    if (!mirrorToBody) return undefined

    // Корень документа, а не body: за боксом страницы (overscroll, системные
    // зоны мобильного браузера) виден фон ИМЕННО html. Через body покрасить
    // его нельзя, а без этого в safe-area проступает брендовый синий фон
    // лендинга, заданный в `:root` файла styles.css.
    const root = document.documentElement
    const previous = root.dataset.shadcnTheme
    root.dataset.shadcnTheme = theme

    return () => {
      if (previous === undefined) {
        delete root.dataset.shadcnTheme
      } else {
        root.dataset.shadcnTheme = previous
      }
    }
  }, [mirrorToBody, theme])

  return (
    <div className={cn("shadcn-scope", className)} data-shadcn-theme={theme} {...props}>
      {children}
    </div>
  )
}
