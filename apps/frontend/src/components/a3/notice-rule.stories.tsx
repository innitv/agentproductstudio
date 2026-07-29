import type { Meta, StoryObj } from "@storybook/react-vite"

import { A3StoryShell } from "./a3-story-shell"
import { NoticeRule } from "./notice-rule"
import { hero, supervision } from "@/views/a3-finance.data"

/**
 * Правовая констатация левым бордюром.
 *
 * Два эталона — по числу мест на странице: callout лицензии в hero (бордюр
 * 2 px, метка + значение mono) и дисклеймер о страховании вкладов в секции
 * надзора (бордюр 3 px, без метки).
 */
const meta = {
  component: NoticeRule,
  parameters: { layout: "centered" },
  title: "A3/NoticeRule",
} satisfies Meta<typeof NoticeRule>

export default meta

type Story = StoryObj<typeof meta>

export const Hero: Story = {
  render: () => (
    <A3StoryShell width={720}>
      <NoticeRule label={hero.callout.label}>
        <span className="font-mono text-[0.9375rem]/[1.5rem]">{hero.callout.value}</span>
      </NoticeRule>
    </A3StoryShell>
  ),
}

export const Supervision: Story = {
  render: () => (
    <A3StoryShell width={820}>
      <NoticeRule weight="thick">{supervision.callout}</NoticeRule>
    </A3StoryShell>
  ),
}
