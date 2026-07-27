import type { Meta, StoryObj } from "@storybook/react-vite"
import { HelpCircle } from "lucide-react"

import { Button } from "./button"
import { ShadcnStoryShell } from "./story-shell"
import type { ShadcnTheme } from "./theme-scope"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

/**
 * Подсказка снимается открытой: её содержимое тоже уходит порталом на body.
 * Ниже показан отступ, чтобы всплывающий слой не выходил за кадр вьюпорта.
 */
const meta = {
  title: "shadcn/Overlays/Tooltip",
} satisfies Meta

export default meta

type Story = StoryObj<{ theme: ShadcnTheme }>

const render = (theme: ShadcnTheme) => (
  <ShadcnStoryShell caption="открытая подсказка" theme={theme}>
    <div style={{ height: 72 }} />
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger asChild>
          <Button size="icon" variant="outline" aria-label="Как считается лимит">
            <HelpCircle />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Лимит обнуляется первого числа. Изменить его можно без перевыпуска карты.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <div style={{ height: 72 }} />
  </ShadcnStoryShell>
)

export const Default: Story = { render: () => render("default") }
export const Branded: Story = { render: () => render("branded") }
