import type { Meta, StoryObj } from "@storybook/react-vite"

import { A3StoryShell } from "./a3-story-shell"
import { SectionHeading } from "./section-heading"

/**
 * Заголовочная тройка `eyebrow → H2 → лид`.
 *
 * Главный повторяемый узел страницы: он открывает пять секций из восьми.
 * Вариант без лида существует потому, что в двух местах лида нет, и без
 * отдельного эталона отступ под несуществующим абзацем никто не заметит.
 */
const meta = {
  component: SectionHeading,
  parameters: { layout: "centered" },
  title: "A3/SectionHeading",
} satisfies Meta<typeof SectionHeading>

export default meta

type Story = StoryObj<typeof meta>

export const WithLead: Story = {
  args: {
    eyebrow: "РЕКВИЗИТЫ",
    id: "story-heading-with-lead",
    lead:
      "Реквизиты ООО РНКО «А3 Финанс» для договоров и платежей. Значение каждого поля можно " +
      "скопировать по кнопке или скачать карточку компании целиком.",
    title: "Реквизиты",
  },
  render: (args) => (
    <A3StoryShell width={820}>
      <SectionHeading {...args} />
    </A3StoryShell>
  ),
}

export const WithoutLead: Story = {
  args: {
    eyebrow: "ДЕЯТЕЛЬНОСТЬ",
    id: "story-heading-without-lead",
    title: "Деятельность",
  },
  render: (args) => (
    <A3StoryShell width={820}>
      <SectionHeading {...args} />
    </A3StoryShell>
  ),
}
