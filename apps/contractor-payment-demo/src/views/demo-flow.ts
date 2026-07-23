/**
 * Стадии сквозного сценария демо.
 *
 * `contractor` → `push` → `splash` → `bank_payment` → `bank_success` → `paid`
 *
 * Замкнутый круг: подрядчик показывает, что пользователь возвращается к нему
 * с оплаченным заказом, а не уходит в банк навсегда.
 */
export type DemoStage =
  | "contractor"
  | "push"
  | "splash"
  | "bank_payment"
  | "bank_success"
  | "paid";

export const DEMO_STAGES: readonly DemoStage[] = [
  "contractor",
  "push",
  "splash",
  "bank_payment",
  "bank_success",
  "paid",
];

export function parseStage(value: string | null): DemoStage | null {
  return DEMO_STAGES.includes(value as DemoStage) ? (value as DemoStage) : null;
}

/**
 * Точки, в которых демо может остановиться, и способ продолжить.
 * Из `screens-ozon.md` → «Состояния, в которых демо может остановиться».
 */
export const TERMINAL_STATES = [
  {
    stage: "push" as DemoStage,
    state: "Баннер висит поверх экрана подрядчика; автоскрытия нет",
    continueWith: "тап по баннеру или свайп вверх",
  },
  {
    stage: "contractor" as DemoStage,
    state: "Отмена по «×» на экране оплаты: заказ не оплачен",
    continueWith: "повторный тап по главной кнопке",
  },
  {
    stage: "paid" as DemoStage,
    state: "Подтверждение оплаты",
    continueWith: "«Начать сначала» — он же перезапуск демо",
  },
] as const;
