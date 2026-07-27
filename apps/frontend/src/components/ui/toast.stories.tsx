import { ChevronRight, Heart } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Toast, type ToastColorScheme } from "./toast";

/**
 * Матрица Figma (нода `725:248`): colorScheme = info | success | warning | error;
 * boolean-слоты closeButton / header / subtitle / actionButtons / button 1 /
 * button 2 / icon.
 */
const colorSchemes: ToastColorScheme[] = ["info", "success", "warning", "error"];

const actions = [
  { icon: <Heart aria-hidden="true" />, label: "Подтвердить", onClick: fn(), variant: "secondary" as const },
  { icon: <ChevronRight aria-hidden="true" />, label: "Позже", onClick: fn(), variant: "tertiary" as const },
];

const meta = {
  component: Toast,
  args: {
    onClose: fn(),
    subtitle: "Изменения сохранены и применены",
    title: "Готово",
  },
  argTypes: {
    colorScheme: { control: "inline-radio", options: colorSchemes },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
  title: "Feedback/Toast",
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Все четыре цветовые схемы: роль error — `alert`, остальные — `status`. */
export const ColorSchemes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 12 }}>
      {colorSchemes.map((colorScheme) => (
        <Toast {...args} colorScheme={colorScheme} key={colorScheme} title={`Схема ${colorScheme}`} />
      ))}
    </div>
  ),
};

export const WithActions: Story = {
  args: { actions },
};

/** actionButtons = false, subtitle = false: минимальный вид. */
export const TitleOnly: Story = {
  args: { subtitle: undefined },
};

/** closeButton = false. */
export const WithoutCloseButton: Story = {
  args: { closeButton: false },
};

/** icon = false: иконка заменяется собственным слотом. */
export const CustomIcon: Story = {
  args: { icon: <Heart aria-hidden="true" /> },
};

/** Длинный текст: проверка переноса и того, что кнопка закрытия не наезжает на текст. */
export const LongContent: Story = {
  args: {
    actions,
    subtitle:
      "Очень длинный текст уведомления, который проверяет перенос строк, выравнивание кнопки закрытия и поведение блока действий при увеличении высоты.",
    title: "Уведомление с длинным заголовком, который тоже переносится",
  },
};

/** Интеракционный тест: кнопка закрытия вызывает onClose. */
export const CloseIsHandled: Story = {
  play: async ({ args, canvasElement }) => {
    const close = within(canvasElement).getByRole("button", { name: "Close notification" });
    await userEvent.click(close);
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

/** Интеракционный тест: действия кликабельны и вызывают свои обработчики. */
export const ActionIsHandled: Story = {
  args: { actions },
  play: async ({ canvasElement }) => {
    const action = within(canvasElement).getByRole("button", { name: /Подтвердить/ });
    await userEvent.click(action);
    await expect(actions[0].onClick).toHaveBeenCalled();
  },
};
