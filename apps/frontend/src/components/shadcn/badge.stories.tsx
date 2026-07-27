import type { Meta, StoryObj } from "@storybook/react-vite"
import { ShieldCheck } from "lucide-react"

import { Badge } from "./badge"
import { ShadcnStoryRow, ShadcnStoryShell } from "./story-shell"
import type { ShadcnTheme } from "./theme-scope"

const meta = {
  title: "shadcn/Data/Badge",
} satisfies Meta

export default meta

type Story = StoryObj<{ theme: ShadcnTheme }>

const render = (theme: ShadcnTheme) => (
  <ShadcnStoryShell caption="статусы заявки" theme={theme}>
    <ShadcnStoryRow>
      <Badge>Черновик</Badge>
      <Badge variant="secondary">На согласовании</Badge>
      <Badge variant="outline">Отложена</Badge>
      <Badge variant="destructive">Отклонена</Badge>
    </ShadcnStoryRow>
    <ShadcnStoryRow>
      <Badge variant="secondary">
        <ShieldCheck />
        Безопасность пройдена
      </Badge>
      <Badge data-numeric>CR-2418</Badge>
      <Badge data-numeric variant="outline">
        80 000 ₽
      </Badge>
    </ShadcnStoryRow>
  </ShadcnStoryShell>
)

export const Default: Story = { render: () => render("default") }
export const Branded: Story = { render: () => render("branded") }
