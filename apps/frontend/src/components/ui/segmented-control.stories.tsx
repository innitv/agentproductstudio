import { Bell, Home, Settings } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { SegmentedControl } from "./segmented-control";

/**
 * Матрица Figma (ноды `627:1899` / `626:11`): size = l | m | s; variant = primary;
 * onlyicon = false | true; у сегмента selected = false | true,
 * state = default | hover | disabled.
 */
const periodOptions = [
  { label: "Сегодня", value: "today" },
  { label: "Неделя", value: "week" },
  { label: "Месяц", value: "month" },
  { label: "Год", value: "year" },
];

const iconOptions = [
  { icon: <Home aria-hidden="true" />, label: "Главная", value: "home" },
  { icon: <Bell aria-hidden="true" />, label: "Оповещения", value: "alerts" },
  { icon: <Settings aria-hidden="true" />, label: "Настройки", value: "settings" },
];

const meta = {
  component: SegmentedControl,
  args: {
    defaultValue: "today",
    onValueChange: fn(),
    options: periodOptions,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["s", "m", "l"] },
  },
  title: "Forms/SegmentedControl",
} satisfies Meta<typeof SegmentedControl>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      <SegmentedControl {...args} size="l" />
      <SegmentedControl {...args} size="m" />
      <SegmentedControl {...args} size="s" />
    </div>
  ),
};

/**
 * onlyicon = true.
 *
 * Известный дефект DS: `label` из `options` в этом режиме только скрывается,
 * в `aria-label` не пробрасывается — axe даёт `button-name` на каждом сегменте.
 * Story оставлена как есть, чтобы дефект был виден в панели Accessibility,
 * а не замаскирован ручным `aria-label` в витрине.
 */
export const IconOnly: Story = {
  args: { defaultValue: "home", iconOnly: true, options: iconOptions },
  render: (args) => (
    <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      <SegmentedControl {...args} size="m" />
      <SegmentedControl {...args} size="s" />
    </div>
  ),
};

export const WithIconsAndLabels: Story = {
  args: { defaultValue: "home", options: iconOptions },
};

export const WithDisabledSegment: Story = {
  args: {
    options: [
      { label: "Сегодня", value: "today" },
      { label: "Неделя", value: "week" },
      { disabled: true, label: "Год (нет данных)", value: "year" },
    ],
  },
};

/** Контролируемое значение: selected приходит снаружи. */
export const Controlled: Story = {
  args: { value: "month" },
};

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const first = within(canvasElement).getByRole("radio", { name: "Сегодня" });
    await userEvent.tab();
    await expect(first).toHaveFocus();
  },
};

/** Интеракционный тест: выбор сегмента переносит `aria-checked` и вызывает onValueChange. */
export const SelectSegment: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const today = canvas.getByRole("radio", { name: "Сегодня" });
    const month = canvas.getByRole("radio", { name: "Месяц" });

    await expect(today).toHaveAttribute("aria-checked", "true");
    await userEvent.click(month);
    await expect(month).toHaveAttribute("aria-checked", "true");
    await expect(today).toHaveAttribute("aria-checked", "false");
    await expect(args.onValueChange).toHaveBeenCalledWith("month");
  },
};

/** Интеракционный тест: disabled-сегмент не становится выбранным. */
export const DisabledSegmentIsNotSelectable: Story = {
  args: {
    options: [
      { label: "Сегодня", value: "today" },
      { disabled: true, label: "Год (нет данных)", value: "year" },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledSegment = canvas.getByRole("radio", { name: "Год (нет данных)" });

    await userEvent.click(disabledSegment, { pointerEventsCheck: 0 });
    await expect(disabledSegment).toHaveAttribute("aria-checked", "false");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};
