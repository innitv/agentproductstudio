import type { Meta, StoryObj } from "@storybook/react-vite"

import { Checkbox } from "./checkbox"
import { Label } from "./label"
import { ShadcnStoryShell } from "./story-shell"
import type { ShadcnTheme } from "./theme-scope"

const meta = {
  title: "shadcn/Forms/Checkbox",
} satisfies Meta

export default meta

type Story = StoryObj<{ theme: ShadcnTheme }>

const row = { alignItems: "flex-start", display: "flex", gap: 10 } as const

const render = (theme: ShadcnTheme) => (
  <ShadcnStoryShell caption="отмечен, снят, ошибка, недоступен" theme={theme}>
    <div style={row}>
      <Checkbox defaultChecked id={`rules-${theme}`} />
      <Label className="leading-snug" htmlFor={`rules-${theme}`}>
        Я ознакомился с регламентом корпоративных карт и отвечаю за расходы по этой карте
      </Label>
    </div>
    <div style={row}>
      <Checkbox id={`weekly-${theme}`} />
      <Label htmlFor={`weekly-${theme}`}>Присылать сотруднику отчёт раз в неделю</Label>
    </div>
    <div style={row}>
      <Checkbox aria-invalid id={`invalid-${theme}`} />
      <Label className="text-destructive" htmlFor={`invalid-${theme}`}>
        Без подтверждения регламента заявку не примут
      </Label>
    </div>
    <div style={row}>
      <Checkbox disabled id={`off-${theme}`} />
      <Label htmlFor={`off-${theme}`}>Выпуск карт в подразделении приостановлен</Label>
    </div>
  </ShadcnStoryShell>
)

export const Default: Story = { render: () => render("default") }
export const Branded: Story = { render: () => render("branded") }
