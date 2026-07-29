import * as React from "react"

import { Button } from "@/components/shadcn/button"
import { Card } from "@/components/shadcn/card"
import { Checkbox } from "@/components/shadcn/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/shadcn/field"
import { Input } from "@/components/shadcn/input"
import { Spinner } from "@/components/shadcn/spinner"
import { Textarea } from "@/components/shadcn/textarea"
import { cn } from "@/lib/utils"

import { LightSurface } from "./inverted-section"
import {
  contactForm,
  microcopy,
  type ContactFormErrors,
  type ContactFormValues,
} from "@/views/a3-finance.data"

export type ContactFormStatus = "error" | "idle" | "submitting" | "success"

/**
 * Оформление панели.
 *
 * `a3-panel` вместо `shadow-[var(--shadow-panel)]`: `Card` несёт `shadow-sm` в
 * базовой строке, и `tailwind-merge` эти два класса НЕ схлопывает — произвольное
 * значение с `var()` он не относит к группе `shadow`. До правки оба класса
 * доезжали до DOM и побеждал библиотечный, то есть белая панель стояла на синем
 * градиенте с тенью 0 1px 3px вместо 0 10px 28px и от фона не отделялась.
 */
const panelClass = "a3-surface-light a3-panel rounded-lg border-0 p-6 lg:p-8"

/**
 * Метка поля: 14/22, как в образце. Библиотечный `leading-snug` даёт 19.25 —
 * значение вычисляемое (14 × 1.375), а не выбранное.
 */
const fieldLabelClass = "leading-[1.375rem]"

/**
 * Единственная форма страницы.
 *
 * Компонент презентационный: значения, ошибки и статус приходят пропами, а
 * считает их роут той же функцией `validateContactForm`, которой пользуются
 * истории. Состояние, которое нельзя подать пропом, нельзя снять эталоном
 * детерминированно — отсюда разделение.
 *
 * Панель — белая поверхность внутри синей секции (`LightSurface`): ошибки,
 * фокус и статусы читаются только на светлом, красного и зелёного на градиенте
 * на этой странице нет.
 *
 * Подсказка «Как к вам обращаться» стоит в описании поля, а не в плейсхолдере:
 * плейсхолдер образца давал 2.58:1 и исчезал при первом же вводе, то есть был
 * единственным носителем подсказки, который пропадает ровно тогда, когда
 * подсказка нужна.
 */
