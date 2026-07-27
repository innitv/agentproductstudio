import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Breadcrumbs } from "./breadcrumbs";

/**
 * Матрица Figma (ноды `382:1472` Breadcrumbs, `382:809` Elements / Breadcrumb,
 * `239:997` More Button): 2/3/4 crumbs и current crumb — boolean;
 * hidden crumbs = true | false; у элемента hover = false | true;
 * у more-кнопки state = default | hover | active.
 */
const meta = {
  component: Breadcrumbs,
  args: {
    items: [
      { href: "#main", label: "Главная" },
      { href: "#section", label: "Компоненты" },
      { current: true, label: "Хлебные крошки" },
    ],
  },
  title: "Navigation/Breadcrumbs",
} satisfies Meta<typeof Breadcrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 3 crumbs + current crumb. */
export const Default: Story = {};

export const TwoCrumbs: Story = {
  args: {
    items: [
      { href: "#main", label: "Главная" },
      { current: true, label: "Раздел" },
    ],
  },
};

export const FourCrumbs: Story = {
  args: {
    items: [
      { href: "#main", label: "Главная" },
      { href: "#catalog", label: "Каталог" },
      { href: "#category", label: "Категория" },
      { current: true, label: "Товар" },
    ],
  },
};

/** hidden crumbs = true, меню свёрнуто. */
export const WithHiddenCrumbs: Story = {
  args: {
    hiddenItems: [{ label: "Скрытый раздел 1" }, { label: "Скрытый раздел 2" }],
  },
};

/** hidden crumbs = true, more-кнопка в состоянии active с раскрытым меню. */
export const HiddenCrumbsMenuOpen: Story = {
  args: {
    defaultMenuOpen: true,
    hiddenItems: [{ label: "Скрытый раздел 1" }, { label: "Скрытый раздел 2" }],
  },
};

export const WithDisabledCrumb: Story = {
  args: {
    items: [
      { href: "#main", label: "Главная" },
      { disabled: true, label: "Недоступный раздел" },
      { current: true, label: "Текущий" },
    ],
  },
};

/** Длинные подписи: проверка переноса и того, что крошки не рвут раскладку. */
export const LongLabels: Story = {
  args: {
    items: [
      { href: "#main", label: "Главная страница продукта" },
      { href: "#section", label: "Очень длинное название промежуточного раздела" },
      { current: true, label: "Финальный экран с длинным заголовком" },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
};

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const first = within(canvasElement).getByRole("link", { name: "Главная" });
    await userEvent.tab();
    await expect(first).toHaveFocus();
  },
};

/** Интеракционный тест: more-кнопка раскрывает и скрывает меню, aria-expanded синхронно. */
export const MoreButtonOpensMenu: Story = {
  args: {
    hiddenItems: [{ label: "Скрытый раздел 1" }, { label: "Скрытый раздел 2" }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const moreButton = canvas.getByRole("button", { name: "Show hidden breadcrumbs" });

    await expect(moreButton).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(moreButton);
    await expect(moreButton).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("menuitem", { name: "Скрытый раздел 1" })).toBeInTheDocument();

    await userEvent.click(moreButton);
    await expect(moreButton).toHaveAttribute("aria-expanded", "false");
  },
};

/** Текущая крошка помечена aria-current и не является ссылкой. */
export const CurrentCrumbIsNotInteractive: Story = {
  play: async ({ canvasElement }) => {
    const current = within(canvasElement).getByRole("button", { name: "Хлебные крошки" });
    await expect(current).toHaveAttribute("aria-current", "page");
    await expect(current).toBeDisabled();
  },
};
