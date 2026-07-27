import * as React from "react"

import {
  CardRequestShadcnView,
  type CardRequestShadcnNotice,
} from "./CardRequestShadcnView"
import {
  emptyCardRequestValues,
  loadCardRequestCatalog,
  validateCardRequest,
  type CardRequestErrors,
  type CardRequestStatus,
  type CardRequestValues,
} from "./card-request.data"
import type { ShadcnTheme } from "@/components/shadcn/theme-scope"

/**
 * Роут приложения для экрана заявки.
 *
 * Открывается по хешу `#card-request-shadcn` на штатной теме реестра. Прежние
 * тематические хеши удалены вместе с темами эксперимента 2026-07-28; параметр
 * `theme` оставлен, потому что именно через него проектная тема применится к
 * экрану, когда появится.
 *
 * Логика (загрузка справочников, валидация, имитация запроса) живёт здесь, а
 * не в самом экране: `CardRequestShadcnView` остаётся презентационным, поэтому
 * его состояния детерминированно снимаются историями.
 */
const SUBMIT_DELAY_MS = 700

export function CardRequestShadcnRoute({ theme = "default" }: { theme?: ShadcnTheme }) {
  const catalog = React.useMemo(() => loadCardRequestCatalog(), [])
  const [status, setStatus] = React.useState<CardRequestStatus>("idle")
  const [errors, setErrors] = React.useState<CardRequestErrors>({})
  const [notice, setNotice] = React.useState<CardRequestShadcnNotice | null>(null)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    },
    [],
  )

  const handleSubmit = React.useCallback(
    (values: CardRequestValues) => {
      const nextErrors = validateCardRequest(values, catalog)
      setErrors(nextErrors)

      if (Object.keys(nextErrors).length > 0) {
        setStatus("error")
        setNotice({
          subtitle: "Проверьте поля, отмеченные красным, и отправьте заявку ещё раз.",
          title: "Заявка не отправлена",
          tone: "error",
        })
        return
      }

      setStatus("submitting")
      setNotice(null)
      timerRef.current = setTimeout(() => {
        setStatus("success")
        setNotice({
          subtitle: `Первым её смотрит ${catalog.reviewers[0]?.name ?? "руководитель подразделения"}.`,
          title: `Заявка ${catalog.requestNumber} ушла на согласование`,
          tone: "success",
        })
      }, SUBMIT_DELAY_MS)
    },
    [catalog],
  )

  const handleSaveDraft = React.useCallback(() => {
    setNotice({
      subtitle: "Черновик виден только вам, пока заявка не отправлена.",
      title: "Черновик сохранён",
      tone: "success",
    })
  }, [])

  return (
    <CardRequestShadcnView
      catalog={catalog}
      errors={errors}
      initialValues={emptyCardRequestValues}
      notice={notice}
      onSaveDraft={handleSaveDraft}
      onSubmit={handleSubmit}
      status={status}
      theme={theme}
    />
  )
}
