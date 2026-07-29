import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"

import { A3StoryShell } from "./a3-story-shell"
import { ContactForm } from "./contact-form"
import { InvertedSection } from "./inverted-section"
import {
  emptyContactValues,
  microcopy,
  validateContactForm,
  type ContactFormValues,
} from "@/views/a3-finance.data"

/**
 * Единственная форма страницы, семь состояний.
 *
 * Ошибки считает `validateContactForm` — та же функция, что и в роуте. Если бы
 * история подставляла тексты ошибок руками, она показывала бы не то, что
 * увидит пользователь, и разъехалась бы с приложением на первой же правке
 * правил валидации.
 *
 * Панель всегда снимается ВНУТРИ инверсной секции: белое на синем — это и есть
 * проверяемая композиция, на нейтральном фоне контраст четырёх плоскостей не
 * читается.
 */
const meta = {
  component: ContactForm,
  parameters: { layout: "fullscreen" },
  title: "A3/ContactForm",
} satisfies Meta<typeof ContactForm>

export default meta

type Story = StoryObj<typeof meta>

const filled: ContactFormValues = {
  consents: { newsletter: false, privacy: true, processing: true },
  email: "buhgalteria@example.com",
  message: "Просим подтвердить реквизиты для оплаты по договору № 114 от 3 июля 2026 года.",
  name: "Мария Логинова",
}

const invalid: ContactFormValues = {
  consents: { newsletter: false, privacy: false, processing: false },
  email: "мария@",
  message: "Вопрос",
  name: "",
}

const render = (args: React.ComponentProps<typeof ContactForm>) => (
  <A3StoryShell padded={false} width={1000}>
    <InvertedSection className="p-10">
      <ContactForm {...args} />
    </InvertedSection>
  </A3StoryShell>
)

export const Default: Story = {
  args: { onSubmit: fn(), values: emptyContactValues },
  render,
}

export const Filled: Story = {
  args: { onSubmit: fn(), values: filled },
  render,
}

/** Провал валидации: ошибки посчитаны той же функцией, что и в приложении. */
export const Validation: Story = {
  args: { errors: validateContactForm(invalid), onSubmit: fn(), values: invalid },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(microcopy.nameRequired)).toBeVisible()
    await expect(canvas.getByText(microcopy.emailFormat)).toBeVisible()
    await expect(canvas.getByText(microcopy.messageShort)).toBeVisible()
    // Ошибка связана с полем, а не просто нарисована рядом.
    await expect(canvas.getByTestId("a3-form-name")).toHaveAttribute("aria-invalid", "true")
  },
  render,
}

/** Не отмечены обязательные согласия — ошибка на группе, а не на чекбоксе. */
export const ConsentsError: Story = {
  args: {
    errors: { consents: microcopy.consentsError },
    onSubmit: fn(),
    values: { ...filled, consents: { newsletter: false, privacy: false, processing: false } },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("a3-consents-error")).toHaveTextContent(
      microcopy.consentsError,
    )
  },
  render,
}

export const Submitting: Story = {
  args: { onSubmit: fn(), status: "submitting", values: filled },
  play: async ({ canvasElement }) => {
    const submit = within(canvasElement).getByTestId("a3-form-submit")
    await expect(submit).toBeDisabled()
    // Поля блокируются целиком: правка во время отправки уехала бы в никуда.
    await expect(within(canvasElement).getByTestId("a3-form-name")).toBeDisabled()
  },
  render,
}

export const Success: Story = {
  args: { status: "success", values: filled },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("a3-form-success")).toBeVisible()
  },
  render,
}

/** Отправка не удалась: значения сохранены, кнопка предлагает повтор. */
export const SubmitError: Story = {
  args: { onSubmit: fn(), status: "error", values: filled },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByTestId("a3-form-submit-error")).toBeVisible()
    await expect(canvas.getByTestId("a3-form-name")).toHaveValue(filled.name)
    await expect(canvas.getByTestId("a3-form-submit")).toHaveTextContent(microcopy.submitRetry)
  },
  render,
}

/** Клавиатурный фокус виден на всех контролах панели. */
export const KeyboardFocus: Story = {
  args: { onSubmit: fn(), values: emptyContactValues },
  play: async ({ canvasElement }) => {
    const name = within(canvasElement).getByTestId("a3-form-name")
    await userEvent.tab()
    await waitFor(() => expect(document.activeElement).toBe(name))
  },
  render,
}
