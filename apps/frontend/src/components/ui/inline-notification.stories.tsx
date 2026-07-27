import { ChevronRight, Heart } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { InlineNotification, type InlineNotificationColorScheme } from "./inline-notification";

/**
 * Матрица Figma (нода `579:4735`): colorScheme = info | warning | succes | error
 * (значение `succes` нормализовано во фронтенде в `success`);
 * boolean-слоты icon container / closeButton / title / subtitle /
 * actionButtons / button left / button right.
 */
const colorSchemes: InlineNotificationColorScheme[] = ["info", "success", "warning", "error"];

const actions = [
  {
    actionIcon: <ChevronRight aria-hidden="true" />,
    icon: <Heart aria-hidden="true" />,
    label: "Открыть",
    onClick: fn(),
    variant: "secondary" as const,
  },
  {
    actionIcon: <ChevronRight aria-hidden="true" />,
    icon: <Heart aria-hidden="true" />,
    label: "Скрыть",
    onClick: fn(),
    variant: "tertiary" as const,
  },
];

const meta = {
  component: InlineNotification,
  args: {
    onClose: fn(),
    subtitle: "Проверьте данные перед отправкой",
    title: "Требуется внимание",
  },
  argTypes: {
    colorScheme: { control: "inline-radio", options: colorSchemes },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
  title: "Feedback/InlineNotification",
} satisfies Meta<typeof InlineNotification>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Все четыре цветовые схемы: у error роль `alert`, у остальных — `status`. */
export const ColorSchemes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 12 }}>
      {colorSchemes.map((colorScheme) => (
        <InlineNotification
          {...args}
          colorScheme={colorScheme}
          key={colorScheme}
          title={`Схема ${colorScheme}`}
        />
      ))}
    </div>
  ),
};

export const WithActions: Story = {
  args: { actions },
};

/** subtitle = false. */
export const TitleOnly: Story = {
  args: { subtitle: undefined },
};

/** closeButton = false. */
export const WithoutCloseButton: Story = {
  args: { closeButton: false },
};

export const CustomIcon: Story = {
  args: { icon: <Heart aria-hidden="true" /> },
};

/** Длинный текст: перенос строк и устойчивость блока действий. */
export const LongContent: Story = {
  args: {
    actions,
    subtitle:
      "Развёрнутое описание проблемы, которое занимает несколько строк и проверяет, что иконка, текст и блок действий сохраняют выравнивание.",
    title: "Заголовок уведомления, который переносится на вторую строку",
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

/** Интеракционный тест: действие кликабельно и вызывает свой обработчик. */
export const ActionIsHandled: Story = {
  args: { actions },
  play: async ({ canvasElement }) => {
    const action = within(canvasElement).getByRole("button", { name: /Открыть/ });
    await userEvent.click(action);
    await expect(actions[0].onClick).toHaveBeenCalled();
  },
};
