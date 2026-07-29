import * as React from "react"

import { Button } from "@/components/shadcn/button"
import { cn } from "@/lib/utils"

import { ContactForm, type ContactFormStatus } from "./contact-form"
import { DocumentItem } from "./document-item"
import { Eyebrow } from "./eyebrow"
import { InvertedSection } from "./inverted-section"
import { Container, Section } from "./layout"
import { NoticeRule } from "./notice-rule"
import { RequisiteRow } from "./requisite-row"
import { SectionHeading } from "./section-heading"
import {
  activity,
  contacts,
  disclosure,
  documentGroups,
  microcopy,
  requisiteRows,
  requisites,
  supervision,
  type ContactFormErrors,
  type ContactFormValues,
  type DocumentGroup,
  type RequisiteEntry,
} from "@/views/a3-finance.data"

/**
 * Секции страницы вынесены сюда, а не оставлены внутри вида, по одной причине:
 * страница desktop высотой 5714 px не помещается в кадр скриншот-регрессии
 * (1280×2000), а `fullPage` даёт заведомо ложный кадр — `position: fixed`
 * Playwright рисует на позиции текущего скролла. Поэтому эталон снимается
 * посекционно, и каждая секция обязана быть самостоятельно рендеримым узлом.
 *
 * Из этого же следует правило: секция не имеет права зависеть от состояния
 * страницы. Всё, что меняется, приходит пропами.
 */

