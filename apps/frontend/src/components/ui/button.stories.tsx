import { Check, ChevronRight } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Button } from "./button";

/**
 * Матрица Figma (`design/figma/a3-design-system/component-map.md`, нода `213:183`):
 * size = xl | l | m | s; variant = primary | secondary | outline | ghost;
 * colorScheme = accent; state = default | hover | pressed | disabled.
 */
const meta = {
  component: Button,
  args: {
    children: "Button label",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["s", "m", "l", "xl"] },
    variant: { control: "inline-radio", options: ["primary", "secondary", "outline", "ghost"] },
  },
  title: "Actions/Button",
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Button {...args} size="xl">
        XL
      </Button>
      <Button {...args} size="l">
        L
      </Button>
      <Button {...args} size="m">
        M
      </Button>
      <Button {...args} size="s">
        S
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    actionIcon: <ChevronRight aria-hidden="true" />,
    leadingIcon: <Check aria-hidden="true" />,
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/**
 * Focus проверяется реальным перемещением фокуса: `:focus-visible` — единственное
 * состояние из hover/pressed/focus, которое воспроизводится программно и в
 * витрине, и в vitest-прогоне.
 */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button");
    await userEvent.tab();
    await expect(button).toHaveFocus();
  },
};

export const AsChildLink: Story = {
  args: { asChild: true },
  render: (args) => (
    <Button {...args}>
      <a href="#button-as-child">Ссылка в оболочке кнопки</a>
    </Button>
  ),
};
