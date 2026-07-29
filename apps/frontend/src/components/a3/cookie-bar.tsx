import * as React from "react"

import { Button } from "@/components/shadcn/button"
import { cn } from "@/lib/utils"

import { Container } from "./layout"

/**
 * Панель согласия на cookie.
 *
 * Паттерна согласия в реестре shadcn нет вовсе, поэтому компонент продуктовый.
 * Собран композицией: поверхность `card` с границей и тенью `--shadow-cookie`
 * плюс две библиотечные кнопки.
 *
 * Крестика в образце нет и он не добавляется: выбор обязателен, а закрытие без
 * выбора означало бы «решение не принято», при котором аналитику всё равно
 * нельзя запускать — то есть кнопка, которая ничего не решает.
 *
 * Логика согласия (хранение, очередь аналитики) живёт в роуте: сюда приходят
 * только `visible` и два обработчика, поэтому оба состояния снимаются
 * историями детерминированно.
 */
export function CookieBar({
  className,
  linkHref,
  linkText,
  onAccept,
  onDecline,
  text,
  visible,
}: {
  className?: string
  linkHref: string
  linkText: string
  onAccept: () => void
  onDecline: () => void
  text: string
  visible: boolean
}) {
  if (!visible) return null

  const [before, after] = text.split(linkText)

  return (
    <div
      aria-label="Согласие на использование файлов cookie"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4",
        className,
      )}
      data-testid="a3-cookie-bar"
      role="region"
    >
      <Container>
        <div className="bg-card border-border flex flex-col gap-4 rounded-lg border p-4 shadow-[var(--shadow-cookie)] sm:flex-row sm:items-center sm:gap-6 sm:px-6">
          <p className="text-[0.875rem]/[1.375rem]">
            {before}
            <a className="text-primary underline underline-offset-4" href={linkHref}>
              {linkText}
            </a>
            {after}
          </p>
          <div className="flex shrink-0 gap-3 sm:ml-auto">
            <Button
              className="h-11 flex-1 sm:h-8 sm:flex-none"
              data-testid="a3-cookie-accept"
              onClick={onAccept}
              size="sm"
              type="button"
            >
              Принять
            </Button>
            <Button
              className="h-11 flex-1 sm:h-8 sm:flex-none"
              data-testid="a3-cookie-decline"
              onClick={onDecline}
              size="sm"
              type="button"
              variant="outline"
            >
              Отклонить
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}
