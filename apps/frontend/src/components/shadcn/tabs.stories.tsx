import type { Meta, StoryObj } from "@storybook/react-vite"

import { ShadcnStoryShell } from "./story-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import type { ShadcnTheme } from "./theme-scope"

const meta = {
  title: "shadcn/Navigation/Tabs",
} satisfies Meta

export default meta

type Story = StoryObj<{ theme: ShadcnTheme }>

const render = (theme: ShadcnTheme) => (
  <ShadcnStoryShell caption="вариант default и вариант line" theme={theme}>
    <Tabs defaultValue="request">
      <TabsList>
        <TabsTrigger value="request">Заявка</TabsTrigger>
        <TabsTrigger value="route">Маршрут</TabsTrigger>
        <TabsTrigger value="history">История</TabsTrigger>
      </TabsList>
      <TabsContent className="text-sm" value="request">
        Данные сотрудника, тип карты и лимит.
      </TabsContent>
    </Tabs>
    <Tabs defaultValue="all">
      <TabsList variant="line">
        <TabsTrigger value="all">Все</TabsTrigger>
        <TabsTrigger value="mine">Мои</TabsTrigger>
        <TabsTrigger value="overdue">Просроченные</TabsTrigger>
      </TabsList>
      <TabsContent className="text-sm" value="all">
        Показаны все заявки подразделения.
      </TabsContent>
    </Tabs>
  </ShadcnStoryShell>
)

export const Default: Story = { render: () => render("default") }
