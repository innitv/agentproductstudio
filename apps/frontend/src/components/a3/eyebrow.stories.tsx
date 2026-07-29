import type { Meta, StoryObj } from "@storybook/react-vite"

import { A3StoryShell } from "./a3-story-shell"
import { Eyebrow } from "./eyebrow"

/**
 * Метка над заголовком секции: mono, caps, разрядка +6%.
 *
 * Три тона — по числу поверхностей страницы: белая, синий градиент, ink-navy
 * футера. Все три в одной истории намеренно: расхождение тонов ловится только
 * рядом, а не по трём отдельным эталонам.
 */
const meta = {
  component: Eyebrow,
  parameters: { layout: "centered" },
  title: "A3/Eyebrow",
} satisfies Meta<typeof Eyebrow>

export default meta

type Story = StoryObj<typeof meta>

export const AllTones: Story = {
  render: () => (
    <A3StoryShell width={520}>
      <div className="flex flex-col gap-4">
        <div className="bg-background p-4">
          <Eyebrow tone="brand">РАСКРЫТИЕ ИНФОРМАЦИИ</Eyebrow>
        </div>
        <div className="a3-inverted p-4">
          <Eyebrow tone="inverse">КОНТАКТЫ И ОБРАЩЕНИЯ</Eyebrow>
        </div>
        <div className="a3-footer p-4">
          <Eyebrow tone="footer">РАЗДЕЛЫ</Eyebrow>
        </div>
      </div>
    </A3StoryShell>
  ),
}