/** Блок 2. Перечень операций — строки с mono-маркером, не карточки. */
export function ActivitySection() {
  return (
    <Section id="activity" labelledBy="a3-activity-title">
      <Container>
        <SectionHeading
          eyebrow={activity.eyebrow}
          id="a3-activity-title"
          lead={activity.lead}
          title={activity.title}
        />
        {/*
         * Тире в образце нарисовано отдельной текстовой нодой. Здесь это
         * маркер списка через `::marker`-подобный span с `aria-hidden`:
         * попав в текст пункта, тире читалось бы скринридером перед каждой
         * строкой.
         */}
        <ul className="mt-10 max-w-[820px] space-y-4">
          {activity.items.map((item) => (
            <li className="flex gap-4" key={item}>
              <span aria-hidden="true" className="text-primary font-mono">
                —
              </span>
              <span className="text-[1rem]/[1.625rem]">{item}</span>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}

/** Блок 3. Серый фон, два подблока по три строки на разделителях. */
export function DisclosureSection({
  groups = documentGroups,
  onDownload,
}: {
  groups?: DocumentGroup[]
  onDownload?: (slug: string) => void
}) {
  return (
    <Section className="bg-secondary" id="disclosure" labelledBy="a3-disclosure-title">
      <Container>
        <SectionHeading
          eyebrow={disclosure.eyebrow}
          id="a3-disclosure-title"
          lead={disclosure.lead}
          title={disclosure.title}
        />
        <div className="mt-10 space-y-10">
          {groups.map((group) => (
            <div key={group.heading}>
              <h3 className="text-[1.25rem]/[1.75rem] font-semibold">{group.heading}</h3>
              {/*
               * Линии НАД первой строкой нет: в образце разделитель стоит
               * только снизу каждой строки, включая последнюю. `border-t` на
               * контейнере рисовал лишнюю черту прямо под подзаголовком.
               */}
              <div className="mt-4">
                {group.items.map((item) => (
                  <DocumentItem
                    fileMissingLabel={microcopy.fileMissing}
                    href={item.href}
                    key={item.slug}
                    meta={item.meta}
                    onDownload={onDownload}
                    slug={item.slug}
                    title={item.title}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

/** Блок 4. Две кнопки над таблицей и 16 строк реквизитов. */
export function RequisitesSection({
  onCopy,
  onCopyAll,
  onDownloadCard,
  rows = requisiteRows,
}: {
  onCopy?: (slug: string) => void
  onCopyAll?: () => void
  onDownloadCard?: () => void
  rows?: RequisiteEntry[]
}) {
  return (
    <Section id="requisites" labelledBy="a3-requisites-title">
      <Container>
        <SectionHeading
          eyebrow={requisites.eyebrow}
          id="a3-requisites-title"
          lead={requisites.lead}
          title={requisites.title}
        />

        {/* Зазор 12 px — замер образца (`41:2`, section-requisites): правый край
            «Скопировать все реквизиты» −4337, левый край «Скачать карточку» −4325.
            Было `sm:gap-8` (32) — расхождение нашёл пользователь глазами. */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-3">
          <Button
            data-testid="a3-copy-all"
            onClick={onCopyAll}
            size="lg"
            type="button"
            variant="outline"
          >
            {requisites.copyAll}
          </Button>
          <Button
            aria-describedby={
              requisites.downloadCardAvailable ? undefined : "a3-download-card-note"
            }
            data-testid="a3-download-card"
            disabled={!requisites.downloadCardAvailable}
            onClick={onDownloadCard}
            size="lg"
            type="button"
            variant="outline"
          >
            {requisites.downloadCard}
          </Button>
          {requisites.downloadCardAvailable ? null : (
            <p
              className="text-muted-foreground self-center text-[0.875rem]/[1.375rem]"
              id="a3-download-card-note"
            >
              {microcopy.cardUnavailable}
            </p>
          )}
        </div>

        {/* Пары «подпись — значение» — это определения, поэтому `dl`. */}
        <dl className="border-border mt-8 border-t">
          {rows.map((row) => (
            <RequisiteRow
              hint={row.hint}
              key={row.slug}
              kind={row.kind}
              label={row.label}
              onCopy={onCopy}
              slug={row.slug}
              value={row.value}
            />
          ))}
        </dl>
      </Container>
    </Section>
  )
}

/** Блок 5. Инверсная секция: контакт-блок 360 плюс панель формы 792. */
export function ContactsSection({
  formErrors,
  formStatus = "idle",
  formValues,
  onSubmit,
}: {
  formErrors?: ContactFormErrors
  formStatus?: ContactFormStatus
  formValues: ContactFormValues
  onSubmit?: (values: ContactFormValues) => void
}) {
  return (
    <InvertedSection>
      <Section id="contacts" labelledBy="a3-contacts-title">
        <Container>
          {/*
           * Заголовочная тройка стоит НАД двухколоночным блоком, а не внутри
           * левой колонки. В образце (`41:312`) лид «Если у вас есть вопрос…»
           * занимает ширину текстовой зоны (~680) и относится ко всей секции;
           * вложенный в колонку 360, он вытягивался в пять строк и читался как
           * подпись к контактам.
           */}
          <SectionHeading
            eyebrow={contacts.eyebrow}
            id="a3-contacts-title"
            lead={contacts.lead}
            title={contacts.title}
            tone="inverse"
          />

          <div className="mt-10 grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-12">
            <div>
              <dl className="space-y-6">
                {contacts.items.map((item) => (
                  <div key={item.label}>
                    <dt>
                      <Eyebrow tone="inverse">{item.label}</Eyebrow>
                    </dt>
                    <dd
                      className={cn(
                        "mt-1.5",
                        item.kind === "prose"
                          ? "text-[1rem]/[1.625rem]"
                          : "font-mono text-[0.9375rem]/[1.5rem]",
                      )}
                    >
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <ContactForm
              errors={formErrors}
              onSubmit={onSubmit}
              status={formStatus}
              values={formValues}
            />
          </div>
        </Container>
      </Section>
    </InvertedSection>
  )
}

/** Блок 6. Два столбца контактов надзора, callout и сноска. */
export function SupervisionSection({ className }: { className?: string }) {
  return (
    <Section
      className={cn(className)}
      id="supervision"
      labelledBy="a3-supervision-title"
    >
      <Container>
        <SectionHeading
          eyebrow={supervision.eyebrow}
          id="a3-supervision-title"
          lead={supervision.lead}
          title={supervision.title}
        />

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:max-w-[820px]">
          {supervision.columns.map((column) => (
            <div key={column.label}>
              <Eyebrow>{column.label}</Eyebrow>
              <ul className="mt-3 space-y-2">
                {column.values.map((value) => (
                  <li key={value.text}>
                    <a
                      className="hover:text-primary text-[1rem]/[1.625rem] underline-offset-4 transition-colors duration-150 ease-out hover:underline"
                      href={value.href}
                      rel={value.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      target={value.href.startsWith("http") ? "_blank" : undefined}
                    >
                      {value.text}
                      {value.href.startsWith("http") ? (
                        <span className="sr-only"> (внешняя ссылка, откроется в новой вкладке)</span>
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <NoticeRule className="mt-10 max-w-[820px]" weight="thick">
          {supervision.callout}
        </NoticeRule>

        <p className="text-muted-foreground mt-8 max-w-[820px] text-[0.875rem]/[1.375rem] lg:text-[0.9375rem]/[1.5rem]">
          {supervision.footnote}
        </p>
      </Container>
    </Section>
  )
}
