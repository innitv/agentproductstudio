import type { Meta, StoryObj } from "@storybook/react-vite"

import { Label } from "./label"
import { ShadcnStoryShell } from "./story-shell"
import { Switch } from "./switch"
import type { ShadcnTheme } from "./theme-scope"

/**
 * Переключатель — единственный компонент набора, чьи размеры заданы
 * произвольными значениями (`h-[1.15rem] w-8`), а не шкалой Tailwind. Токен
 * плотности его не двигает, поэтому в теме `branded` он выправлен правилом в
 * `branded-overrides.css`. Пара кадров показывает результат.
 */
const meta = {
  title: "shadcn/Forms/Switch",
} satisfies Meta

export default meta

type Story = StoryObj<{ theme: ShadcnTheme }>

const row = { alignItems: "center", display: "flex", gap: 10 } as const

const render = (theme: ShadcnTheme) => (
  <ShadcnStoryShell caption="включён, выключен, мелкий, недоступен" theme={theme}>
    <div style={row}>
      <Switch defaultChecked id={`confirm-${theme}`} />
      <Label htmlFor={`confirm-${theme}`}>Подтверждать каждую операцию в приложении</Label>
    </div>
    <div style={row}>
      <Switch id={`report-${theme}`} />
      <Label htmlFor={`report-${theme}`}>Присылать отчёт по расходам раз в неделю</Label>
    </div>
    <div style={row}>
      <Switch defaultChecked id={`small-${theme}`} size="sm" />
      <Label htmlFor={`small-${theme}`}>Мелкий размер</Label>
    </div>
    <div style={row}>
      <Switch disabled id={`locked-${theme}`} />
      <Label htmlFor={`locked-${theme}`}>Правило задано политикой компании</Label>
    </div>
  </ShadcnStoryShell>
)

export const Default: Story = { render: () => render("default") }
export const Branded: Story = { render: () => render("branded") }
