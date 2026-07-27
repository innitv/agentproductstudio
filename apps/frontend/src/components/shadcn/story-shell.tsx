import * as React from "react"

import { ShadcnThemeScope, type ShadcnTheme } from "./theme-scope"

/**
 * Общая оболочка историй shadcn.
 *
 * Каждая история одного компонента снимается в ДВУХ темах, поэтому оболочка
 * вынесена: иначе тридцать файлов повторяли бы одну и ту же обвязку и рано или
 * поздно разошлись бы по отступам, и сравнение тем перестало бы быть честным.
 *
 * Заголовок над содержимым показывает, какая тема на экране: в статичном
 * скриншот-эталоне иначе не отличить `default` от `branded` без исходника.
 */

export interface ShadcnStoryShellProps {
  children: React.ReactNode
  /** Подпись состояния или набора, показанного в истории. */
  caption?: string
  theme?: ShadcnTheme
  /** Ширина рабочей области; по умолчанию хватает форменным элементам. */
  width?: number
}

/**
 * Подписи всех объявленных тем.
 *
 * Компонентные истории снимаются в паре `default`/`branded`; `calm` и
 * `calm-typed` показываются на композиционном экране, где видны и геометрия, и
 * типографика сразу. Подписи объявлены здесь всё равно: `Record<ShadcnTheme, …>`
 * не даст добавить тему и забыть, как она называется на экране.
 */
const themeTitle: Record<ShadcnTheme, string> = {
  branded: "branded — казначейский терминал",
  calm: "calm — цвет branded, геометрия shadcn",
  "calm-typed": "calm-typed — то же плюс подгруженный шрифт",
  default: "default — штатный shadcn",
}

export function ShadcnStoryShell({
  caption,
  children,
  theme = "default",
  width = 520,
}: ShadcnStoryShellProps) {
  return (
    <ShadcnThemeScope style={{ padding: 24, width }} theme={theme}>
      <p
        style={{
          fontSize: 11,
          letterSpacing: "0.08em",
          margin: "0 0 16px",
          opacity: 0.55,
          textTransform: "uppercase",
        }}
      >
        {themeTitle[theme]}
        {caption ? ` · ${caption}` : ""}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
    </ShadcnThemeScope>
  )
}

/**
 * Ряд элементов одного компонента: варианты и состояния рядом, чтобы разница
 * между темами читалась не по одному экземпляру, а по всей матрице.
 */
export function ShadcnStoryRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 12 }}>
      {children}
    </div>
  )
}
