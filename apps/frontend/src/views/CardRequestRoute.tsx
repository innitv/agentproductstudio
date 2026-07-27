import * as React from "react";

import { CardRequestView, type CardRequestNotice } from "./CardRequestView";
import {
  emptyCardRequestValues,
  loadCardRequestCatalog,
  validateCardRequest,
  type CardRequestErrors,
  type CardRequestStatus,
  type CardRequestValues,
} from "./card-request.data";

/**
 * Роут приложения для экрана заявки (`#card-request`).
 *
 * Здесь и только здесь живёт то, чего не должно быть в истории: загрузка
 * справочников, валидация по нажатию, имитация похода на сервер и таймеры.
 * Разметки в этом файле нет — она одна на всех в `CardRequestView`.
 *
 * Задержка отправки намеренно оставлена: без неё состояние `submitting`
 * никогда не увидит ни человек, ни мобильная приёмка.
 */
const SUBMIT_DELAY_MS = 700;

export function CardRequestRoute() {
  const catalog = React.useMemo(() => loadCardRequestCatalog(), []);
  const [status, setStatus] = React.useState<CardRequestStatus>("idle");
  const [errors, setErrors] = React.useState<CardRequestErrors>({});
  const [notice, setNotice] = React.useState<CardRequestNotice | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  const handleSubmit = React.useCallback(
    (values: CardRequestValues) => {
      const nextErrors = validateCardRequest(values, catalog);
      setErrors(nextErrors);

      if (Object.keys(nextErrors).length > 0) {
        setStatus("error");
        setNotice({
          colorScheme: "error",
          subtitle: "Проверьте поля, отмеченные красным, и отправьте заявку ещё раз.",
          title: "Заявка не отправлена",
        });
        return;
      }

      setStatus("submitting");
      setNotice(null);
      timerRef.current = setTimeout(() => {
        setStatus("success");
        setNotice({
          colorScheme: "success",
          subtitle: `Первым её смотрит ${catalog.reviewers[0]?.name ?? "руководитель подразделения"}.`,
          title: `Заявка ${catalog.requestNumber} ушла на согласование`,
        });
      }, SUBMIT_DELAY_MS);
    },
    [catalog],
  );

  const handleSaveDraft = React.useCallback(() => {
    setNotice({
      colorScheme: "info",
      subtitle: "Черновик виден только вам, пока заявка не отправлена.",
      title: "Черновик сохранён",
    });
  }, []);

  return (
    <CardRequestView
      catalog={catalog}
      errors={errors}
      initialValues={emptyCardRequestValues}
      notice={notice}
      onDismissNotice={() => setNotice(null)}
      onSaveDraft={handleSaveDraft}
      onSubmit={handleSubmit}
      status={status}
    />
  );
}
