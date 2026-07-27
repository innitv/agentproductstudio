import { ChevronRight, Heart } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { FunctionButton } from "./function-button";

/**
 * Матрица Figma (нода `579:2942`): variant = primary | secondary | tertiary;
 * state = default | hover | pressed | disabled; iconPosition = left.
 * Слоты icon / action icon — boolean + instance swap.
 */
const meta = {
  component: FunctionButton,
  args: {
    children: "Function",
    onClick: fn(),
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "tertiary"] },
  },
  title: "Actions/FunctionButton",
} satisfies Meta<typeof FunctionButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{ alignItems: "center", display: "flex", gap: 16 }}>
      <FunctionButton {...args} variant="primary">
        Primary
      </FunctionButton>
      <FunctionButton {...args} variant="secondary">
        Secondary
      </FunctionButton>
      <FunctionButton {...args} variant="tertiary">
        Tertiary
      </FunctionButton>
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    actionIcon: <ChevronRight aria-hidden="true" />,
    icon: <Heart aria-hidden="true" />,
  },
};

export const IconOnly: Story = {
  args: {
    "aria-label": "В избранное",
    children: undefined,
    icon: <Heart aria-hidden="true" />,
  },
};

export const Disabled: Story = {
  args: { disabled: true, icon: <Heart aria-hidden="true" /> },
};

export const ClickIsHandled: Story = {
  args: { icon: <Heart aria-hidden="true" /> },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button");
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
