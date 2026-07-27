import type { Meta, StoryObj } from "@storybook/react-vite"

import { Label } from "./label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select"
import { ShadcnStoryShell } from "./story-shell"
import type { ShadcnTheme } from "./theme-scope"

/**
 * Список снимается РАСКРЫТЫМ намеренно.
 *
 * `SelectContent` уходит порталом в `document.body`, то есть за пределы
 * контейнера темы. Закрытый список это не показал бы, а именно здесь тема чаще
 * всего и теряется. Раскрытый кадр — доказательство, что зеркалирование
 * атрибута на body работает.
 */
const meta = {
  title: "shadcn/Forms/Select",
} satisfies Meta

export default meta

type Story = StoryObj<{ theme: ShadcnTheme }>

const render = (theme: ShadcnTheme) => (
  <ShadcnStoryShell caption="раскрытый список в портале" theme={theme}>
    <div style={{ display: "grid", gap: 6 }}>
      <Label>Подразделение</Label>
      <Select defaultValue="sales" open>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Выберите подразделение" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Активные</SelectLabel>
            <SelectItem value="sales">Коммерческий департамент</SelectItem>
            <SelectItem value="marketing">Маркетинг</SelectItem>
            <SelectItem value="engineering">Инженерия</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Приостановлены</SelectLabel>
            <SelectItem disabled value="logistics">
              Логистика
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
    <div style={{ display: "grid", gap: 6 }}>
      <Label>Валюта карты</Label>
      <Select defaultValue="rub">
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rub">Рубль, RUB</SelectItem>
          <SelectItem value="usd">Доллар США, USD</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </ShadcnStoryShell>
)

export const Default: Story = { render: () => render("default") }
