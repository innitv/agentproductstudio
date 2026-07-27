import { Search, X } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Input } from "./input";

/**
 * Матрица Figma (нода `492:2765`): size = l | m | s;
 * state = default | hover | focus | filled | error | disabled;
 * value = none | placeholder | filled; boolean-слоты label / hint / iconLeft / iconRight.
 */
const meta = {
  component: Input,
  args: {
    label: "Label",
    placeholder: "Placeholder",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["s", "m", "l"] },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  title: "Forms/Input",
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

/** value = placeholder. */
export const Default: Story = {};

/** value = filled. */
export const Filled: Story = {
  args: { defaultValue: "Значение" },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      <Input {...args} label="Size L" size="l" />
      <Input {...args} label="Size M" size="m" />
      <Input {...args} label="Size S" size="s" />
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    defaultValue: "Поиск по каталогу",
    leftIcon: <Search aria-hidden="true" />,
    rightIcon: <X aria-hidden="true" />,
  },
};

export const WithHintAndCounter: Story = {
  args: {
    counter: "12/24",
    defaultValue: "Двенадцать",
    hint: "Подсказка под полем",
  },
};

/** state = error: `invalid` ставит `aria-invalid` и `data-invalid`, цвет — не единственный индикатор. */
export const ErrorState: Story = {
  args: {
    counter: "26/24",
    defaultValue: "Слишком длинное значение поля",
    hint: "Превышена длина",
    invalid: true,
  },
};

export const Disabled: Story = {
  args: { defaultValue: "Недоступно", disabled: true },
};

/** state = focus. */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByLabelText("Label");
    await userEvent.click(field);
    await expect(field).toHaveFocus();
  },
};

export const TypingUpdatesValue: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByLabelText<HTMLInputElement>("Label");
    await userEvent.type(field, "Новый текст");
    await expect(field).toHaveValue("Новый текст");
  },
};
