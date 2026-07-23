import { useCallback, useEffect, useRef, useState } from "react";

import { HandoffOverlay } from "@demo/components/HandoffOverlay";
import { PhoneFrame } from "@demo/components/PhoneFrame";
import type { PhoneGateError } from "@demo/components/PhoneGateBlock";
import type { ButtonState } from "@demo/components/PrimaryButton";
import { PushBanner } from "@demo/components/bank/PushBanner";
import { COPY } from "@demo/content/copy";
import { track } from "@demo/lib/analytics";
import type { BuiltTheme } from "@demo/theme/build-theme";
import { OZON_METHOD_ID } from "@demo/theme/tenant.schema";
import { BankPaymentScreen } from "./BankPaymentScreen";
import { BankSplashScreen } from "./BankSplashScreen";
import { BankSuccessScreen } from "./BankSuccessScreen";
import { CartCheckoutScreen } from "./CartCheckoutScreen";
import { PaidConfirmationScreen } from "./PaidConfirmationScreen";
import { SubscriptionPaymentScreen } from "./SubscriptionPaymentScreen";
import type { DemoStage } from "./demo-flow";
import type { ForcedState, PhoneGateSlot } from "./screen-props";

interface Props {
  theme: BuiltTheme;
  forcedState: ForcedState;
  /** Короткий отдельный сценарий «только момент перехода» (`S-C`). */
  showHandoff: boolean;
  /** Принудительная стадия для съёмки и ревью. */
  initialStage: DemoStage | null;
}

/**
 * Оболочка демо: сквозной сценарий от экрана подрядчика до возврата.
 *
 * Решение по `S-C` — вариант 2 (`screens-ozon.md`, рекомендация
 * `design-generator`, утверждено оркестратором): в полном флоу пуш приходит
 * поверх экрана подрядчика, а `HandoffOverlay` остаётся отдельным коротким
 * сценарием по `?state=handoff`.
 *
 * Проверка клиентства (`screens-phone-check.md`) встроена МЕЖДУ выбором
 * «Ozon Банк» и пушем: выбор раскрывает поле телефона, главная кнопка
 * запускает проверку `check_ms`, которая ЗАМЕЩАЕТ прежнюю паузу `push_delay`.
 * Номер живёт только в состоянии React: ни сети, ни storage, ни аналитики
 * с цифрами.
 *
 * Экраны банка получают `theme.bankPayload` и НЕ получают theme.
 */
