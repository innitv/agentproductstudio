import type { Meta, StoryObj } from "@storybook/react-vite"
import { AlertTriangle, Info, OctagonX } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "./alert"
import { ShadcnStoryShell } from "./story-shell"
import type { ShadcnTheme } from "./theme-scope"

/**
 * У `Alert` в shadcn ровно два варианта: `default` и `destructive`. Состояния
 * «предупреждение» в наборе нет — это заметно на экране заявки, где нужен
 * жёлтый уровень. В историях он собран из `default` с иконкой, чтобы разрыв
 * был виден, а не спрятан за самодельным вариантом.
 */
const meta = {
  title: "shadcn/Feedback/Alert",
} satisfies Meta

export default meta

type Story = StoryObj<{ theme: ShadcnTheme }>

const render = (theme: ShadcnTheme) => (
  <ShadcnStoryShell caption="информация, предупреждение, ошибка" theme={theme}>
    <Alert>
      <Info />
      <AlertTitle>Виртуальная карта активна сразу</AlertTitle>
      <AlertDescription>Пластиковую курьер привозит за три рабочих дня.</AlertDescription>
    </Alert>
    <Alert>
      <AlertTriangle />
      <AlertTitle>Понадобится дополнительное согласование</AlertTitle>
      <AlertDescription>
        Лимит выше 150 000 ₽, поэтому к согласованию добавится финансовый директор. Срок вырастет
        примерно на два рабочих дня.
      </AlertDescription>
    </Alert>
    <Alert variant="destructive">
      <OctagonX />
      <AlertTitle>Заявку не удалось отправить</AlertTitle>
      <AlertDescription>
        Проверьте поля, отмеченные красным ниже. Всего с ошибками: 6.
      </AlertDescription>
    </Alert>
  </ShadcnStoryShell>
)

export const Default: Story = { render: () => render("default") }
