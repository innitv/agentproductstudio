import type { Meta, StoryObj } from "@storybook/react-vite"
import { CreditCard, Smartphone } from "lucide-react"

import { ShadcnStoryShell } from "./story-shell"
import type { ShadcnTheme } from "./theme-scope"
import { ToggleGroup, ToggleGroupItem } from "./toggle-group"

/**
 * Ближайший аналог сегментированного контрола. Обязательный выбор одного из
 * двух значений в shadcn отдельным компонентом не покрыт: `ToggleGroup` в
 * режиме `single` допускает пустое значение, поэтому «тип карты не выбран» —
 * состояние, которого в форме быть не должно, но которое компонент разрешает.
 */
const meta = {
  title: "shadcn/Navigation/ToggleGroup",
} satisfies Meta

export default meta

type Story = StoryObj<{ theme: ShadcnTheme }>

const render = (theme: ShadcnTheme) => (
  <ShadcnStoryShell caption="тип карты и период" theme={theme}>
    <ToggleGroup defaultValue="virtual" type="single" variant="outline">
      <ToggleGroupItem value="virtual">
        <Smartphone />
        Виртуальная
      </ToggleGroupItem>
      <ToggleGroupItem value="plastic">
        <CreditCard />
        Пластиковая
      </ToggleGroupItem>
    </ToggleGroup>
    <ToggleGroup defaultValue="month" spacing={1} type="single">
      <ToggleGroupItem value="week">Неделя</ToggleGroupItem>
      <ToggleGroupItem value="month">Месяц</ToggleGroupItem>
      <ToggleGroupItem value="quarter">Квартал</ToggleGroupItem>
    </ToggleGroup>
  </ShadcnStoryShell>
)

export const Default: Story = { render: () => render("default") }
