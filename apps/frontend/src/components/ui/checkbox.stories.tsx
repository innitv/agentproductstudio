import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Checkbox } from "./checkbox";

/**
 * Матрица Figma (нода `221:3095`): size = s | xs;
 * state = default | hover | disabled; checked = false | true;
 * indeterminate = false | true. Пар состояния hover/pressed в коде — CSS `:hover`.
 */
const meta = {
  component: Checkbox,
  args: {
    label: "Согласен с условиями",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["s", "xs"] },
  },
  title: "Forms/Checkbox",
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

/** aria-checked = "mixed": состояние читается скринридером, не только цветом. */
export const Indeterminate: Story = {
  args: { indeterminate: true, label: "Выбрано частично" },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 20 }}>
      <Checkbox {...args} defaultChecked label="Size s" size="s" />
      <Checkbox {...args} defaultChecked label="Size xs" size="xs" />
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 20 }}>
      <Checkbox {...args} disabled label="Disabled" />
      <Checkbox {...args} defaultChecked disabled label="Disabled checked" />
      <Checkbox {...args} disabled indeterminate label="Disabled mixed" />
    </div>
  ),
};

export const WithoutLabel: Story = {
  args: { "aria-label": "Выбрать строку", label: undefined },
};

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("checkbox");
    await userEvent.tab();
    await expect(input).toHaveFocus();
  },
};

export const ClickTogglesState: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole<HTMLInputElement>("checkbox");
    await expect(input).not.toBeChecked();
    await userEvent.click(input);
    await expect(input).toBeChecked();
  },
};
