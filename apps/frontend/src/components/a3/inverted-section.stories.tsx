import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "storybook/test"
import { toast } from "sonner"

import { Button } from "@/components/shadcn/button"
import { Toaster } from "@/components/shadcn/sonner"

import { A3StoryShell } from "./a3-story-shell"
import { Eyebrow } from "./eyebrow"
import { InvertedSection } from "./inverted-section"

/**
 * Инверсная секция — участок страницы с другой поверхностью.
 *
 * Вторая история существует ради одной конкретной граблей, а не ради красоты:
 * порталы Radix и `sonner` рендерятся на КОРНЕ документа, вне поддерева
 * секции, и берут корневые светлые значения переменных. На странице А3
 * копирования внутри этой секции нет именно поэтому; история ловит регрессию,
 * если портал здесь однажды появится, и показывает, как он тогда выглядит.
 */
const meta = {
  component: InvertedSection,
  parameters: { layout: "fullscreen" },
  title: "A3/InvertedSection",
} satisfies Meta<typeof InvertedSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <A3StoryShell padded={false} width={900}>
      <InvertedSection className="p-10">
        <Eyebrow tone="inverse">КОНТАКТЫ И ОБРАЩЕНИЯ</Eyebrow>
        <h2 className="mt-3.5 text-[1.75rem]/[2.25rem] font-semibold">Контакты и обращения</h2>
        <p className="text-muted-foreground mt-6 max-w-[420px] text-[1.125rem]/[1.75rem]">
          Четыре плоскости страницы: белая, серая, этот градиент и ink-navy футера. Глубина здесь
          создаётся сменой фона, а не тенью.
        </p>
        <Button className="mt-8" size="xl" type="button">
          Кнопка на градиенте
        </Button>
      </InvertedSection>
    </A3StoryShell>
  ),
}

export const ToastInside: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"))
    await waitFor(() => expect(document.querySelector("[data-sonner-toast]")).toBeTruthy())
    // Тост оказался ВНЕ поддерева секции — это и есть проверяемый факт.
    const inverted = canvasElement.querySelector('[data-slot="a3-inverted"]') as HTMLElement
    await expect(inverted.contains(document.querySelector("[data-sonner-toast]"))).toBe(false)
  },
  render: () => (
    <A3StoryShell padded={false} width={900}>
      <InvertedSection className="p-10">
        <Eyebrow tone="inverse">ПОРТАЛ</Eyebrow>
        <p className="mt-3.5 max-w-[420px] text-[1rem]/[1.625rem]">
          Тост вызван изнутри синей секции, но приходит в светлом оформлении корня документа.
        </p>
        <Button
          className="mt-8"
          onClick={() => toast.success("Скопировано: ИНН")}
          size="xl"
          type="button"
        >
          Вызвать тост
        </Button>
      </InvertedSection>
      <Toaster duration={Infinity} position="bottom-right" />
    </A3StoryShell>
  ),
}
