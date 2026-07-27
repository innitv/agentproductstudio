import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowRight, Plus } from "lucide-react"

import { Button } from "./button"
import { ShadcnStoryRow, ShadcnStoryShell } from "./story-shell"
import type { ShadcnTheme } from "./theme-scope"

/**
 * Кнопка shadcn на штатной теме реестра.
 *
 * История показывает полную матрицу вариантов, размеров и состояний одним
 * кадром: это точка отсчёта «как компонент выглядит из коробки», от которой
 * будет считаться отличие проектной темы, когда та появится.
 */
const meta = {
  title: "shadcn/Actions/Button",
} satisfies Meta

export default meta

type Story = StoryObj<{ theme: ShadcnTheme }>

const render = (theme: ShadcnTheme) => (
  <ShadcnStoryShell caption="варианты, размеры, состояния" theme={theme}>
    <ShadcnStoryRow>
      <Button>Отправить</Button>
      <Button variant="secondary">Сохранить</Button>
      <Button variant="outline">Отменить</Button>
      <Button variant="ghost">Пропустить</Button>
      <Button variant="link">Правила</Button>
    </ShadcnStoryRow>
    <ShadcnStoryRow>
      <Button size="sm">Мелкая</Button>
      <Button>Обычная</Button>
      <Button size="lg">Крупная</Button>
      <Button size="icon" aria-label="Добавить">
        <Plus />
      </Button>
    </ShadcnStoryRow>
    <ShadcnStoryRow>
      <Button variant="destructive">Удалить черновик</Button>
      <Button disabled>Недоступна</Button>
      <Button variant="outline">
        Дальше <ArrowRight />
      </Button>
    </ShadcnStoryRow>
  </ShadcnStoryShell>
)

export const Default: Story = { render: () => render("default") }
