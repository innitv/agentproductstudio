import { Search, ShieldCheck, User } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Select } from "./select";

/**
 * Матрица Figma (нода `644:2504`): size = l | m | s;
 * state = default | hover | focus | error | disabled;
 * value = none | placeholder | filled; DropdownMenu = boolean (открытое меню).
 */
const options = [
  { icon: <User aria-hidden="true" />, label: "Профиль", value: "profile" },
  { hint: "По умолчанию", icon: <ShieldCheck aria-hidden="true" />, label: "Проверено", value: "verified" },
  { disabled: true, label: "Недоступно", value: "unavailable" },
];

const meta = {
  component: Select,
  args: {
    label: "Статус",
    onOpenChange: fn(),
    onValueChange: fn(),
    options,
    placeholder: "Выберите значение",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["s", "m", "l"] },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 320, width: 320 }}>
        <Story />
      </div>
    ),
  ],
  title: "Forms/Select",
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

/** value = placeholder, меню закрыто. */
export const Default: Story = {};

/** value = filled. */
export const WithValue: Story = {
  args: { defaultValue: "verified" },
};

/**
 * DropdownMenu = true: раскрытый список с выбранным пунктом и disabled-опцией.
 *
 * Известный дефект DS: `role="listbox"` не получает доступного имени
 * (`aria-label`/`aria-labelledby` от лейбла поля) — axe даёт
 * `aria-input-field-name`.
 */
export const Open: Story = {
  args: { defaultOpen: true, defaultValue: "verified" },
};

export const WithLeftIcon: Story = {
  args: { defaultValue: "profile", leftIcon: <Search aria-hidden="true" /> },
};

export const Sizes: Story = {
  args: { defaultValue: "profile" },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      <Select {...args} label="Size L" size="l" />
      <Select {...args} label="Size M" size="m" />
      <Select {...args} label="Size S" size="s" />
    </div>
  ),
};

export const WithHint: Story = {
  args: { hint: "Влияет на видимость записи" },
};

export const ErrorState: Story = {
  args: { hint: "Выберите значение", invalid: true },
};

export const Disabled: Story = {
  args: { defaultValue: "profile", disabled: true },
};

/**
 * Триггер ищется по `aria-haspopup="listbox"`, а не по доступному имени:
 * у `<button>` с внешним `<label for>` имя берётся из лейбла, и селектор по
 * тексту значения был бы хрупким.
 */
const getTrigger = (canvasElement: HTMLElement): HTMLButtonElement => {
  const trigger = canvasElement.querySelector<HTMLButtonElement>('button[aria-haspopup="listbox"]');
  if (!trigger) {
    throw new Error("Триггер Select не найден");
  }
  return trigger;
};

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const trigger = getTrigger(canvasElement);
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
  },
};

/** Интеракционный тест: открытие, выбор опции, закрытие и обновление значения. */
export const OpenAndSelectOption: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = getTrigger(canvasElement);

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const option = canvas.getByRole("option", { name: /Профиль/ });
    await userEvent.click(option);

    await expect(args.onValueChange).toHaveBeenCalledWith("profile", expect.objectContaining({ value: "profile" }));
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveTextContent("Профиль");
  },
};

/** Интеракционный тест: клавиатура — ArrowDown открывает список, Escape закрывает. */
export const KeyboardOpensAndCloses: Story = {
  play: async ({ canvasElement }) => {
    const trigger = getTrigger(canvasElement);

    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

/** Интеракционный тест: disabled-опция не выбирается и не закрывает список. */
export const DisabledOptionIsNotSelectable: Story = {
  args: { defaultOpen: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledOption = canvas.getByRole("option", { name: /Недоступно/ });

    await userEvent.click(disabledOption, { pointerEventsCheck: 0 });
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};
