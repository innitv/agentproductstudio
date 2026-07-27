import * as React from "react";
import { Info, Mail, Search, Settings } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Dropdown, DropdownDivider, DropdownGroupTitle, DropdownItem } from "./dropdown";
import { FunctionButton } from "./function-button";
import { Input } from "./input";

/**
 * Матрица Figma (ноды `396:1320` DropdownMenu и `387:1282` Elements / Item):
 * DropdownMenu — top panel / bottom panel / scroll (boolean) + слот списка;
 * Item — type = menu item | group title | group divider, size = m | s,
 * multiselect / selected / hover / disabled = false | true.
 */
const meta = {
  component: Dropdown,
  args: {
    children: (
      <>
        <DropdownItem icon={<Mail aria-hidden="true" />}>Входящие</DropdownItem>
        <DropdownItem hint="Подсказка" icon={<Info aria-hidden="true" />}>
          Пункт с подсказкой
        </DropdownItem>
        <DropdownItem disabled>Недоступный пункт</DropdownItem>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
  title: "Navigation/Dropdown",
} satisfies Meta<typeof Dropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** type = group title и group divider. */
export const WithGroupsAndDivider: Story = {
  args: {
    children: (
      <>
        <DropdownGroupTitle>Почта</DropdownGroupTitle>
        <DropdownItem icon={<Mail aria-hidden="true" />} selected>
          Входящие
        </DropdownItem>
        <DropdownItem icon={<Mail aria-hidden="true" />}>Отправленные</DropdownItem>
        <DropdownDivider />
        <DropdownGroupTitle>Прочее</DropdownGroupTitle>
        <DropdownItem icon={<Settings aria-hidden="true" />}>Настройки</DropdownItem>
      </>
    ),
  },
};

/** multiselect = true: галочка-слот показывает выбранные пункты, роль menuitemcheckbox. */
export const Multiselect: Story = {
  args: {
    children: (
      <>
        <DropdownItem multiselect selected>
          Выбрано
        </DropdownItem>
        <DropdownItem multiselect>Не выбрано</DropdownItem>
        <DropdownItem disabled multiselect>
          Недоступно
        </DropdownItem>
      </>
    ),
  },
};

/** top panel + bottom panel + scroll. */
export const WithPanelsAndScroll: Story = {
  args: {
    bottomPanel: <FunctionButton icon={<Settings aria-hidden="true" />}>Настройки</FunctionButton>,
    children: (
      <>
        {Array.from({ length: 12 }, (_, index) => (
          <DropdownItem key={index}>Пункт списка {index + 1}</DropdownItem>
        ))}
      </>
    ),
    scroll: true,
    topPanel: <Input leftIcon={<Search aria-hidden="true" />} placeholder="Поиск" size="s" />,
  },
};

export const SmallItems: Story = {
  args: {
    children: (
      <>
        <DropdownItem size="s">Компактный пункт</DropdownItem>
        <DropdownItem hint="Hint" size="s">
          Компактный с подсказкой
        </DropdownItem>
        <DropdownItem selected size="s">
          Выбранный компактный
        </DropdownItem>
      </>
    ),
  },
};

/**
 * Пустое меню: состояние без пунктов не должно ломать раскладку.
 *
 * Известный дефект DS: контейнер сохраняет `role="menu"`, но не содержит ни
 * одного `menuitem` — axe даёт `aria-required-children`. Правильное решение
 * (снимать роль меню или показывать статус-строку) — за пределами этого этапа.
 */
export const Empty: Story = {
  args: {
    children: <DropdownGroupTitle>Ничего не найдено</DropdownGroupTitle>,
  },
};

/** Интеракционный тест: активный пункт кликается, disabled — заблокирован в DOM. */
export const ItemClickAndDisabledItem: Story = {
  render: function ItemClickRender(args) {
    return <ItemClickExample {...args} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabled = canvas.getByRole("menuitem", { name: "Недоступный пункт" });

    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveAttribute("data-disabled", "true");

    await userEvent.click(canvas.getByRole("menuitem", { name: "Активный пункт" }));
    await expect(canvas.getByTestId("dropdown-click-count")).toHaveTextContent("1");
  },
};

/** Интеракционный тест: переключение выбранного пункта в multiselect. */
export const MultiselectToggle: Story = {
  render: function MultiselectToggleRender(args) {
    return <MultiselectToggleExample {...args} />;
  },
  play: async ({ canvasElement }) => {
    const item = within(canvasElement).getByRole("menuitemcheckbox", { name: "Только непрочитанные" });

    await expect(item).toHaveAttribute("aria-checked", "false");
    await userEvent.click(item);
    await expect(item).toHaveAttribute("aria-checked", "true");
    await expect(item).toHaveAttribute("data-selected", "true");
  },
};

/** Интеракционный тест: клавиатурная навигация проходит по активным пунктам. */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.tab();
    await expect(canvas.getByRole("menuitem", { name: "Входящие" })).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getByRole("menuitem", { name: /Пункт с подсказкой/ })).toHaveFocus();
  },
};

function ItemClickExample(props: React.ComponentProps<typeof Dropdown>) {
  const [count, setCount] = React.useState(0);

  return (
    <>
      <Dropdown {...props}>
        <DropdownItem onClick={() => setCount((value) => value + 1)}>Активный пункт</DropdownItem>
        <DropdownItem disabled onClick={fn()}>
          Недоступный пункт
        </DropdownItem>
      </Dropdown>
      <p data-testid="dropdown-click-count" style={{ marginTop: 12 }}>
        {count}
      </p>
    </>
  );
}

function MultiselectToggleExample(props: React.ComponentProps<typeof Dropdown>) {
  const [selected, setSelected] = React.useState(false);

  return (
    <Dropdown {...props}>
      <DropdownItem multiselect onClick={() => setSelected((value) => !value)} selected={selected}>
        Только непрочитанные
      </DropdownItem>
    </Dropdown>
  );
}
