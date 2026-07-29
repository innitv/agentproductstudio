import * as React from "react"

import { Button } from "@/components/shadcn/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/shadcn/item"
import { cn } from "@/lib/utils"

/**
 * Иконка документа: контур, stroke 1.5, 28 на desktop и 24 на mobile.
 *
 * Воспроизведена SVG в коде, а не взята из `lucide`: в образце это собственный
 * контур с загнутым углом и тремя линиями текста, а подмена на `FileText`
 * поменяла бы рисунок в единственном месте страницы, где иконка вообще есть.
 * Декоративная — `aria-hidden`.
 */
function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("text-primary size-6 lg:size-7", className)}
      fill="none"
      focusable="false"
      viewBox="0 0 28 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.3 3.5H7.6a1.6 1.6 0 0 0-1.6 1.6v17.8a1.6 1.6 0 0 0 1.6 1.6h12.8a1.6 1.6 0 0 0 1.6-1.6V9.2L16.3 3.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path d="M16.3 3.5v5.7H22" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M10 14h8M10 17.6h8M10 21.2h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  )
}

/**
 * Строка документа раскрытия информации.
 *
 * Обёртка над библиотечным `Item`: сетка `28 / 16 / 1fr / auto` ложится на его
 * flex без правок, поэтому продуктовым здесь остаётся только padding (образец
 * даёт 16/0, `Item` — p-4 со всех сторон) и поведение на mobile.
 *
 * Состояние «файла нет» — не декоративное: шести PDF пока не существует
 * (`Asset Notes` → `blocked`). Строка без файла НЕ рендерит ссылку вовсе,
 * иначе шесть ссылок ведут в 404 — это хуже, чем честная подпись.
 *
 * Шесть одинаковых подписей «Скачать» неразличимы в скринридере, поэтому
 * `aria-label` несёт название документа и формат; видимый текст остаётся
 * коротким.
 */
export function DocumentItem({
  className,
  fileMissingLabel,
  href,
  meta,
  onDownload,
  slug,
  title,
}: {
  className?: string
  fileMissingLabel: string
  href: string | null
  meta: string
  onDownload?: (slug: string) => void
  slug: string
  title: string
}) {
  return (
    <Item
      className={cn(
        /*
         * `Item` несёт `border border-transparent` со всех сторон ради кольца
         * фокуса. Одного `border-border` мало: он покрасил бы все четыре
         * стороны, и строка превратилась бы в карточку — ровно то, что
         * STYLE_GUIDE.md запрещает для справочного контента. Поэтому цвет
         * задаётся только нижней грани — и у ВСЕХ строк, включая последнюю:
         * в образце список закрыт разделителем снизу, а линии над первой
         * строкой нет (её рисовал `border-t` контейнера, снятый 2026-07-29).
         */
        "a3-row-hover border-b-border items-start gap-x-3 gap-y-0 rounded-none border-b px-0 py-3.5 sm:flex-nowrap sm:items-center sm:gap-4 lg:py-4",
        className,
      )}
      data-testid={`a3-doc-${slug}`}
    >
      <ItemMedia className="mt-0.5 shrink-0 self-start sm:mt-0 sm:self-center">
        <DocumentIcon />
      </ItemMedia>
      <ItemContent className="min-w-0 gap-1 sm:gap-0.5">
        <ItemTitle className="text-[0.9375rem]/[1.375rem] font-normal text-wrap lg:text-[1rem]/[1.5rem]">
          {title}
        </ItemTitle>
        <ItemDescription className="text-muted-foreground font-mono text-[0.75rem]/[1rem]">
          {meta}
        </ItemDescription>
      </ItemContent>
      {/*
       * Действие — ОДИН узел на обе точки. На mobile `Item` переносит его на
       * собственную строку (`basis-full`) с отступом под иконку, на desktop он
       * встаёт справа. Две копии с `sm:hidden` дали бы два элемента с
       * одинаковым доступным именем в разметке и разъехались бы при первой же
       * правке подписи.
       */}
      <ItemActions className="basis-full justify-start pl-9 sm:basis-auto sm:justify-end sm:pl-0">
        {href === null ? (
          <p className="text-muted-foreground py-2.5 text-[0.875rem]/[1.25rem] sm:py-0">
            {fileMissingLabel}
          </p>
        ) : (
          <Button
            asChild
            className="h-auto justify-start py-2.5 sm:py-0"
            size="sm"
            variant="link"
          >
            <a
              aria-label={`Скачать: ${title}, PDF`}
              data-testid={`a3-doc-download-${slug}`}
              href={href}
              onClick={() => onDownload?.(slug)}
            >
              Скачать
            </a>
          </Button>
        )}
      </ItemActions>
    </Item>
  )
}
