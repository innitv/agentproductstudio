import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { CardRequestShadcnView } from "./CardRequestShadcnView"
import {
  cardRequestCatalog,
  draftCardRequestValues,
  emptyCardRequestValues,
  highLimitCardRequestValues,
  invalidCardRequestValues,
  reissueCardRequestValues,
  validateCardRequest,
} from "./card-request.data"

/**
 * Composition story shadcn-версии пилотного экрана.
 *
 * Пара к `CardRequestView.stories.tsx`: те же справочники, те же тексты, та же
 * функция валидации. Отличается только основание интерфейса и тема, поэтому
 * скриншоты двух наборов сравнимы напрямую.
 *
 * Раскладка историй по темам:
 *   • `default`  — два состояния, чтобы было видно штатный shadcn «из коробки»;
 *   • `branded`  — полный набор состояний, потому что именно брендовая тема
 *                  является предметом проверки.
 *
 * Тег `vr-page` включает съёмку в высоком вьюпорте: экран выше 800px, кадром
 * вьюпорта попал бы только первый экран.
 */
const meta = {
  component: CardRequestShadcnView,
  args: {
    catalog: cardRequestCatalog,
    onNavigate: fn(),
    onSaveDraft: fn(),
    onSubmit: fn(),
  },
  parameters: {
    layout: "fullscreen",
  },
  tags: ["vr-page"],
  title: "Pages/CardRequestShadcn",
} satisfies Meta<typeof CardRequestShadcnView>

export default meta

type Story = StoryObj<typeof meta>

/** Штатный shadcn, пустая заявка: базовая точка отсчёта «как из коробки». */
export const DefaultThemeEmptyDraft: Story = {
  args: { initialValues: emptyCardRequestValues, theme: "default" },
}

/** Штатный shadcn, заполненный черновик — прямая пара к брендовой версии ниже. */
export const DefaultThemeFilledDraft: Story = {
  args: { initialValues: draftCardRequestValues, theme: "default" },
}

/** Брендовая тема, то же самое содержание: вся разница — в токенах. */
export const BrandedFilledDraft: Story = {
  args: { initialValues: draftCardRequestValues, theme: "branded" },
}

/**
 * ─── ЧЕТЫРЁХТОЧЕЧНОЕ СРАВНЕНИЕ ──────────────────────────────────────────────
 *
 * Четыре истории ниже и выше держат ОДНО состояние (`draftCardRequestValues`)
 * в четырёх темах. Смысл — разделить факторы, которые в `branded` смешаны:
 *
 *   DefaultThemeFilledDraft  штатный shadcn: штатная геометрия, штатный цвет
 *   BrandedFilledDraft       брендовый цвет + сжатая геометрия + снятые тени
 *   CalmFilledDraft          брендовый цвет + ШТАТНАЯ геометрия
 *   CalmTypedFilledDraft     то же + реально подгруженные гарнитуры
 *
 * Разница снимков `Branded` ↔ `Calm` — это вклад геометрии, разница
 * `Calm` ↔ `CalmTyped` — вклад гарнитуры. Состояние выбрано самое насыщенное:
 * заполненный черновик показывает поля, бейджи, суммы, переключатели и
 * карточки одновременно, то есть все места, где геометрия и типографика видны.
 */

/** Цвет `branded` при штатной геометрии shadcn: замер вклада геометрии. */
export const CalmFilledDraft: Story = {
  args: { initialValues: draftCardRequestValues, theme: "calm" },
}

/** Та же тема с реально подгруженными шрифтами: замер вклада гарнитуры. */
export const CalmTypedFilledDraft: Story = {
  args: { initialValues: draftCardRequestValues, theme: "calm-typed" },
}

/** Перевыпуск раскрывает блок с номером старой карты. */
export const BrandedReissue: Story = {
  args: { initialValues: reissueCardRequestValues, theme: "branded" },
}

/** Лимит выше порога добавляет предупреждение о втором круге согласования. */
export const BrandedNeedsSecondApproval: Story = {
  args: { initialValues: highLimitCardRequestValues, theme: "branded" },
}

/** Провал валидации: ошибки считает та же функция, что и роут. */
export const BrandedValidationFailed: Story = {
  args: {
    errors: validateCardRequest(invalidCardRequestValues),
    initialValues: invalidCardRequestValues,
    notice: {
      subtitle: "Проверьте поля, отмеченные красным, и отправьте заявку ещё раз.",
      title: "Заявка не отправлена",
      tone: "error",
    },
    status: "error",
    theme: "branded",
  },
}

/** Отправка в процессе: обе кнопки заблокированы, подпись основной изменена. */
export const BrandedSubmitting: Story = {
  args: { initialValues: draftCardRequestValues, status: "submitting", theme: "branded" },
}

/** Успех: уведомление sonner поверх панели действий. */
export const BrandedSubmitted: Story = {
  args: {
    initialValues: draftCardRequestValues,
    notice: {
      subtitle: "Первым её смотрит Марина Ковалёва.",
      title: "Заявка CR-2418 ушла на согласование",
      tone: "success",
    },
    status: "success",
    theme: "branded",
  },
}

/** Меню «ещё» в верхней панели: состояние портала, которое иначе не снять. */
export const BrandedActionsMenuOpen: Story = {
  args: { initialValues: draftCardRequestValues, openActionsMenu: true, theme: "branded" },
}

/**
 * Интеракционный тест: переключение категории меняет производную сводку.
 * Проверяет ту же связку, что и одноимённая история A3-версии, — так видно,
 * что замена основания не изменила поведение формы.
 */
export const BrandedCategoryToggleIsHandled: Story = {
  args: { initialValues: draftCardRequestValues, theme: "branded" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const summary = canvas.getByTestId("card-request-shadcn-categories-summary")
    const item = canvas.getByTestId("card-request-shadcn-category-ads")

    await expect(summary).toHaveTextContent("Выбрано категорий: 3 из 6")
    await expect(item).toHaveAttribute("data-state", "off")

    await userEvent.click(item)

    await expect(item).toHaveAttribute("data-state", "on")
    await expect(summary).toHaveTextContent("Выбрано категорий: 4 из 6")
  },
}