export function ScreenHost({ theme, forcedState, showHandoff, initialStage }: Props) {
  const { tenant, bankPayload } = theme;
  const timings = tenant.demo.timings;
  const phoneGate = tenant.ozon.phone_gate;
  const notClientDigits = phoneGate.not_client_number.replace(/\D/g, "");

  const ozonForced =
    forcedState === "ozon_selected" ||
    forcedState === "phone_expanded" ||
    forcedState === "phone_checking" ||
    forcedState === "phone_error";

  const [selected, setSelected] = useState<string | null>(() =>
    ozonForced || initialStage !== null
      ? OZON_METHOD_ID
      : tenant.payment_list.default_selected,
  );
  const [ctaState, setCtaState] = useState<ButtonState>(
    forcedState === "cta_loading" || initialStage === "push" ? "loading" : "default",
  );
  const [stage, setStage] = useState<DemoStage>(initialStage ?? "contractor");
  const [bankLoading, setBankLoading] = useState(false);
  const [handoff, setHandoff] = useState(showHandoff);

  // ── Состояние проверки телефона ────────────────────────────────────
  const [phoneDigits, setPhoneDigits] = useState<string>(() =>
    forcedState === "phone_checking"
      ? "9991234567"
      : forcedState === "phone_error"
        ? notClientDigits
        : "",
  );
  const [phoneError, setPhoneError] = useState<PhoneGateError>(
    forcedState === "phone_error" ? "not_client" : null,
  );
  const [phoneChecking, setPhoneChecking] = useState(forcedState === "phone_checking");
  const [phoneFocusSignal, setPhoneFocusSignal] = useState(0);

  const timers = useRef<number[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  /*
   * Splash живёт заданное время и уходит сам. Длительность НЕ зависит от
   * prefers-reduced-motion: движение убирается, экран и его длительность —
   * нет.
   */
  useEffect(() => {
    if (stage !== "splash") return;
    const id = window.setTimeout(() => setStage("bank_payment"), timings.splash_ms);
    return () => window.clearTimeout(id);
  }, [stage, timings.splash_ms]);

  const base = { archetype: tenant.archetype, tenant_id: tenant.tenant_id };

  const handleSelect = useCallback(
    (id: string) => {
      setSelected(id);
      // Смена способа оплаты сбрасывает ошибку прошлой проверки; введённые
      // цифры сохраняются в состоянии и подставятся обратно при возврате.
      if (id !== OZON_METHOD_ID) setPhoneError(null);
      track("payment_method_selected", { ...base, method_id: id });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tenant.tenant_id, tenant.archetype],
  );

  const handlePhoneChange = useCallback((digits: string) => {
    setPhoneDigits(digits);
    // Ошибка снимается по первому изменению значения — не по blur и не по
    // повторному нажатию кнопки.
    setPhoneError(null);
  }, []);

  const phoneGateActive = phoneGate.enabled && selected === OZON_METHOD_ID;

  // ── Шаг 1: главная кнопка экрана подрядчика ────────────────────────
  const handleCta = useCallback(() => {
    if (ctaState === "loading" || phoneChecking) return;

    // Ветка проверки телефона: активна, только когда выбран «Ozon Банк»
    // и gate включён. Поле НЕ является источником disabled — кнопка живая.
    if (phoneGateActive) {
      if (phoneDigits.length === 0) {
        setPhoneError("empty");
        setPhoneFocusSignal((n) => n + 1);
        return;
      }
      if (phoneDigits.length < 10) {
        // Ошибка формата ≠ результат проверки: показываем только формат.
        setPhoneError("incomplete");
        setPhoneFocusSignal((n) => n + 1);
        return;
      }

      setPhoneError(null);
      setPhoneChecking(true);
      track("phone_check_started", { ...base, method_id: OZON_METHOD_ID });

      later(() => {
        setPhoneChecking(false);
        if (phoneDigits === notClientDigits) {
          setPhoneError("not_client");
          setPhoneFocusSignal((n) => n + 1);
          track("phone_check_result", {
            ...base,
            method_id: OZON_METHOD_ID,
            result: "not_client",
          });
          return;
        }
        // Успех: кнопка → cta.loading и пуш ПОЯВЛЯЕТСЯ ОДНОВРЕМЕННО;
        // push_delay при активном gate равен нулю.
        track("phone_check_result", {
          ...base,
          method_id: OZON_METHOD_ID,
          result: "client",
        });
        setCtaState("loading");
        track("handoff_started", { ...base, method_id: OZON_METHOD_ID });
        setStage("push");
      }, phoneGate.check_ms);
      return;
    }

    // Прежнее поведение: gate выключен или выбран не «Ozon Банк».
    setCtaState("loading");
    track("handoff_started", { ...base, method_id: selected });
    later(() => {
      if (selected === OZON_METHOD_ID) {
        setStage("push");
      } else {
        setCtaState("default");
      }
    }, timings.push_delay_ms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ctaState,
    phoneChecking,
    phoneGateActive,
    phoneDigits,
    notClientDigits,
    phoneGate.check_ms,
    selected,
    timings.push_delay_ms,
    tenant.tenant_id,
    tenant.archetype,
  ]);

  // ── Шаг 2: пуш ─────────────────────────────────────────────────────
  const handlePushOpen = useCallback(() => {
    setStage("splash");
    track("handoff_shown", { ...base, method_id: OZON_METHOD_ID });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant.tenant_id, tenant.archetype]);

  /** Свайп вверх: пуш уходит, пользователь остаётся у подрядчика. */
  const handlePushDismiss = useCallback(() => {
    setStage("contractor");
    setCtaState("default");
    track("handoff_returned", { ...base, method_id: selected });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, tenant.tenant_id, tenant.archetype]);

  // ── Шаг 4: оплата в банке ──────────────────────────────────────────
  const handlePay = useCallback(() => {
    if (bankLoading) return;
    setBankLoading(true);
    track("bank_payment_started", { ...base, method_id: OZON_METHOD_ID });
    later(() => {
      setBankLoading(false);
      setStage("bank_success");
      track("bank_payment_succeeded", { ...base, method_id: OZON_METHOD_ID });
    }, timings.pay_loading_ms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankLoading, timings.pay_loading_ms, tenant.tenant_id, tenant.archetype]);

  /** Отмена по «×»: возврат к подрядчику БЕЗ оплаты, выбор сохранён. */
  const handleCancel = useCallback(() => {
    clearTimers();
    setBankLoading(false);
    setStage("contractor");
    setCtaState("default");
    track("bank_payment_cancelled", { ...base, method_id: OZON_METHOD_ID });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTimers, tenant.tenant_id, tenant.archetype]);

  // ── Шаг 5→6: возврат к подрядчику ──────────────────────────────────
  const handleReturn = useCallback(() => {
    setStage("paid");
    track("returned_to_contractor", { ...base, method_id: OZON_METHOD_ID });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant.tenant_id, tenant.archetype]);

  /** «Начать сначала»: сброс демо без перезагрузки страницы. */
  const handleRestart = useCallback(() => {
    clearTimers();
    setBankLoading(false);
    setCtaState("default");
    setSelected(tenant.payment_list.default_selected);
    // Проверка телефона сбрасывается полностью: цифры стираются.
    setPhoneDigits("");
    setPhoneError(null);
    setPhoneChecking(false);
    setStage("contractor");
    track("demo_restarted", { ...base, method_id: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    clearTimers,
    tenant.payment_list.default_selected,
    tenant.tenant_id,
    tenant.archetype,
  ]);

  const phoneGateSlot: PhoneGateSlot | null = phoneGate.enabled
    ? {
        expanded: selected === OZON_METHOD_ID,
        digits: phoneDigits,
        error: phoneError,
        checking: phoneChecking,
        onChange: handlePhoneChange,
        onSubmit: handleCta,
        focusSignal: phoneFocusSignal,
      }
    : null;

  const ctaLoadingLabel = phoneChecking
    ? COPY["cta.checking"]
    : tenant.cta.label_loading ?? COPY["cta.loading"];

  const screenProps = {
    tenant,
    selectedMethod: selected,
    onSelectMethod: handleSelect,
    ctaState: phoneChecking ? ("loading" as ButtonState) : ctaState,
    ctaLoadingLabel,
    onCta: handleCta,
    forcedState,
    phoneGate: phoneGateSlot,
  };

  const contractorScreen =
    tenant.archetype === "cart_checkout" ? (
      <CartCheckoutScreen {...screenProps} />
    ) : (
      <SubscriptionPaymentScreen {...screenProps} />
    );

  return (
    <PhoneFrame
      vars={theme.vars}
      tenantId={tenant.tenant_id}
      archetype={tenant.archetype}
      a11yMode={tenant.a11y_mode}
      stage={stage}
    >
      {/* Подложка пуша — неизменённый экран подрядчика. */}
      {(stage === "contractor" || stage === "push") && (
        <div
          className="h-full w-full"
          aria-hidden={stage === "push" ? "true" : undefined}
        >
          {contractorScreen}
        </div>
      )}

      {stage === "push" && (
        <PushBanner
          merchant={bankPayload.merchant}
          amount={bankPayload.amount}
          onOpen={handlePushOpen}
          onDismiss={handlePushDismiss}
        />
      )}

      {stage === "splash" && (
        <BankSplashScreen dotsCycleMs={timings.dots_cycle_ms} />
      )}

      {stage === "bank_payment" && (
        <BankPaymentScreen
          payload={bankPayload}
          loading={bankLoading}
          onPay={handlePay}
          onClose={handleCancel}
        />
      )}

      {stage === "bank_success" && (
        <BankSuccessScreen payload={bankPayload} onReturn={handleReturn} />
      )}

      {stage === "paid" && (
        <PaidConfirmationScreen
          tenant={tenant}
          payload={bankPayload}
          onRestart={handleRestart}
        />
      )}

      {handoff && (
        <HandoffOverlay
          onBack={() => {
            setHandoff(false);
            setCtaState("default");
          }}
        />
      )}
    </PhoneFrame>
  );
}
