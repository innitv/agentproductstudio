import type { Meta, StoryObj } from "@storybook/react-vite"
import { CalendarClock, MoreHorizontal, Trash2, UserRound } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { Button } from "./button"
import { ShadcnStoryShell } from "./story-shell"
import type { ShadcnTheme } from "./theme-scope"

const meta = {
  title: "shadcn/Overlays/DropdownMenu",
} satisfies Meta

export default meta

type Story = StoryObj<{ theme: ShadcnTheme }>

const render = (theme: ShadcnTheme) => (
  <ShadcnStoryShell caption="раскрытое меню действий" theme={theme}>
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="Другие действия с заявкой">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Действия с заявкой</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <CalendarClock />
            История изменений
            <DropdownMenuShortcut>12 мая</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <UserRound />
            Передать другому автору
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 />
          Удалить черновик
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <div style={{ height: 220 }} />
  </ShadcnStoryShell>
)

export const Default: Story = { render: () => render("default") }
