import type { Meta, StoryObj } from "@storybook/react-vite"

import { Badge } from "./badge"
import { Button } from "./button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card"
import { Separator } from "./separator"
import { ShadcnStoryShell } from "./story-shell"
import type { ShadcnTheme } from "./theme-scope"

const meta = {
  title: "shadcn/Layout/Card",
} satisfies Meta

export default meta

type Story = StoryObj<{ theme: ShadcnTheme }>

const render = (theme: ShadcnTheme) => (
  <ShadcnStoryShell caption="карточка секции формы" theme={theme}>
    <Card>
      <CardHeader>
        <CardTitle>Маршрут согласования</CardTitle>
        <CardDescription>
          Согласующие идут по порядку. Отказ на любом шаге возвращает заявку автору.
        </CardDescription>
        <CardAction>
          <Badge variant="secondary">3 шага</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-3 text-sm">
          <li>
            Марина Ковалёва <span className="text-muted-foreground">· руководитель подразделения</span>
          </li>
          <li>
            Отдел финансового контроля <span className="text-muted-foreground">· проверка лимитов</span>
          </li>
          <li>
            Служба безопасности <span className="text-muted-foreground">· уже пройдено</span>
          </li>
        </ol>
        <Separator className="my-4" />
        <p className="text-muted-foreground text-sm">
          Лимит <span data-numeric>80 000 ₽</span> в месяц
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline">Добавить согласующего</Button>
        <Button>Отправить</Button>
      </CardFooter>
    </Card>
  </ShadcnStoryShell>
)

export const Default: Story = { render: () => render("default") }
export const Branded: Story = { render: () => render("branded") }