export function ContactForm({
  className,
  errors = {},
  onSubmit,
  status = "idle",
  values,
}: {
  className?: string
  errors?: ContactFormErrors
  onSubmit?: (values: ContactFormValues) => void
  status?: ContactFormStatus
  values: ContactFormValues
}) {
  const [draft, setDraft] = React.useState<ContactFormValues>(values)
  const busy = status === "submitting"

  // Значения из пропов главнее локального черновика: история подаёт состояние
  // целиком, и без синхронизации она показывала бы первый переданный набор.
  React.useEffect(() => setDraft(values), [values])

  if (status === "success") {
    return (
      <Card
        className={cn(panelClass, "gap-3", className)}
        data-testid="a3-form-success"
      >
        <h3 className="text-[1.25rem]/[1.75rem] font-semibold">
          {microcopy.submitSuccessTitle}
        </h3>
        <p className="text-muted-foreground text-[1rem]/[1.625rem]">{microcopy.submitSuccess}</p>
      </Card>
    )
  }

  return (
    <Card className={cn(panelClass, "gap-0", className)}>
      <form
        data-testid="a3-contact-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit?.(draft)
        }}
      >
        <h3
          className="text-[1.25rem]/[1.75rem] font-semibold outline-none"
          id="a3-form-title"
          tabIndex={-1}
        >
          {contactForm.title}
        </h3>

        <FieldGroup className="mt-6 gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel className={fieldLabelClass} htmlFor="a3-form-name">
                {contactForm.fields.name.label} *
              </FieldLabel>
              <Input
                aria-describedby="a3-form-name-description"
                aria-invalid={Boolean(errors.name)}
                data-testid="a3-form-name"
                disabled={busy}
                id="a3-form-name"
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                value={draft.name}
              />
              <FieldDescription id="a3-form-name-description">
                {contactForm.fields.name.description}
              </FieldDescription>
              {errors.name ? <FieldError>{errors.name}</FieldError> : null}
            </Field>

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel className={fieldLabelClass} htmlFor="a3-form-email">
                {contactForm.fields.email.label} *
              </FieldLabel>
              <Input
                aria-describedby="a3-form-email-description"
                aria-invalid={Boolean(errors.email)}
                data-testid="a3-form-email"
                disabled={busy}
                id="a3-form-email"
                inputMode="email"
                onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                placeholder={contactForm.fields.email.placeholder}
                type="email"
                value={draft.email}
              />
              <FieldDescription id="a3-form-email-description">
                {contactForm.fields.email.description}
              </FieldDescription>
              {errors.email ? <FieldError>{errors.email}</FieldError> : null}
            </Field>
          </div>

          <Field data-invalid={Boolean(errors.message)}>
            <FieldLabel className={fieldLabelClass} htmlFor="a3-form-message">
              {contactForm.fields.message.label} *
            </FieldLabel>
            <Textarea
              aria-invalid={Boolean(errors.message)}
              className="min-h-[120px]"
              data-testid="a3-form-message"
              disabled={busy}
              id="a3-form-message"
              onChange={(event) => setDraft({ ...draft, message: event.target.value })}
              placeholder={contactForm.fields.message.placeholder}
              value={draft.message}
            />
            {errors.message ? <FieldError>{errors.message}</FieldError> : null}
          </Field>

          <fieldset
            className="grid gap-3"
            data-invalid={Boolean(errors.consents)}
            data-testid="a3-form-consents"
          >
            <legend className="sr-only">Согласия</legend>
            {contactForm.consents.map((consent) => (
              <Field key={consent.id} orientation="horizontal">
                <Checkbox
                  aria-invalid={Boolean(errors.consents) && consent.required}
                  checked={draft.consents[consent.id] ?? false}
                  data-testid={`a3-consent-${consent.id}`}
                  disabled={busy}
                  id={`a3-consent-${consent.id}`}
                  onCheckedChange={(checked) =>
                    setDraft({
                      ...draft,
                      consents: { ...draft.consents, [consent.id]: checked === true },
                    })
                  }
                />
                <FieldContent>
                  <FieldLabel
                    className="text-[0.8125rem]/[1.25rem] font-normal"
                    htmlFor={`a3-consent-${consent.id}`}
                  >
                    <span>
                      <ConsentText consent={consent} />
                      {consent.required ? " *" : null}
                    </span>
                  </FieldLabel>
                </FieldContent>
              </Field>
            ))}
            {errors.consents ? (
              <FieldError data-testid="a3-consents-error">{errors.consents}</FieldError>
            ) : null}
          </fieldset>

          {/*
           * Сноска о звёздочке есть только на mobile-макете; здесь она стоит на
           * обеих точках (решение 1.8). Звёздочка без расшифровки не работает,
           * а цвет не может быть единственным индикатором обязательности.
           */}
          <p className="text-muted-foreground text-[0.8125rem]/[1.25rem]">
            {contactForm.requiredNote}
          </p>

          {status === "error" ? (
            <p
              className="text-destructive text-[0.875rem]/[1.375rem]"
              data-testid="a3-form-submit-error"
              role="alert"
            >
              {microcopy.submitError}
            </p>
          ) : null}

          {/*
           * Кегль подписи 16, а не 14 из образца, — принятое отклонение
           * `06-screens` (Component Contract Matrix → `a3-button`, п. 3:
           * унификация лестницы 16/14/13 по требованию `reference-analysis.md`
           * → Disallowed Copying). Начертание при этом Medium, как в образце:
           * до правки слоёв в `styles.css` вес не доезжал ни до одной кнопки.
           */}
          <Button
            className="w-full self-stretch sm:w-auto sm:self-start"
            data-testid="a3-form-submit"
            disabled={busy}
            size="xl"
            type="submit"
          >
            {busy ? (
              <>
                <Spinner />
                {contactForm.submitting}
              </>
            ) : status === "error" ? (
              microcopy.submitRetry
            ) : (
              contactForm.submit
            )}
          </Button>
        </FieldGroup>
      </form>
    </Card>
  )
}


/** Текст согласия со ссылкой внутри — ссылка подчёркнута, как в образце. */
function ConsentText({
  consent,
}: {
  consent: (typeof contactForm.consents)[number]
}) {
  if (!("link" in consent) || !consent.link) return <>{consent.text}</>

  const [before, after] = consent.text.split(consent.link.text)
  return (
    <>
      {before}
      <a
        className="text-primary underline underline-offset-4"
        href={consent.link.href}
        onClick={(event) => event.stopPropagation()}
      >
        {consent.link.text}
      </a>
      {after}
    </>
  )
}
