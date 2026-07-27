import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Radio } from "./radio";

/**
 * Матрица Figma (нода `588:239`): size = s | xs; variant = primary;
 * state = default | hover | disabled; checked = no | yes.
 */
const meta = {
  component: Radio,
  args: {
    label: "Вариант A",
    name: "radio-story",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["s", "xs"] },
  },
  title: "Forms/Radio",
} satisfies Meta<typeof Radio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Group: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 12 }}>
      <Radio {...args} defaultChecked label="Ежемесячно" name="radio-group-story" value="monthly" />
      <Radio {...args} label="Ежеквартально" name="radio-group-story" value="quarterly" />
      <Radio {...args} label="Ежегодно" name="radio-group-story" value="yearly" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 20 }}>
      <Radio {...args} defaultChecked label="Size s" name="radio-size-s" size="s" />
      <Radio {...args} defaultChecked label="Size xs" name="radio-size-xs" size="xs" />
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 20 }}>
      <Radio {...args} disabled label="Disabled" name="radio-disabled" />
      <Radio {...args} defaultChecked disabled label="Disabled checked" name="radio-disabled-checked" />
    </div>
  ),
};

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("radio");
    await userEvent.tab();
    await expect(input).toHaveFocus();
  },
};

export const SelectionMovesWithinGroup: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 12 }}>
      <Radio {...args} defaultChecked label="Первый" name="radio-play" value="first" />
      <Radio {...args} label="Второй" name="radio-play" value="second" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const second = canvas.getByRole<HTMLInputElement>("radio", { name: "Второй" });
    await userEvent.click(second);
    await expect(second).toBeChecked();
    await expect(canvas.getByRole("radio", { name: "Первый" })).not.toBeChecked();
  },
};
