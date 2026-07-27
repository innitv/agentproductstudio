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
 * Composition story пилотного экрана.
 *
 * Справочники, тексты и функция валидации берутся из `card-request.data.ts` —
 * ровно те же, что использует роут приложения. Экран и его состояния живут в
 * одном коде: история и маршрут не расходятся по определению.
 *
 * Все истории идут на штатной теме реестра. Раньше полный набор состояний висел
 * на теме `branded` (она была предметом проверки), а на `default` оставались две
 * истории; темы эксперимента удалены 2026-07-28, и набор состояний переехал на
 * оставшуюся тему целиком — терять покрытие состояний вместе с темой было бы
 * подменой: состояния описывают ЭКРАН, а не оформление.
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

/** Пустая заявка: базовая точка отсчёта «как из коробки». */
export const EmptyDraft: Story = {
  args: { initialValues: emptyCardRequestValues },
}

/** Заполненный черновик — самое насыщенное состояние: поля, бейджи, суммы, переключатели. */
export const FilledDraft: Story = {
  args: { initialValues: draftCardRequestValues },
}

/** Перевыпуск раскрывает блок с номером старой карты. */
export const Reissue: Story = {
  args: { initialValues: reissueCardRequestValues },
}

/** Лимит выше порога добавляет предупреждение о втором круге согласования. */
export const NeedsSecondApproval: Story = {
  args: { initialValues: highLimitCardRequestValues },
}

/** Провал валидации: ошибки считает та же функция, что и роут. */
export const ValidationFailed: Story = {
  args: {
    errors: validateCardRequest(invalidCardRequestValues),
    initialValues: invalidCardRequestValues,
    notice: {
      subtitle: "Проверьте поля, отмеченные красным, и отправьте заявку ещё раз.",
      title: "Заявка не отправлена",
      tone: "error",
    },
    status: "error",
  },
}

/** Отправка в процессе: обе кнопки заблокированы, подпись основной изменена. */
export const Submitting: Story = {
  args: { initialValues: draftCardRequestValues, status: "submitting" },
}

/** Успех: уведомление sonner поверх панели действий. */
export const Submitted: Story = {
  args: {
    initialValues: draftCardRequestValues,
    notice: {
      subtitle: "Первым её смотрит Марина Ковалёва.",
      title: "Заявка CR-2418 ушла на согласование",
      tone: "success",
    },
    status: "success",
  },
}

/** Меню «ещё» в верхней панели: состояние портала, которое иначе не снять. */
export const ActionsMenuOpen: Story = {
  args: { initialValues: draftCardRequestValues, openActionsMenu: true },
}

/**
 * Интеракционный тест: переключение категории меняет производную сводку.
 * Скриншот показал бы только конечный кадр, поэтому связка «выбор -> пересчёт»
 * проверяется play-функцией, а не эталоном.
 */
export const CategoryToggleIsHandled: Story = {
  args: { initialValues: draftCardRequestValues },
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
