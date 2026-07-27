import type { Meta, StoryObj } from "@storybook/react-vite"

import { Input } from "./input"
import { Label } from "./label"
import { ShadcnStoryShell } from "./story-shell"
import type { ShadcnTheme } from "./theme-scope"

const meta = {
  title: "shadcn/Forms/Input",
} satisfies Meta

export default meta

type Story = StoryObj<{ theme: ShadcnTheme }>

const render = (theme: ShadcnTheme) => (
  <ShadcnStoryShell caption="обычное, с подсказкой, ошибка, недоступное" theme={theme}>
    <div style={{ display: "grid", gap: 6 }}>
      <Label htmlFor={`name-${theme}`}>Фамилия, имя и отчество</Label>
      <Input defaultValue="Орлов Денис Игоревич" id={`name-${theme}`} />
    </div>
    <div style={{ display: "grid", gap: 6 }}>
      <Label htmlFor={`mail-${theme}`}>Рабочая почта</Label>
      <Input id={`mail-${theme}`} placeholder="name@a3.example" type="email" />
      <p className="text-muted-foreground text-sm">На неё придёт доступ в мобильное приложение</p>
    </div>
    <div style={{ display: "grid", gap: 6 }}>
      <Label htmlFor={`limit-${theme}`}>Месячный лимит</Label>
      <Input aria-invalid defaultValue="0" id={`limit-${theme}`} inputMode="numeric" />
      <p className="text-destructive text-sm">Укажите месячный лимит числом</p>
    </div>
    <div style={{ display: "grid", gap: 6 }}>
      <Label htmlFor={`locked-${theme}`}>Номер заявки</Label>
      <Input defaultValue="CR-2418" disabled id={`locked-${theme}`} />
    </div>
  </ShadcnStoryShell>
)

export const Default: Story = { render: () => render("default") }
