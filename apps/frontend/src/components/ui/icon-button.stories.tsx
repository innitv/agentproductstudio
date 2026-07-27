import { MoreHorizontal, Search, Settings, X } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { IconButton } from "./icon-button";

/**
 * Матрица Figma (нода `779:23829`): size = xl | l | m | s;
 * variant = primary | secondary | outline | ghost;
 * colorScheme = accent | neutral; state = default | hover | pressed | disabled.
 */
const meta = {
  component: IconButton,
  args: {
    "aria-label": "Настройки",
    icon: <Settings aria-hidden="true" />,
  },
  argTypes: {
    colorScheme: { control: "inline-radio", options: ["accent", "neutral"] },
    size: { control: "inline-radio", options: ["s", "m", "l", "xl"] },
    variant: { control: "inline-radio", options: ["primary", "secondary", "outline", "ghost"] },
  },
  title: "Actions/IconButton",
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const VariantsAccent: Story = {
  render: (args) => (
    <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
      <IconButton {...args} variant="primary" />
      <IconButton {...args} variant="secondary" />
      <IconButton {...args} variant="outline" />
      <IconButton {...args} variant="ghost" />
    </div>
  ),
};

export const VariantsNeutral: Story = {
  args: { colorScheme: "neutral", icon: <MoreHorizontal aria-hidden="true" /> },
  render: (args) => (
    <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
      <IconButton {...args} variant="primary" />
      <IconButton {...args} variant="secondary" />
      <IconButton {...args} variant="outline" />
      <IconButton {...args} variant="ghost" />
    </div>
  ),
};

export const Sizes: Story = {
  args: { icon: <Search aria-hidden="true" /> },
  render: (args) => (
    <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
      <IconButton {...args} size="xl" />
      <IconButton {...args} size="l" />
      <IconButton {...args} size="m" />
      <IconButton {...args} size="s" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, icon: <X aria-hidden="true" /> },
  render: (args) => (
    <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
      <IconButton {...args} variant="primary" />
      <IconButton {...args} variant="secondary" />
      <IconButton {...args} variant="outline" />
      <IconButton {...args} variant="ghost" />
    </div>
  ),
};

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Настройки" });
    await userEvent.tab();
    await expect(button).toHaveFocus();
  },
};
