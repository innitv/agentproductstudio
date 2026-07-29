import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { A3StoryShell } from "./a3-story-shell"
import { DocumentItem } from "./document-item"
import { microcopy } from "@/views/a3-finance.data"

/**
 * Строка документа раскрытия информации.
 *
 * Состояние `FileMissing` — не гипотетическое: шести PDF пока не существует,
 * и на первом релизе ВСЕ шесть строк выглядят именно так. Строка без файла не
 * рендерит ссылку вовсе — это проверяет play-функция, потому что «ссылка,
 * ведущая в 404» на странице раскрытия информации хуже отсутствия ссылки.
 */
const meta = {
  component: DocumentItem,
  parameters: { layout: "centered" },
  title: "A3/DocumentItem",
} satisfies Meta<typeof DocumentItem>

export default meta

type Story = StoryObj<typeof meta>

const base = {
  fileMissingLabel: microcopy.fileMissing,
  meta: "PDF · 480 КБ · 17.06.2026",
  slug: "charter",
  title: "Устав ООО РНКО «А3 Финанс»",
}

export const Default: Story = {
  args: { ...base, href: "/documents/charter.pdf" },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link")
    // Шесть одинаковых «Скачать» подряд неразличимы в скринридере: имя ссылки
    // обязано нести название документа.
    await expect(link).toHaveAccessibleName(`Скачать: ${base.title}, PDF`)
  },
  render: (args) => (
    <A3StoryShell width={1200}>
      <div className="border-border border-t">
        <DocumentItem {...args} />
      </div>
    </A3StoryShell>
  ),
}

export const FileMissing: Story = {
  args: { ...base, href: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByRole("link")).toBeNull()
    await expect(canvas.getByText(microcopy.fileMissing)).toBeVisible()
  },
  render: (args) => (
    <A3StoryShell width={1200}>
      <div className="border-border border-t">
        <DocumentItem {...args} />
      </div>
    </A3StoryShell>
  ),
}
