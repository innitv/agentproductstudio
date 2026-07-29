import * as React from "react"

import { ShadcnThemeScope, type ShadcnTheme } from "./theme-scope"

/**
 * Общая оболочка историй shadcn.
 *
 * Вынесена, чтобы шестнадцать файлов историй не повторяли одну и ту же обвязку:
 * разъехавшиеся отступы сделали бы эталоны несопоставимыми между компонентами.
 *
 * Заголовок над содержимым называет тему: в статичном скриншот-эталоне иначе
 * не видно, на какой теме он снят.
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
 * Тип `Record<ShadcnTheme, …>` держит таблицу полной: добавить тему и забыть
 * подпись компилятор не даст, а безымянная тема в эталоне неотличима от соседней.
 */
const themeTitle: Record<ShadcnTheme, string> = {
  a3: "a3 — тема продукта «А3 Финанс»",
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
