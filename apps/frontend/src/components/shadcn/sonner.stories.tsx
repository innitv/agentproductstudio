import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { toast } from "sonner"

import { Toaster } from "./sonner"
import { ShadcnStoryShell } from "./story-shell"
import type { ShadcnTheme } from "./theme-scope"

/**
 * Уведомления sonner. Показываются сразу при монтировании и с бесконечной
 * длительностью: иначе кадр зависел бы от того, успел ли таймер скрыть тост,
 * и эталон стал бы нестабильным.
 *
 * Сам `Toaster` рендерится в портале на body — цвета к нему приходят через то
 * же зеркалирование атрибута темы, что и к спискам Select.
 */
const meta = {
  title: "shadcn/Feedback/Toast",
} satisfies Meta

export default meta

type Story = StoryObj<{ theme: ShadcnTheme }>

function ToastStage({ theme }: { theme: ShadcnTheme }) {
  React.useEffect(() => {
    toast.dismiss()
    toast.success("Заявка CR-2418 ушла на согласование", {
      description: "Первым её смотрит Марина Ковалёва.",
      id: "sent",
    })
    toast.error("Заявка не отправлена", {
      description: "Проверьте поля, отмеченные красным, и повторите отправку.",
      id: "failed",
    })

    return () => {
      toast.dismiss()
    }
  }, [theme])

  return (
    <ShadcnStoryShell caption="успех и ошибка" theme={theme}>
      <Toaster
        position="top-center"
        toastOptions={{ duration: Number.POSITIVE_INFINITY }}
        visibleToasts={2}
      />
      <p className="text-muted-foreground text-sm">
        Тосты выведены поверх страницы; ниже оставлено место, чтобы они попали в кадр.
      </p>
      <div style={{ height: 220 }} />
    </ShadcnStoryShell>
  )
}

export const Default: Story = { render: () => <ToastStage theme="default" /> }
export const Branded: Story = { render: () => <ToastStage theme="branded" /> }
