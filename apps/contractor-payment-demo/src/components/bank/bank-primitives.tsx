import type { CSSProperties, ReactNode } from "react";

/**
 * Примитивы экранов банка. Читают только `--bank-*` и `--k-*`;
 * ни одной переменной `--t-*` здесь нет — это архитектурная граница.
 */

/** Круглая кнопка «×». Визуальный диаметр донорский, зона нажатия 44. */
export function CloseCircleButton({
  label,
  onClick,
  diameter = "var(--bank-close-d)",
  testId = "bank-close",
}: {
  label: string;
  onClick: () => void;
  diameter?: string;
  testId?: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-label={label}
      onClick={onClick}
      className="absolute flex items-center justify-center"
      style={{
        // Зона нажатия 44 центрируется вокруг видимого круга невидимым
        // padding — приём из screens.md для сегмент-контрола.
        width: "var(--k-tap-min)",
        height: "var(--k-tap-min)",
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        color: "var(--bank-on-primary)",
      }}
    >
      <span
        aria-hidden="true"
        className="flex items-center justify-center"
        style={{
          width: diameter,
          height: diameter,
          borderRadius: "9999px",
          background: "var(--bank-overlay-white-32)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 2l10 10M12 2L2 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </button>
  );
}

/** Статичный чип. НЕ контрол: шеврон и карандаш донора сняты. */
export function StaticChip({
  children,
  fontSize = "14px",
  testId,
}: {
  children: ReactNode;
  fontSize?: string;
  testId?: string;
}) {
  return (
    <span
      data-testid={testId}
      className="inline-flex items-center"
      style={{
        height: "var(--bank-chip-h)",
        paddingInline: "12px",
        borderRadius: "9999px",
        background: "var(--bank-surface-muted)",
        color: "var(--bank-text-secondary)",
        fontSize,
        fontWeight: 400,
        whiteSpace: "nowrap",
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {children}
    </span>
  );
}

/** Аватар мерчанта. Бейдж СБП донора удалён — чужой товарный знак. */
export function AvatarBadge({
  size,
  radius,
  withBadge = false,
  testId = "bank-avatar",
  style,
}: {
  size: string;
  radius: string;
  withBadge?: boolean;
  testId?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      data-testid={testId}
      aria-hidden="true"
      className="relative flex shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "var(--bank-avatar-fill)",
        color: "var(--bank-on-primary)",
        ...style,
      }}
    >
      <svg
        width="46%"
        height="46%"
        viewBox="0 0 24 24"
        fill="none"
        style={{ display: "block" }}
      >
        <path
          d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.44 6.19 20.5 7.3 14.03 2.6 9.45l6.5-.95L12 2.6Z"
          fill="currentColor"
        />
      </svg>

      {withBadge && (
        <span
          data-testid="bank-success-badge"
          className="absolute flex items-center justify-center"
          style={{
            width: "var(--bank-badge-d)",
            height: "var(--bank-badge-d)",
            right: "-2px",
            bottom: "4px",
            borderRadius: "9999px",
            background: "var(--bank-success)",
            color: "var(--bank-on-primary)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6.3 4.6 8.9 10 3.3"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </span>
  );
}

/**
 * Заглушка 3D-иллюстрации.
 *
 * Повторяет КОМПОЗИЦИЮ оригинала — две наложенные плитки, передняя крупнее,
 * задняя развёрнута, — не воспроизводя ни рисунка, ни цветов чужого
 * авторского произведения. Бокс 180×130 фиксирован: реальный ассет
 * встанет через `object-fit: contain` и не сдвинет ни лист, ни крестик.
 */
export function IllustrationSlot() {
  return (
    <span
      data-testid="bank-illustration"
      data-asset-slot="bank_illustration"
      aria-hidden="true"
      className="relative block"
      style={{
        width: "var(--bank-illustration-w)",
        height: "var(--bank-illustration-h)",
      }}
    >
      <span
        className="absolute"
        style={{
          width: "84px",
          height: "84px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.24)",
          left: "calc(50% - 42px + 34px)",
          top: "calc(50% - 42px - 10px)",
          transform: "rotate(12deg)",
        }}
      />
      <span
        className="absolute"
        style={{
          width: "96px",
          height: "96px",
          borderRadius: "24px",
          background: "rgba(255,255,255,0.16)",
          border: "1.5px solid rgba(255,255,255,0.40)",
          left: "calc(50% - 48px)",
          top: "calc(50% - 48px)",
        }}
      />
    </span>
  );
}

/** Главная кнопка экранов банка. Ширина не меняется при смене состояния. */
export function BankPrimaryButton({
  label,
  loadingLabel,
  loading,
  onClick,
  testId = "bank-primary-cta",
  height = "var(--bank-button-h)",
}: {
  label: string;
  loadingLabel: string;
  loading: boolean;
  onClick: () => void;
  testId?: string;
  height?: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      data-state={loading ? "loading" : "default"}
      aria-busy={loading}
      aria-label={label}
      disabled={loading}
      onClick={onClick}
      className="flex w-full items-center justify-center"
      style={{
        height,
        borderRadius: "var(--bank-radius-control)",
        background: "var(--bank-primary)",
        color: "var(--bank-on-primary)",
        fontSize: "17px",
        fontWeight: 700,
        border: "none",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        cursor: loading ? "progress" : "pointer",
        transition: "background-color var(--k-motion-fast) ease-out",
      }}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}
