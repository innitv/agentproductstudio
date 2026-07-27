import type { Meta, StoryObj } from "@storybook/react-vite"

import { Label } from "./label"
import { RadioGroup, RadioGroupItem } from "./radio-group"
import { ShadcnStoryShell } from "./story-shell"
import type { ShadcnTheme } from "./theme-scope"

const meta = {
  title: "shadcn/Forms/RadioGroup",
} satisfies Meta

export default meta

type Story = StoryObj<{ theme: ShadcnTheme }>

const row = { alignItems: "center", display: "flex", gap: 10 } as const

const render = (theme: ShadcnTheme) => (
  <ShadcnStoryShell caption="выбор цели заявки" theme={theme}>
    <Label>Что делаем</Label>
    <RadioGroup defaultValue="new">
      <div style={row}>
        <RadioGroupItem id={`new-${theme}`} value="new" />
        <Label htmlFor={`new-${theme}`}>Выпускаем новую карту</Label>
      </div>
      <div style={row}>
        <RadioGroupItem id={`reissue-${theme}`} value="reissue" />
        <Label htmlFor={`reissue-${theme}`}>Перевыпускаем существующую</Label>
      </div>
      <div style={row}>
        <RadioGroupItem disabled id={`transfer-${theme}`} value="transfer" />
        <Label htmlFor={`transfer-${theme}`}>Переносим карту в другое подразделение</Label>
      </div>
    </RadioGroup>
  </ShadcnStoryShell>
)

export const Default: Story = { render: () => render("default") }
export const Branded: Story = { render: () => render("branded") }
