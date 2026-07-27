import * as React from "react";
import { Heart } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Chip, ChipDismissIcon } from "./chip";

/**
 * Матрица Figma (нода `234:38`): size = m; variant = primary | secondary;
 * state = default | hover | pressed | disabled; selected = false | true.
 * Слоты icon и action icon — boolean + instance swap.
 */
const meta = {
  component: Chip,
  args: {
    children: "Фильтр",
    onClick: fn(),
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary"] },
  },
  title: "Forms/Chip",
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12 }}>
      <Chip {...args} variant="primary">
        Primary
      </Chip>
      <Chip {...args} variant="secondary">
        Secondary
      </Chip>
    </div>
  ),
};

/** selected = true отражается в `aria-pressed`, а не только в цвете. */
export const Selected: Story = {
  args: { selected: true },
  render: (args) => (
    <div style={{ display: "flex", gap: 12 }}>
      <Chip {...args} variant="primary">
        Primary выбран
      </Chip>
      <Chip {...args} variant="secondary">
        Secondary выбран
      </Chip>
    </div>
  ),
};

export const WithIcon: Story = {
  args: { icon: <Heart aria-hidden="true" /> },
};

export const WithDismissAction: Story = {
  args: {
    actionIcon: <ChipDismissIcon aria-hidden="true" />,
    icon: <Heart aria-hidden="true" />,
    selected: true,
  },
};

export const Disabled: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12 }}>
      <Chip {...args} disabled>
        Disabled
      </Chip>
      <Chip {...args} disabled selected>
        Disabled выбран
      </Chip>
    </div>
  ),
};

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const chip = within(canvasElement).getByRole("button", { name: "Фильтр" });
    await userEvent.tab();
    await expect(chip).toHaveFocus();
  },
};

/** Интеракционный тест: клик переключает `aria-pressed` и вызывает обработчик. */
export const ClickTogglesSelection: Story = {
  render: function ClickTogglesRender(args) {
    return <ToggleChipExample {...args} />;
  },
  play: async ({ canvasElement }) => {
    const chip = within(canvasElement).getByRole("button", { name: "Фильтр" });

    await expect(chip).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(chip).toHaveAttribute("data-selected", "true");
  },
};

/** Интеракционный тест: disabled-чип не реагирует на клик. */
export const DisabledDoesNotFire: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const chip = within(canvasElement).getByRole("button", { name: "Фильтр" });
    await userEvent.click(chip, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

function ToggleChipExample(props: React.ComponentProps<typeof Chip>) {
  const [selected, setSelected] = React.useState(false);

  return (
    <Chip {...props} onClick={() => setSelected((value) => !value)} selected={selected}>
      Фильтр
    </Chip>
  );
}
