import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, waitFor, within } from "storybook/test"

import { A3StoryShell } from "./a3-story-shell"
import { SiteHeader } from "./site-header"
import { navigation } from "@/views/a3-finance.data"

/**
 * Шапка страницы.
 *
 * `scrolled` приходит пропом, а не считается внутри компонента: состояние,
 * которое зависит от позиции прокрутки, невозможно снять эталоном
 * детерминированно, а именно тень в прокрученном состоянии здесь и проверяется.
 */
const meta = {
  component: SiteHeader,
  parameters: { layout: "fullscreen" },
  title: "A3/SiteHeader",
} satisfies Meta<typeof SiteHeader>

export default meta

type Story = StoryObj<typeof meta>

const render = (args: React.ComponentProps<typeof SiteHeader>) => (
  <A3StoryShell className="min-h-[220px]" padded={false} width="100%">
    <SiteHeader {...args} />
    <div className="text-muted-foreground p-6 text-sm">
      Полотно под шапкой — чтобы тень прокрученного состояния было видно.
    </div>
  </A3StoryShell>
)

export const Default: Story = {
  args: { items: navigation, onMenuOpenChange: fn(), onNavigate: fn() },
  render,
}

export const Scrolled: Story = {
  args: { items: navigation, onMenuOpenChange: fn(), onNavigate: fn(), scrolled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("a3-header")).toHaveAttribute(
      "data-scrolled",
      "true",
    )
  },
  render,
}

/**
 * Мобильное меню — панель `Sheet`, а не dropdown.
 *
 * Панель уходит порталом на корень документа, поэтому проверяется через
 * `document`, а не через канву истории: это та же граница, из-за которой тема
 * зеркалится на корень.
 */
export const MenuOpen: Story = {
  args: { items: navigation, menuOpen: true, onMenuOpenChange: fn(), onNavigate: fn() },
  play: async () => {
    await waitFor(() => expect(document.querySelector('[data-testid="a3-mobile-menu"]')).toBeTruthy())
    const menu = document.querySelector('[data-testid="a3-mobile-menu"]') as HTMLElement
    await expect(within(menu).getAllByRole("link")).toHaveLength(navigation.length)
  },
  render,
}
