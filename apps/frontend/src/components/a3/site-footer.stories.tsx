import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, within } from "storybook/test"

import { A3StoryShell } from "./a3-story-shell"
import { SiteFooter } from "./site-footer"
import { footer } from "@/views/a3-finance.data"

/**
 * Футер и решение по ссылке «Тарифы».
 *
 * Раздела «Тарифы» на странице нет ни на одной точке образца, а ссылка в
 * футере есть. Два варианта ответа заказчика — один компонент и одно поле
 * данных; истории существуют, чтобы вариант B не оказался мёртвым кодом,
 * который никто не открывал.
 */
const meta = {
  component: SiteFooter,
  parameters: { layout: "fullscreen" },
  title: "A3/SiteFooter",
} satisfies Meta<typeof SiteFooter>

export default meta

type Story = StoryObj<typeof meta>

const base = {
  columns: footer.columns,
  copyright: footer.copyright,
  licence: footer.licence,
  name: footer.name,
  regulated: footer.regulated,
}

const render = (args: React.ComponentProps<typeof SiteFooter>) => (
  <A3StoryShell padded={false} width="100%">
    <SiteFooter {...args} />
  </A3StoryShell>
)

/** Вариант A — дефолт первого релиза: пункта нет вовсе. */
export const TariffsHidden: Story = {
  args: { ...base, onNavigate: fn(), tariffs: "hidden" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByTestId("a3-footer-tariffs")).toBeNull()
  },
  render,
}

/** Вариант B — пункт остаётся текстом, но не ссылкой и не в порядке табуляции. */
export const TariffsDisabled: Story = {
  args: { ...base, onNavigate: fn(), tariffs: "disabled" },
  play: async ({ canvasElement }) => {
    const item = within(canvasElement).getByTestId("a3-footer-tariffs")
    await expect(item).toHaveAttribute("aria-disabled", "true")
    // Ни одна ссылка футера не ведёт в никуда — это и проверяется.
    await expect(item.tagName.toLowerCase()).not.toBe("a")
  },
  render,
}
