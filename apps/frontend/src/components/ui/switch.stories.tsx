import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Switch } from "./switch";

/**
 * Матрица Figma (нода `608:662`): size = s | xs;
 * state = default | hover | disabled; checked = false | true;
 * label position = right | left.
 */
const meta = {
  component: Switch,
  args: {
    label: "Уведомления",
    onChange: fn(),
  },
  argTypes: {
    labelPosition: { control: "inline-radio", options: ["left", "right"] },
    size: { control: "inline-radio", options: ["s", "xs"] },
  },
  title: "Forms/Switch",
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = {
  args: { defaultChecked: true },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 24 }}>
      <Switch {...args} defaultChecked label="Size s" size="s" />
      <Switch {...args} defaultChecked label="Size xs" size="xs" />
    </div>
  ),
};

export const LabelPositions: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 12 }}>
      <Switch {...args} defaultChecked label="Лейбл справа" labelPosition="right" />
      <Switch {...args} defaultChecked label="Лейбл слева" labelPosition="left" />
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 24 }}>
      <Switch {...args} disabled label="Disabled off" />
      <Switch {...args} defaultChecked disabled label="Disabled on" />
    </div>
  ),
};

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole("switch");
    await userEvent.tab();
    await expect(control).toHaveFocus();
  },
};

/** Интеракционный тест: клик переключает состояние и вызывает onChange. */
export const ClickToggles: Story = {
  play: async ({ args, canvasElement }) => {
    const control = within(canvasElement).getByRole<HTMLInputElement>("switch");
    await expect(control).not.toBeChecked();
    await userEvent.click(control);
    await expect(control).toBeChecked();
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await userEvent.click(control);
    await expect(control).not.toBeChecked();
  },
};

/** Интеракционный тест: пробел с клавиатуры переключает switch (a11y). */
export const KeyboardToggles: Story = {
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole<HTMLInputElement>("switch");
    await userEvent.tab();
    await expect(control).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(control).toBeChecked();
  },
};

/** Disabled не переключается ни кликом, ни обработчиком. */
export const DisabledDoesNotToggle: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const control = within(canvasElement).getByRole<HTMLInputElement>("switch");
    await userEvent.click(control, { pointerEventsCheck: 0 });
    await expect(control).not.toBeChecked();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
