import { useState } from "react";

export type ButtonState = "default" | "loading" | "disabled";

interface Props {
  label: string;
  loadingLabel: string;
  state: ButtonState;
  onClick: () => void;
  testId?: string;
}

/**
 * Главная кнопка экрана. Ровно одна на экран.
 *
 * Ширина — FILL минус боковые поля, поэтому она НЕ меняется при смене
 * состояния: метка `cta.loading` длиннее основной, и на кнопке фиксированной
 * ширины это привело бы к дёрганью (ограничение контракта компонента).
 */
export function PrimaryButton({ label, loadingLabel, state, onClick, testId = "primary-cta" }: Props) {
  const [pressed, setPressed] = useState(false);
  const disabled = state === "disabled";
  const loading = state === "loading";

  const background = disabled
    ? "var(--t-brand-disabled)"
    : pressed
      ? "var(--t-brand-pressed)"
      : "var(--t-brand-fill)";

  return (
    <button
      type="button"
      data-testid={testId}
      data-state={state}
      aria-busy={loading}
      disabled={disabled || loading}
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className="flex w-full items-center justify-center"
      style={{
        height: "var(--t-control-height)",
        borderRadius: "var(--t-radius-control)",
        background,
        color: disabled ? "var(--t-text-secondary)" : "var(--t-brand-on)",
        fontSize: "17px",
        fontWeight: 700,
        border: "none",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background-color var(--k-motion-fast) ease-out",
      }}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

/**
 * Закреплённая снизу панель CTA (ось темы 20 = `sticky`).
 *
 * Прилипает к низу вьюпорта страницы (панель абсолютна в пределах колонки,
 * колонка занимает высоту вьюпорта). Нижний отступ — обычный отступ страницы
 * плюс настоящий `env(safe-area-inset-bottom)` устройства, а не нарисованная
 * зона home indicator (её больше нет).
 *
 * Скролл-контейнер обязан зарезервировать нижний padding, равный высоте
 * панели, иначе последняя секция уходит под кнопку.
 */
export function StickyCtaPanel({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-testid="cta-sticky-panel"
      className="absolute inset-x-0 bottom-0 z-10"
      style={{
        background: "var(--t-surface-card)",
        paddingTop: "var(--k-cta-panel-pad-top)",
        paddingBottom:
          "calc(var(--k-cta-panel-pad-bottom) + env(safe-area-inset-bottom, 0px))",
        paddingInline: "var(--t-page-padding)",
      }}
    >
      {children}
    </div>
  );
}

/** Высота панели sticky-CTA = резерв нижнего padding скролл-контейнера. */
export const STICKY_PANEL_RESERVE =
  "calc(var(--t-control-height) + var(--k-cta-panel-pad-top) + var(--k-cta-panel-pad-bottom) + env(safe-area-inset-bottom, 0px))";
