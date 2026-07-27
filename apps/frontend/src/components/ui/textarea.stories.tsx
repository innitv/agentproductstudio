import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Textarea } from "./textarea";

/**
 * Матрица Figma (нода `635:2327`): size = l | m | s;
 * state = default | hover | focus | error | disabled;
 * value = none | placeholder | filled; boolean-слоты label / hint / scroll.
 */
const meta = {
  component: Textarea,
  args: {
    label: "Комментарий",
    placeholder: "Опишите задачу",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["s", "m", "l"] },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  title: "Forms/Textarea",
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    defaultValue: "Текстовое поле для проверки многострочного ввода.",
  },
};

export const Sizes: Story = {
  args: { defaultValue: "Текст в поле" },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      <Textarea {...args} label="Size L" size="l" />
      <Textarea {...args} label="Size M" size="m" />
      <Textarea {...args} label="Size S" size="s" />
    </div>
  ),
};

export const WithHintAndCounter: Story = {
  args: {
    counter: "64/200",
    defaultValue: "Текстовое поле для проверки многострочного ввода.",
    hint: "Не больше 200 символов",
  },
};

export const ErrorState: Story = {
  args: {
    counter: "220/200",
    defaultValue:
      "Очень длинный текст, который превышает допустимый лимит и должен показать состояние ошибки вместе с подсказкой под полем.",
    hint: "Превышен лимит символов",
    invalid: true,
  },
};

export const Disabled: Story = {
  args: { defaultValue: "Редактирование недоступно", disabled: true },
};

/** scroll = false: поле не скроллится, длинный текст проверяет поведение обрезки. */
export const WithoutScroll: Story = {
  args: {
    defaultValue: Array.from({ length: 8 }, (_, index) => `Строка ${index + 1}`).join("\n"),
    scroll: false,
  },
};

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByLabelText("Комментарий");
    await userEvent.click(field);
    await expect(field).toHaveFocus();
  },
};
