import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Button } from "@/components/shadcn/button"

import { A3StoryShell } from "./a3-story-shell"

/**
 * Лестница кнопок страницы: 48 / 40 / 32.
 *
 * `size="xl"` (48) добавлен проектом в `button.tsx` — штатная лестница
 * 32/36/40 кнопку образца не покрывает. История существует, чтобы новый размер
 * не жил только внутри одного экрана: эталон ловит его пропажу при следующем
 * `shadcn add button`.
 */
const meta = {
  component: Button,
  parameters: { layout: "centered" },
  title: "A3/Button",
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Sizes: Story = {
  play: async ({ canvasElement }) => {
    const xl = within(canvasElement).getByTestId("a3-button-xl")
    // 48 px — не «примерно 48»: высота проверяется числом.
    await expect(Math.round(xl.getBoundingClientRect().height)).toBe(48)
  },
  render: () => (
    <A3StoryShell width={640}>
      <div className="flex flex-wrap items-center gap-4">
        <Button data-testid="a3-button-xl" size="xl">
          Задать вопрос
        </Button>
        <Button size="lg" variant="outline">
          Скопировать все реквизиты
        </Button>
        <Button size="sm" variant="outline">
          Скопировать
        </Button>
        <Button size="sm">Принять</Button>
        <Button size="xl" disabled>
          Отправляем…
        </Button>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button size="sm" variant="link">
          Скачать
        </Button>
        <Button size="lg" variant="outline" disabled>
          Скачать карточку компании (PDF)
        </Button>
      </div>
    </A3StoryShell>
  ),
}
