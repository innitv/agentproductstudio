import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { CardRequestView } from "./CardRequestView";
import {
  cardRequestCatalog,
  draftCardRequestValues,
  emptyCardRequestValues,
  highLimitCardRequestValues,
  invalidCardRequestValues,
  reissueCardRequestValues,
  validateCardRequest,
} from "./card-request.data";

/**
 * Composition story пилотного экрана: не витрина компонентов, а целая страница
 * приложения в её ключевых состояниях.
 *
 * Тот же компонент рендерит роут `#card-request` (`CardRequestRoute.tsx`).
 * Разница только в источнике данных: здесь справочник и статус подаются
 * пропсами и потому детерминированы, там — считаются обработчиками.
 *
 * Тег `vr-page` читает спека визуальной регрессии: истории с ним снимаются в
 * высоком вьюпорте и целиком, а не кадром 1280×800. Компонентные истории тега
 * не имеют, их эталоны этим не затронуты.
 */
const meta = {
  component: CardRequestView,
  args: {
    catalog: cardRequestCatalog,
    onDismissNotice: fn(),
    onNavigate: fn(),
    onSaveDraft: fn(),
    onSubmit: fn(),
  },
  parameters: {
    layout: "fullscreen",
  },
  tags: ["vr-page"],
  title: "Pages/CardRequest",
} satisfies Meta<typeof CardRequestView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Заявка, начатая с нуля: ровно то, что видит человек по ссылке из письма. */
export const EmptyDraft: Story = {
  args: { initialValues: emptyCardRequestValues },
};

/** Основное рабочее состояние: черновик заполнен и готов к отправке. */
export const FilledDraft: Story = {
  args: { initialValues: draftCardRequestValues },
};

/** Перевыпуск раскрывает блок с номером старой карты — ветка формы. */
export const Reissue: Story = {
  args: { initialValues: reissueCardRequestValues },
};

/** Лимит выше порога добавляет предупреждение о втором круге согласования. */
export const NeedsSecondApproval: Story = {
  args: { initialValues: highLimitCardRequestValues },
};

/**
 * Провал валидации. Ошибки считает та же функция, что и роут, поэтому история
 * не может показать набор ошибок, которого в приложении не бывает.
 */
export const ValidationFailed: Story = {
  args: {
    errors: validateCardRequest(invalidCardRequestValues),
    initialValues: invalidCardRequestValues,
    notice: {
      colorScheme: "error",
      subtitle: "Проверьте поля, отмеченные красным, и отправьте заявку ещё раз.",
      title: "Заявка не отправлена",
    },
    status: "error",
  },
};

/** Отправка в процессе: обе кнопки заблокированы, подпись основной изменена. */
export const Submitting: Story = {
  args: { initialValues: draftCardRequestValues, status: "submitting" },
};

/** Успех: тост поверх панели действий, панель на месте. */
export const Submitted: Story = {
  args: {
    initialValues: draftCardRequestValues,
    notice: {
      colorScheme: "success",
      subtitle: "Первым её смотрит Марина Ковалёва.",
      title: "Заявка CR-2418 ушла на согласование",
    },
    status: "success",
  },
};

/** Меню «ещё» в верхней панели: состояние оверлея, которое иначе не снять. */
export const ActionsMenuOpen: Story = {
  args: { initialValues: draftCardRequestValues, openActionsMenu: true },
};

/**
 * Интеракционный тест: чип категории переключается и меняет сводку под рядом.
 * Проверяет связку «состояние формы -> производный текст», а не сам компонент.
 */
export const CategoryToggleIsHandled: Story = {
  args: { initialValues: draftCardRequestValues },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summary = canvas.getByTestId("card-request-categories-summary");
    const chip = canvas.getByTestId("card-request-category-ads");

    await expect(summary).toHaveTextContent("Выбрано категорий: 3 из 6");
    await expect(chip).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(chip);

    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(summary).toHaveTextContent("Выбрано категорий: 4 из 6");
  },
};
