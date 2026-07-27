import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "./button";
import { Tooltip, type TooltipPlacement } from "./tooltip";

/**
 * Матрица Figma (ноды `615:14` Tooltip, `976:6677` Layout, `975:6109` Pointer):
 * closeButton — boolean; autoWidth = false | true;
 * title / subtitle — boolean; placement — 12 значений.
 */
const placements: TooltipPlacement[] = [
  "top-left",
  "top-center",
  "top-right",
  "right-top",
  "right-center",
  "right-bottom",
  "bottom-left",
  "bottom-center",
  "bottom-right",
  "left-top",
  "left-center",
  "left-bottom",
];

const meta = {
  component: Tooltip,
  args: {
    subtitle: "Подсказка появляется при наведении и фокусе",
    title: "Заголовок подсказки",
  },
  argTypes: {
    placement: { control: "select", options: placements },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 80 }}>
        <Story />
      </div>
    ),
  ],
  title: "Feedback/Tooltip",
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Закрытое состояние: подсказка появляется по наведению или фокусу триггера. */
export const Closed: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <Button size="s" variant="outline">
        Наведите курсор
      </Button>
    </Tooltip>
  ),
};

export const Open: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Tooltip {...args}>
      <Button size="s" variant="outline">
        Наведите курсор
      </Button>
    </Tooltip>
  ),
};

/** Только заголовок (subtitle = false). */
export const TitleOnly: Story = {
  args: { defaultOpen: true, subtitle: undefined },
  render: (args) => (
    <Tooltip {...args}>
      <Button size="s" variant="outline">
        Триггер
      </Button>
    </Tooltip>
  ),
};

/** closeButton = true. */
export const WithCloseButton: Story = {
  args: { closeButton: true, defaultOpen: true },
  render: (args) => (
    <Tooltip {...args}>
      <Button size="s" variant="outline">
        Триггер
      </Button>
    </Tooltip>
  ),
};

/** autoWidth = true: ширина по контенту вместо фиксированной. */
export const AutoWidth: Story = {
  args: { autoWidth: true, defaultOpen: true, subtitle: "Короткий текст" },
  render: (args) => (
    <Tooltip {...args}>
      <Button size="s" variant="outline">
        Триггер
      </Button>
    </Tooltip>
  ),
};

/** Все 12 положений указателя из Figma. */
export const Placements: Story = {
  args: { defaultOpen: true, subtitle: undefined },
  render: (args) => (
    <div style={{ display: "grid", gap: 96, gridTemplateColumns: "repeat(3, 200px)", padding: 40 }}>
      {placements.map((placement) => (
        <Tooltip {...args} key={placement} placement={placement} title={placement}>
          <Button size="s" variant="ghost">
            {placement}
          </Button>
        </Tooltip>
      ))}
    </div>
  ),
};

/** Произвольный контент вместо title/subtitle. */
export const CustomContent: Story = {
  args: {
    content: (
      <div style={{ display: "grid", gap: 4 }}>
        <strong>Свой контент</strong>
        <span>Слот content перекрывает title и subtitle</span>
      </div>
    ),
    defaultOpen: true,
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button size="s" variant="outline">
        Триггер
      </Button>
    </Tooltip>
  ),
};

/** Интеракционный тест: фокус триггера открывает подсказку, blur закрывает. */
export const FocusOpensTooltip: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <Button size="s" variant="outline">
        Триггер
      </Button>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("tooltip")).not.toBeInTheDocument();

    await userEvent.tab();
    await waitFor(async () => {
      await expect(canvas.getByRole("tooltip")).toBeInTheDocument();
    });

    await userEvent.tab();
    await waitFor(async () => {
      await expect(canvas.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  },
};

/** Интеракционный тест: кнопка закрытия убирает подсказку. */
export const CloseButtonHidesTooltip: Story = {
  args: { closeButton: true, defaultOpen: true },
  render: (args) => (
    <Tooltip {...args}>
      <Button size="s" variant="outline">
        Триггер
      </Button>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Close tooltip" }));
    await waitFor(async () => {
      await expect(canvas.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  },
};
