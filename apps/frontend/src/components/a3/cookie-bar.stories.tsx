import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"

import { A3StoryShell } from "./a3-story-shell"
import { CookieBar } from "./cookie-bar"
import { cookieBar } from "@/views/a3-finance.data"

/**
 * Панель согласия на cookie.
 *
 * Состояния `Accepted` и `Declined` проверяются play-функциями, а не
 * скриншотом: обе выглядят одинаково — бара нет. Проверяемое здесь не картинка,
 * а то, ЧТО именно произошло по нажатию, и главное условие страницы —
 * аналитика не стартует до «Принять» — держится именно этим.
 */
const meta = {
  component: CookieBar,
  parameters: { layout: "fullscreen" },
  title: "A3/CookieBar",
} satisfies Meta<typeof CookieBar>

export default meta

type Story = StoryObj<typeof meta>

const base = {
  linkHref: cookieBar.link.href,
  linkText: cookieBar.link.text,
  text: cookieBar.text,
}

/** Обёртка с высотой: бар `fixed`, без полотна снимок был бы пустым. */
const render = (args: React.ComponentProps<typeof CookieBar>) => (
  <A3StoryShell className="relative min-h-[280px]" padded={false} width="100%">
    <CookieBar {...args} />
  </A3StoryShell>
)

export const Shown: Story = {
  args: { ...base, onAccept: fn(), onDecline: fn(), visible: true },
  render,
}

export const Accepted: Story = {
  args: { ...base, onAccept: fn(), onDecline: fn(), visible: true },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByTestId("a3-cookie-accept"))
    await waitFor(() => expect(args.onAccept).toHaveBeenCalledTimes(1))
    await expect(args.onDecline).not.toHaveBeenCalled()
  },
  render,
}

export const Declined: Story = {
  args: { ...base, onAccept: fn(), onDecline: fn(), visible: true },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByTestId("a3-cookie-decline"))
    await waitFor(() => expect(args.onDecline).toHaveBeenCalledTimes(1))
    await expect(args.onAccept).not.toHaveBeenCalled()
  },
  render,
}

/** Решение принято — бара нет и он не занимает места в потоке. */
export const Hidden: Story = {
  args: { ...base, onAccept: fn(), onDecline: fn(), visible: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByTestId("a3-cookie-bar")).toBeNull()
  },
  render,
}
