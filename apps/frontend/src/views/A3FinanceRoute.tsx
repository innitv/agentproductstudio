import * as React from "react"
import { toast } from "sonner"

import type { ContactFormStatus } from "@/components/a3/contact-form"

import { A3FinanceView } from "./A3FinanceView"
import {
  emptyContactValues,
  formatAllRequisites,
  microcopy,
  requisiteRows,
  validateContactForm,
  type ContactFormErrors,
  type ContactFormValues,
} from "./a3-finance.data"

/**
 * Роут страницы А3: вся логика страницы собрана здесь.
 *
 * Вид (`A3FinanceView`) остаётся презентационным, поэтому его состояния
 * снимаются историями один в один. Тот же паттерн, что у пилотного экрана
 * студии, и по той же причине.
 */

const CONSENT_KEY = "a3-cookie-consent"
const SUBMIT_DELAY_MS = 700

type Consent = "accepted" | "declined"

/**
 * Очередь аналитики.
 *
 * Событие копится до решения пользователя и уходит ТОЛЬКО после «Принять»;
 * при «Отклонить» очередь очищается. Это условие проверяется тестом, а не
 * обещанием: до согласия ни один аналитический скрипт не инициализирован.
 *
 * В событие идёт `slug` реквизита или документа — не значение. Имя, e-mail и
 * текст обращения в аналитику не попадают ни в каком виде.
 */
interface AnalyticsEvent {
  name: string
  payload?: Record<string, string>
}

function useAnalytics(consent: Consent | null) {
  const queue = React.useRef<AnalyticsEvent[]>([])
  const started = React.useRef(false)

  React.useEffect(() => {
    if (consent === "declined") {
      queue.current = []
      return
    }
    if (consent !== "accepted") return

    // Место инициализации реального счётчика. Пока его нет, событие уходит в
    // no-op — но порядок «согласие → инициализация → отправка» уже соблюдён.
    started.current = true
    queue.current = []
  }, [consent])

  return React.useCallback(
    (name: string, payload?: Record<string, string>) => {
      if (!started.current) {
        queue.current.push({ name, payload })
        return
      }
      // eslint-disable-next-line no-console -- заглушка вместо счётчика
      console.debug("[a3-analytics]", name, payload ?? {})
    },
    [],
  )
}

function readConsent(): Consent | null {
  try {
    const stored = window.localStorage.getItem(CONSENT_KEY)
    return stored === "accepted" || stored === "declined" ? stored : null
  } catch {
    // localStorage недоступен (приватный режим, запрет хранилища) — бар
    // показывается каждый заход. Деградация без ошибки: выбор всё равно
    // спрашивается, просто не запоминается.
    return null
  }
}

function writeConsent(value: Consent) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value)
  } catch {
    /* см. readConsent */
  }
}

export function A3FinanceRoute() {
  const [consent, setConsent] = React.useState<Consent | null>(null)
  const [consentChecked, setConsentChecked] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [status, setStatus] = React.useState<ContactFormStatus>("idle")
  const [errors, setErrors] = React.useState<ContactFormErrors>({})
  const [values, setValues] = React.useState<ContactFormValues>(emptyContactValues)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const track = useAnalytics(consent)

  React.useEffect(() => {
    setConsent(readConsent())
    setConsentChecked(true)
  }, [])

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  React.useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  /**
   * Копирование значения. Clipboard API отказывает без HTTPS и без
   * пользовательского жеста, поэтому отказ — не исключительная ситуация, а
   * штатное состояние с собственным текстом.
   */
  const copy = React.useCallback(async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(successMessage)
      return true
    } catch {
      toast.error(microcopy.copyFailed)
      return false
    }
  }, [])

  const handleCopyRequisite = React.useCallback(
    (slug: string) => {
      const row = requisiteRows.find((item) => item.slug === slug)
      if (!row) return
      void copy(row.value, microcopy.copied(row.label))
      track("requisite_copy", { slug })
    },
    [copy, track],
  )

  const handleCopyAll = React.useCallback(() => {
    void copy(formatAllRequisites(), microcopy.copiedAll)
    track("requisites_copy_all")
  }, [copy, track])

  const handleSubmit = React.useCallback(
    (next: ContactFormValues) => {
      setValues(next)
      const nextErrors = validateContactForm(next)
      setErrors(nextErrors)

      if (Object.keys(nextErrors).length > 0) {
        setStatus("idle")
        // Фокус уходит на первое ошибочное поле, а введённые значения
        // сохраняются: терять текст обращения из-за опечатки в e-mail нельзя.
        const first = (["name", "email", "message", "consents"] as const).find(
          (key) => nextErrors[key],
        )
        const selector =
          first === "consents"
            ? '[data-testid="a3-consent-privacy"]'
            : `[data-testid="a3-form-${first}"]`
        document.querySelector<HTMLElement>(selector)?.focus()
        return
      }

      setStatus("submitting")
      timerRef.current = setTimeout(() => {
        setStatus("success")
        track("contact_form_submit", { result: "success" })
      }, SUBMIT_DELAY_MS)
    },
    [track],
  )

  const handleNavigate = React.useCallback((href: string) => {
    track("anchor_navigate", { anchor: href })
    if (href !== "#contacts") return
    // Фокус на заголовок формы, а не на первое поле: скринридер должен
    // объявить контекст, а не выхватить пользователя в поле ввода.
    window.setTimeout(() => {
      document.querySelector<HTMLElement>("#a3-form-title")?.focus()
    }, 400)
  }, [track])

  return (
    <A3FinanceView
      cookieVisible={consentChecked && consent === null}
      formErrors={errors}
      formStatus={status}
      formValues={values}
      headerScrolled={scrolled}
      menuOpen={menuOpen}
      onCookieAccept={() => {
        writeConsent("accepted")
        setConsent("accepted")
      }}
      onCookieDecline={() => {
        writeConsent("declined")
        setConsent("declined")
      }}
      onCopyAll={handleCopyAll}
      onCopyRequisite={handleCopyRequisite}
      onDownloadDocument={(slug) => track("document_download", { slug })}
      onMenuOpenChange={setMenuOpen}
      onNavigate={handleNavigate}
      onSubmit={handleSubmit}
    />
  )
}
