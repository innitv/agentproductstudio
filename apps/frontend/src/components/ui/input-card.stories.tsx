import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { InputCard } from "./input-card";

/**
 * Матрица Figma (нода `638:1979`): size = l | m | s;
 * state = default | hover | focus | filled | error | disabled default | disabled filled;
 * placeholder = false | true. В размере `l` лейбл живёт внутри контрола.
 */
const meta = {
  component: InputCard,
  args: {
    label: "Номер карты",
    placeholder: "0000 0000 0000 0000",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["s", "m", "l"] },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 340 }}>
        <Story />
      </div>
    ),
  ],
  title: "Forms/InputCard",
} satisfies Meta<typeof InputCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: { defaultValue: "2200 0000 0000 0000" },
};

/** В size = l лейбл рендерится внутри контрола (`--label--inside`). */
export const Sizes: Story = {
  args: { defaultValue: "2200 0000 0000 0000" },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      <InputCard {...args} label="Size L (лейбл внутри)" size="l" />
      <InputCard {...args} label="Size M" size="m" />
      <InputCard {...args} label="Size S" size="s" />
    </div>
  ),
};

export const WithHintAndCounter: Story = {
  args: {
    counter: "16/16",
    defaultValue: "2200 0000 0000 0000",
    hint: "Списание пройдёт после подтверждения",
  },
};

export const ErrorState: Story = {
  args: {
    defaultValue: "2200 0000 0000 000",
    hint: "Проверьте номер карты",
    invalid: true,
  },
};

export const DisabledFilled: Story = {
  args: { defaultValue: "2200 0000 0000 0000", disabled: true },
};

export const DisabledEmpty: Story = {
  args: { disabled: true },
};

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByLabelText("Номер карты");
    await userEvent.click(field);
    await expect(field).toHaveFocus();
  },
};

/** Кнопка очистки появляется только при переданном `onClear` и имеет aria-label. */
export const ClearAction: Story = {
  args: { defaultValue: "2200 0000 0000 0000", onClear: fn() },
  play: async ({ args, canvasElement }) => {
    const clear = within(canvasElement).getByRole("button", { name: "Clear card number" });
    await userEvent.click(clear);
    await expect(args.onClear).toHaveBeenCalledTimes(1);
  },
};
