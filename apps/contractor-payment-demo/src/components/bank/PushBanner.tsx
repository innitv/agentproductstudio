import { useEffect, useRef, useState } from "react";

import { BANK_COPY, COPY } from "@demo/content/copy";
import { BankAppIcon } from "./BankWordmark";

interface Props {
  merchant: string;
  amount: string;
  onOpen: () => void;
  onDismiss: () => void;
}

/**
 * `O-0` — баннер системного уведомления поверх экрана подрядчика.
 *
 * Смысл кадра: два визуальных языка одновременно. Подложка — неизменённый
 * экран подрядчика со всеми его токенами, баннер целиком в `--bank-*`.
 * Затемнения нет: iOS не затемняет экран под баннером, а затемнение
 * сделало бы кадр модальным и смазало бы контраст двух айдентик.
 *
 * Автоскрытия нет намеренно: в живом показе исчезнувший баннер оставляет
 * наблюдателя без точки продолжения.
 *
 * Демо-пометка стоит в шапке на месте времени iOS — попадает в любой
 * скриншот баннера и не добавляет ни одной строки к его высоте.
 */
export function PushBanner({ merchant, amount, onOpen, onDismiss }: Props) {
  const [entered, setEntered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const touchStartY = useRef<number | null>(null);
  const swiped = useRef(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    ref.current?.focus();
    return () => cancelAnimationFrame(frame);
  }, []);

  const dismiss = () => {
    setLeaving(true);
    window.setTimeout(onDismiss, 200);
  };

  return (
    <div
      data-testid="push-layer"
      className="absolute inset-0 z-20"
      style={{ pointerEvents: "none" }}
    >
      <span aria-live="assertive" className="sr-only">
        {BANK_COPY.livePush(amount)}
      </span>

      <button
        ref={ref}
        type="button"
        data-testid="push-banner"
        data-state={leaving ? "dismissing" : pressed ? "pressed" : "rest"}
        onClick={() => {
          // После свайпа браузер всё равно шлёт click — открывать банк по
          // жесту, который означал «убрать», нельзя.
          if (swiped.current) {
            swiped.current = false;
            return;
          }
          onOpen();
        }}
        onPointerDown={(event) => {
          setPressed(true);
          touchStartY.current = event.clientY;
          // Захват указателя обязателен: свайп вверх уводит палец за
          // границы баннера, и без захвата pointerup придёт другому узлу,
          // а жест молча не сработает.
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={(event) => {
          setPressed(false);
          const start = touchStartY.current;
          touchStartY.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          // Свайп вверх убирает баннер и возвращает пользователя на экран
          // подрядчика с сохранённым выбором.
          if (start !== null && start - event.clientY > 24) {
            event.preventDefault();
            swiped.current = true;
            dismiss();
          }
        }}
        onPointerCancel={() => {
          setPressed(false);
          touchStartY.current = null;
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") dismiss();
        }}
        className="absolute flex text-left"
        style={{
          pointerEvents: "auto",
          left: "var(--bank-push-inset)",
          right: "var(--bank-push-inset)",
          top: "var(--bank-push-top)",
          minHeight: "var(--bank-push-min-h)",
          padding: "var(--bank-push-pad)",
          gap: "12px",
          borderRadius: "var(--bank-radius-push)",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          // Единственная тень во всём наборе экранов банка: у уведомления
          // iOS она есть, без неё баннер сливается с экраном подрядчика.
          boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
          border: "none",
          cursor: "pointer",
          transform: leaving
            ? "translateY(-140%)"
            : entered
              ? `translateY(0) scale(${pressed ? 0.98 : 1})`
              : "translateY(-140%)",
          opacity: leaving ? 0 : 1,
          transition:
            "transform var(--k-motion-overlay) ease-out, opacity var(--k-motion-medium) ease-out",
        }}
      >
        <BankAppIcon />

        <span className="flex min-w-0 flex-1 flex-col">
          <span
            className="flex items-baseline justify-between"
            style={{
              gap: "8px",
              fontSize: "13px",
              fontWeight: 400,
              color: "var(--bank-text-secondary)",
            }}
          >
            <span style={{ whiteSpace: "nowrap" }}>{COPY["push.app"]}</span>
            <span data-testid="push-demo-tag" style={{ whiteSpace: "nowrap" }}>
              {COPY["push.demo_tag"]}
            </span>
          </span>

          <span
            data-testid="push-title"
            style={{
              marginTop: "2px",
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--bank-text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {BANK_COPY.pushTitle(amount)}
          </span>

          {/* Усечение бьёт по мерчанту, не по сумме: сумма стоит
              в заголовке и повторяется на трёх экранах ниже. */}
          <span
            data-testid="push-body"
            style={{
              fontSize: "15px",
              fontWeight: 400,
              color: "var(--bank-text-primary)",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
          >
            {BANK_COPY.pushBody(merchant)}
          </span>
        </span>
      </button>
    </div>
  );
}
