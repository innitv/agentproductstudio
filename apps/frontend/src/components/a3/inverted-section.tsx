import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Участок страницы с другой поверхностью.
 *
 * В shadcn такого нет: у системы один слой поверхностей плюс глобальная схема
 * `dark`, а она красит весь документ. Поэтому секция переопределяет CSS-
 * переменные ЛОКАЛЬНО, внутри своего поддерева (класс `.a3-inverted` в
 * `styles/a3.css`), и библиотечные компоненты внутри неё продолжают работать
 * без единой правки — они читают те же имена переменных.
 *
 * Граница приёма проходит по порталам: `SelectContent`, `DropdownMenuContent`,
 * `TooltipContent` и `sonner` рендерятся на КОРНЕ документа, вне этого
 * поддерева, и возьмут корневые светлые значения. Отсюда правило страницы:
 * копирования и тостов внутри инверсной секции нет, а история
 * `A3/InvertedSection/ToastInside` существует, чтобы поймать регрессию, если
 * портал здесь однажды появится.
 */
export function InvertedSection({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("a3-inverted", className)} data-slot="a3-inverted" {...props} />
}

/**
 * Светлая поверхность внутри инверсной секции — панель формы.
 *
 * Возвращает корневые значения переменных: ошибка, фокус и статус читаются
 * только на светлом. Красного и зелёного на синем на этой странице нет.
 */
export function LightSurface({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("a3-surface-light", className)} {...props} />
}
