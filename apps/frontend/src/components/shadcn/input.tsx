import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Высота штатная (h-9). Правка `h-9 → h-11` под тему `a3` откатана
        // 2026-07-29: она меняла ОБЩИЙ примитив ради одной темы и разъехала
        // пару «поле + кнопка очистки» на чужом экране `#card-request-shadcn`
        // (поле стало 44, соседняя icon-кнопка осталась 36). Метрики поля темы
        // `a3` живут теперь в её продуктовом слое `styles/a3.css`.
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
