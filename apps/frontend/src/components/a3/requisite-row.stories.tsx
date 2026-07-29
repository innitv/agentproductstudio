import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "storybook/test"
import { toast } from "sonner"

import { Toaster } from "@/components/shadcn/sonner"

import { A3StoryShell } from "./a3-story-shell"
import { RequisiteRow } from "./requisite-row"
import { microcopy } from "@/views/a3-finance.data"

/**
 * Строка таблицы реквизитов.
 *
 * Четыре состояния, и два из них — про подтверждение копирования. Тост живёт
 * в портале на корне документа, поэтому длительность в историях бесконечная:
 * автоскрытие через 4 секунды превратило бы эталон в лотерею «успел кадр или
 * нет».
 */
const meta = {
  component: RequisiteRow,
  parameters: { layout: "centered" },
  title: "A3/RequisiteRow",
} satisfies Meta<typeof RequisiteRow>

export default meta

type Story = StoryObj<typeof meta>

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <A3StoryShell width={1200}>
      <dl className="border-border border-t">{children}</dl>
      <Toaster duration={Infinity} position="bottom-right" />
    </A3StoryShell>
  )
}

export const Default: Story = {
  args: { label: "ИНН", slug: "inn", value: "9704273233" },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button")
    // 16 одинаковых кнопок «Скопировать» различает только доступное имя.
    await expect(button).toHaveAccessibleName("Скопировать ИНН")
  },
  render: (args) => (
    <Shell>
      <RequisiteRow {...args} />
    </Shell>
  ),
}

/** Корсчёт из 20 знаков и подпись в два уровня — самая высокая строка таблицы. */
export const LongValue: Story = {
  args: {
    hint: "корреспондентский счёт открыт в",
    label: "Наименование банка",
    slug: "bank-name",
    value: "Банк России (уточняется) · корсчёт 30101810400000000000",
  },
  render: (args) => (
    <Shell>
      <RequisiteRow {...args} />
    </Shell>
  ),
}

export const Copied: Story = {
  args: { label: "ИНН", slug: "inn", value: "9704273233" },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"))
    await waitFor(() =>
      expect(document.querySelector("[data-sonner-toast]")).toHaveTextContent(
        microcopy.copied("ИНН"),
      ),
    )
  },
  render: (args) => (
    <Shell>
      <RequisiteRow {...args} onCopy={() => toast.success(microcopy.copied(args.label))} />
    </Shell>
  ),
}

/** Clipboard API отказывает без HTTPS и без пользовательского жеста. */
export const CopyFailed: Story = {
  args: { label: "ИНН", slug: "inn", value: "9704273233" },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"))
    await waitFor(() =>
      expect(document.querySelector("[data-sonner-toast]")).toHaveTextContent(
        microcopy.copyFailed,
      ),
    )
  },
  render: (args) => (
    <Shell>
      <RequisiteRow {...args} onCopy={() => toast.error(microcopy.copyFailed)} />
    </Shell>
  ),
}
