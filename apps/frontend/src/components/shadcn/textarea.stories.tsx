import type { Meta, StoryObj } from "@storybook/react-vite"

import { Label } from "./label"
import { ShadcnStoryShell } from "./story-shell"
import { Textarea } from "./textarea"
import type { ShadcnTheme } from "./theme-scope"

const meta = {
  title: "shadcn/Forms/Textarea",
} satisfies Meta

export default meta

type Story = StoryObj<{ theme: ShadcnTheme }>

const render = (theme: ShadcnTheme) => (
  <ShadcnStoryShell caption="заполненное, пустое, ошибка" theme={theme}>
    <div style={{ display: "grid", gap: 6 }}>
      <Label htmlFor={`why-${theme}`}>Зачем сотруднику корпоративная карта</Label>
      <Textarea
        defaultValue="Сотрудник ведёт четыре региональных проекта и оплачивает такси и проживание из личных средств. Корпоративная карта убирает авансовые отчёты и ускоряет закрытие месяца."
        id={`why-${theme}`}
        rows={5}
      />
      <p className="text-muted-foreground text-sm">183 / 400</p>
    </div>
    <div style={{ display: "grid", gap: 6 }}>
      <Label htmlFor={`empty-${theme}`}>Комментарий согласующему</Label>
      <Textarea id={`empty-${theme}`} placeholder="Необязательно" rows={3} />
    </div>
    <div style={{ display: "grid", gap: 6 }}>
      <Label htmlFor={`short-${theme}`}>Обоснование</Label>
      <Textarea aria-invalid defaultValue="Нужна карта." id={`short-${theme}`} rows={3} />
      <p className="text-destructive text-sm">
        Обоснование короче 30 символов не проходит согласование
      </p>
    </div>
  </ShadcnStoryShell>
)

export const Default: Story = { render: () => render("default") }
