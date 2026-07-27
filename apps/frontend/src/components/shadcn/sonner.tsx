import * as React from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * ПРАВКА ОТНОСИТЕЛЬНО ИСХОДНИКА shadcn.
 *
 * Оригинальный `sonner.tsx` из реестра читает тему через `useTheme()` из
 * `next-themes` — пакета из экосистемы Next.js, который тянет собственный
 * провайдер. Next.js в этом приложении нет, тема переключается атрибутом
 * `data-shadcn-theme` (см. `theme-scope.tsx`), поэтому провайдер `next-themes`
 * был бы третьей зависимостью ради одной строки.
 *
 * Здесь `theme` стал обычным пропом со значением по умолчанию `light`, а
 * `next-themes` убран из зависимостей проекта. Это ровно тот случай, когда
 * токеном не обойтись: правка в коде компонента.
 */
function Toaster({ theme = "light", ...props }: ToasterProps) {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
