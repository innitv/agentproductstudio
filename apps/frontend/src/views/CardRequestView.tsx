import * as React from "react";
import {
  CalendarClock,
  Check,
  CreditCard,
  FileDown,
  HelpCircle,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip, ChipDismissIcon } from "@/components/ui/chip";
import { Dropdown, DropdownDivider, DropdownGroupTitle, DropdownItem } from "@/components/ui/dropdown";
import { FunctionButton } from "@/components/ui/function-button";
import { IconButton } from "@/components/ui/icon-button";
import { InlineNotification } from "@/components/ui/inline-notification";
import { Input } from "@/components/ui/input";
import { InputCard } from "@/components/ui/input-card";
import { Radio } from "@/components/ui/radio";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Toast, type ToastColorScheme } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";

import {
  REASONING_MAX_LENGTH,
  formatRub,
  parseMonthlyLimit,
  type CardRequestCatalog,
  type CardRequestErrors,
  type CardRequestStatus,
  type CardRequestValues,
} from "./card-request.data";

/**
 * Экран «Заявка на выпуск корпоративной карты» — внутренняя финансовая
 * консоль A3.
 *
 * ─── ЧТО ЭТО ЗА ФАЙЛ ────────────────────────────────────────────────────────
 * Единственная реализация экрана. Её рендерят ДВА потребителя:
 *   • `CardRequestView.stories.tsx` — как composition story (витрина состояний);
 *   • `CardRequestRoute.tsx` — как роут приложения (`#card-request`).
 * Второй копии вёрстки не существует: расхождение витрины и приложения
 * технически невозможно, потому что расходиться нечему.
 *
 * ─── ГРАНИЦА ОТВЕТСТВЕННОСТИ ────────────────────────────────────────────────
 * Компонент презентационный: он держит только состояние полей формы (это
 * состояние интерфейса, а не данные) и НЕ знает про сеть, роутинг и таймеры.
 * Всё, что зависит от среды, приходит пропсами:
 *   `catalog`  — справочники (в проде из API, в истории — фикстура);
 *   `status`   — стадия отправки; история подаёт её напрямую, поэтому
 *                состояния `submitting`/`success`/`error` снимаются скриншотом
 *                без интерактивного сценария и не мигают в регрессии;
 *   `errors`   — результат валидации; считает вызывающая сторона одной и той
 *                же функцией `validateCardRequest`;
 *   `notice`   — всплывающее уведомление (Toast) поверх панели действий.
 */

export interface CardRequestNotice {
  colorScheme: ToastColorScheme;
  subtitle?: string;
  title: string;
}

export interface CardRequestViewProps {
  catalog: CardRequestCatalog;
  /** Ошибки валидации по полям. Пустой объект — форма чистая. */
  errors?: CardRequestErrors;
  /** Стартовые значения полей. Смена ссылки перезапускает форму. */
  initialValues: CardRequestValues;
  notice?: CardRequestNotice | null;
  onDismissNotice?: () => void;
  /** Переход по хлебным крошкам; в истории — заглушка. */
  onNavigate?: (target: string) => void;
  onSaveDraft?: (values: CardRequestValues) => void;
  onSubmit?: (values: CardRequestValues) => void;
  /** Открыть меню «ещё» на старте — нужно истории со снятым скриншотом меню. */
  openActionsMenu?: boolean;
  status?: CardRequestStatus;
}

const cardKindOptions = [
  { icon: <Smartphone aria-hidden="true" />, label: "Виртуальная", value: "virtual" },
  { icon: <CreditCard aria-hidden="true" />, label: "Пластиковая", value: "plastic" },
];

export function CardRequestView({
  catalog,
  errors = {},
  initialValues,
  notice = null,
  onDismissNotice,
  onNavigate,
  onSaveDraft,
  onSubmit,
  openActionsMenu = false,
  status = "idle",
}: CardRequestViewProps) {
  const [values, setValues] = React.useState<CardRequestValues>(initialValues);
  const [menuOpen, setMenuOpen] = React.useState(openActionsMenu);

  // Смена ссылки на стартовые значения = другая заявка, форма перезапускается.
  React.useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const patch = React.useCallback(<Key extends keyof CardRequestValues>(key: Key, value: CardRequestValues[Key]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
  }, []);

  const toggleCategory = React.useCallback((id: string) => {
    setValues((previous) => ({
      ...previous,
      categories: previous.categories.includes(id)
        ? previous.categories.filter((item) => item !== id)
        : [...previous.categories, id],
    }));
  }, []);

  const limit = parseMonthlyLimit(values.monthlyLimit);
  const limitIsNumber = Number.isFinite(limit) && limit > 0;
  const needsExtraApproval = limitIsNumber && limit > catalog.approvalThresholdRub;
  const busy = status === "submitting";
  const errorCount = Object.keys(errors).length;
  const selectedUnit = catalog.units.find((unit) => unit.value === values.unit);

  return (
    <div className="a3-card-request">
      <header className="a3-card-request__topbar" data-testid="card-request-topbar">
        <Breadcrumbs
          aria-label="Путь до заявки"
          // Без `href`: крошки рендерятся кнопками. Ссылка с `#` перебила бы
          // хеш-роутинг приложения и увела бы пользователя с этого экрана.
          items={[
            { label: "Карты", onClick: () => onNavigate?.("cards") },
            { label: "Заявки", onClick: () => onNavigate?.("requests") },
            { current: true, label: `Заявка ${catalog.requestNumber}` },
          ]}
        />
        <div className="a3-card-request__topbar-actions">
          <FunctionButton
            icon={<FileDown aria-hidden="true" />}
            onClick={() => onNavigate?.("export")}
            variant="tertiary"
          >
            Выгрузить в PDF
          </FunctionButton>
          <div className="a3-card-request__menu-anchor">
            <IconButton
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="Другие действия с заявкой"
              data-testid="card-request-menu-trigger"
              icon={<MoreHorizontal aria-hidden="true" />}
              onClick={() => setMenuOpen((open) => !open)}
              size="m"
              variant="ghost"
            />
            {menuOpen ? (
              <Dropdown className="a3-card-request__menu" data-testid="card-request-menu">
                <DropdownGroupTitle>Действия с заявкой</DropdownGroupTitle>
                <DropdownItem icon={<CalendarClock aria-hidden="true" />} hint="Последний раз: 12 мая, 14:20">
                  История изменений
                </DropdownItem>
                <DropdownItem icon={<UserRound aria-hidden="true" />}>Передать другому автору</DropdownItem>
                <DropdownDivider />
                <DropdownItem icon={<Trash2 aria-hidden="true" />}>Удалить черновик</DropdownItem>
              </Dropdown>
            ) : null}
          </div>
        </div>
      </header>

      <main className="a3-card-request__main">
        <div className="a3-card-request__intro">
          <p className="a3-card-request__eyebrow">Заявка {catalog.requestNumber} · черновик</p>
          <h1 className="a3-card-request__title" data-testid="card-request-title">
            Выпуск корпоративной карты
          </h1>
          <p className="a3-card-request__lede">
            Заполните данные сотрудника и правила расходов. После отправки заявку последовательно
            смотрят руководитель подразделения и финансовый контроль.
          </p>
        </div>

        {status === "error" ? (
          <InlineNotification
            className="a3-card-request__notification"
            closeButton={false}
            colorScheme="error"
            data-testid="card-request-error"
            subtitle={
              errorCount > 0
                ? `Проверьте поля, отмеченные красным ниже. Всего с ошибками: ${errorCount}.`
                : "Сервис согласований не ответил. Повторите отправку через минуту."
            }
            title="Заявку не удалось отправить"
          />
        ) : null}

        {needsExtraApproval ? (
          <InlineNotification
            actions={[{ label: "Правила лимитов", variant: "tertiary" }]}
            className="a3-card-request__notification"
            closeButton={false}
            colorScheme="warning"
            data-testid="card-request-approval-warning"
            subtitle={`Лимит выше ${formatRub(catalog.approvalThresholdRub)}, поэтому к согласованию добавится финансовый директор. Срок вырастет примерно на два рабочих дня.`}
            title="Понадобится дополнительное согласование"
          />
        ) : null}

        <div className="a3-card-request__columns">
          <div className="a3-card-request__column">
            <section aria-labelledby="card-request-employee" className="a3-card-request__card">
              <div className="a3-card-request__card-header">
                <h2 className="a3-card-request__card-title" id="card-request-employee">
                  Сотрудник
                </h2>
                <p className="a3-card-request__card-hint">
                  Карта выпускается на человека, а не на подразделение.
                </p>
              </div>
              <div className="a3-card-request__fields">
                <Input
                  autoComplete="off"
                  data-testid="card-request-employee-name"
                  hint={errors.employeeName}
                  invalid={Boolean(errors.employeeName)}
                  label="Фамилия, имя и отчество"
                  onChange={(event) => patch("employeeName", event.target.value)}
                  placeholder="Как в паспорте"
                  value={values.employeeName}
                />
                <Input
                  autoComplete="off"
                  data-testid="card-request-employee-email"
                  hint={errors.employeeEmail ?? "На неё придёт доступ в мобильное приложение"}
                  invalid={Boolean(errors.employeeEmail)}
                  label="Рабочая почта"
                  onChange={(event) => patch("employeeEmail", event.target.value)}
                  placeholder="name@a3.example"
                  type="email"
                  value={values.employeeEmail}
                />
                <Select
                  hint={errors.unit ?? selectedUnit?.hint}
                  invalid={Boolean(errors.unit)}
                  label="Подразделение"
                  onValueChange={(value) => patch("unit", value)}
                  options={catalog.units}
                  placeholder="Выберите подразделение"
                  value={values.unit}
                />
              </div>
            </section>

            <section aria-labelledby="card-request-card" className="a3-card-request__card">
              <div className="a3-card-request__card-header">
                <h2 className="a3-card-request__card-title" id="card-request-card">
                  Карта и лимит
                </h2>
                <p className="a3-card-request__card-hint">
                  Виртуальная карта активна сразу, пластиковую курьер привозит за три дня.
                </p>
              </div>

              <div className="a3-card-request__control-row">
                <span className="a3-card-request__control-label" id="card-request-kind-label">
                  Тип карты
                </span>
                <SegmentedControl
                  aria-labelledby="card-request-kind-label"
                  onValueChange={(value) => patch("cardKind", value as CardRequestValues["cardKind"])}
                  options={cardKindOptions}
                  value={values.cardKind}
                />
              </div>

              <fieldset className="a3-card-request__fieldset">
                <legend className="a3-card-request__control-label">Что делаем</legend>
                <div className="a3-card-request__radio-row">
                  <Radio
                    checked={values.purpose === "new"}
                    label="Выпускаем новую карту"
                    name="card-request-purpose"
                    onChange={() => patch("purpose", "new")}
                    value="new"
                  />
                  <Radio
                    checked={values.purpose === "reissue"}
                    data-testid="card-request-purpose-reissue"
                    label="Перевыпускаем существующую"
                    name="card-request-purpose"
                    onChange={() => patch("purpose", "reissue")}
                    value="reissue"
                  />
                </div>
              </fieldset>

              {values.purpose === "reissue" ? (
                <InputCard
                  data-testid="card-request-reissue-number"
                  hint={errors.reissueCardNumber ?? "Достаточно последних четырёх цифр"}
                  invalid={Boolean(errors.reissueCardNumber)}
                  label="Карта, которую перевыпускаем"
                  onChange={(event) => patch("reissueCardNumber", event.target.value)}
                  onClear={() => patch("reissueCardNumber", "")}
                  placeholder="0000 0000 0000 0000"
                  value={values.reissueCardNumber}
                />
              ) : null}

              <div className="a3-card-request__fields">
                <Select
                  hint="Списание идёт со счёта в этой валюте"
                  label="Валюта карты"
                  onValueChange={(value) => patch("currency", value)}
                  options={catalog.currencies}
                  value={values.currency}
                />
                <Input
                  data-testid="card-request-limit"
                  hint={
                    errors.monthlyLimit ??
                    `Порог дополнительного согласования — ${formatRub(catalog.approvalThresholdRub)}`
                  }
                  inputMode="numeric"
                  invalid={Boolean(errors.monthlyLimit)}
                  label={
                    <span className="a3-card-request__label-with-hint">
                      Месячный лимит
                      <Tooltip
                        placement="top-center"
                        subtitle="Лимит обнуляется первого числа. Изменить его можно без перевыпуска карты."
                        title="Как считается лимит"
                      >
                        <span
                          aria-label="Подсказка про месячный лимит"
                          className="a3-card-request__hint-icon"
                          role="img"
                          tabIndex={0}
                        >
                          <HelpCircle aria-hidden="true" />
                        </span>
                      </Tooltip>
                    </span>
                  }
                  onChange={(event) => patch("monthlyLimit", event.target.value)}
                  placeholder="80 000"
                  value={values.monthlyLimit}
                />
              </div>
            </section>

            <section aria-labelledby="card-request-categories" className="a3-card-request__card">
              <div className="a3-card-request__card-header">
                <h2 className="a3-card-request__card-title" id="card-request-categories">
                  Разрешённые категории расходов
                </h2>
                <p className="a3-card-request__card-hint">
                  Оплата вне выбранных категорий будет отклонена на стороне банка.
                </p>
              </div>
              <div className="a3-card-request__chips" data-testid="card-request-categories">
                {catalog.categories.map((category) => {
                  const selected = values.categories.includes(category.value);

                  return (
                    <Chip
                      actionIcon={selected ? <ChipDismissIcon aria-hidden="true" /> : undefined}
                      data-testid={`card-request-category-${category.value}`}
                      icon={selected ? <Check aria-hidden="true" /> : undefined}
                      key={category.value}
                      onClick={() => toggleCategory(category.value)}
                      selected={selected}
                      variant={selected ? "primary" : "secondary"}
                    >
                      {category.label}
                    </Chip>
                  );
                })}
              </div>
              <div className="a3-card-request__chips-footer">
                <p className="a3-card-request__card-hint" data-testid="card-request-categories-summary">
                  {values.categories.length > 0
                    ? `Выбрано категорий: ${values.categories.length} из ${catalog.categories.length}`
                    : (errors.categories ?? "Категории не выбраны — карта не пройдёт согласование")}
                </p>
                <FunctionButton
                  disabled={values.categories.length === 0}
                  icon={<X aria-hidden="true" />}
                  onClick={() => patch("categories", [])}
                  variant="tertiary"
                >
                  Снять все
                </FunctionButton>
              </div>
            </section>

            <section aria-labelledby="card-request-reasoning" className="a3-card-request__card">
              <div className="a3-card-request__card-header">
                <h2 className="a3-card-request__card-title" id="card-request-reasoning">
                  Обоснование
                </h2>
                <p className="a3-card-request__card-hint">
                  Его читает финансовый контроль. Опишите задачу, а не должность.
                </p>
              </div>
              <Textarea
                counter={`${values.reasoning.length} / ${REASONING_MAX_LENGTH}`}
                data-testid="card-request-reasoning"
                hint={errors.reasoning}
                invalid={Boolean(errors.reasoning)}
                label="Зачем сотруднику корпоративная карта"
                maxLength={REASONING_MAX_LENGTH}
                onChange={(event) => patch("reasoning", event.target.value)}
                placeholder="Например: закрывает командировки по трём регионам, сейчас платит своими и ждёт возмещения"
                // Шесть строк, а не четыре: обоснование в 400 символов должно
                // читаться целиком, иначе поле показывает обрезанную строку.
                rows={6}
                value={values.reasoning}
              />
            </section>
          </div>

          <aside className="a3-card-request__column a3-card-request__column--side">
            <section aria-labelledby="card-request-reviewers" className="a3-card-request__card">
              <div className="a3-card-request__card-header">
                <h2 className="a3-card-request__card-title" id="card-request-reviewers">
                  Маршрут согласования
                </h2>
                <p className="a3-card-request__card-hint">
                  Согласующие идут по порядку. Отказ на любом шаге возвращает заявку автору.
                </p>
              </div>
              <ol className="a3-card-request__reviewers">
                {catalog.reviewers.map((reviewer, index) => (
                  <li className="a3-card-request__reviewer" key={reviewer.id}>
                    <span
                      aria-hidden="true"
                      className="a3-card-request__reviewer-step"
                      data-state={reviewer.state}
                    >
                      {reviewer.state === "passed" ? <ShieldCheck /> : index + 1}
                    </span>
                    <span className="a3-card-request__reviewer-text">
                      <span className="a3-card-request__reviewer-name">{reviewer.name}</span>
                      <span className="a3-card-request__reviewer-role">
                        {reviewer.role}
                        {reviewer.state === "passed" ? " · уже пройдено" : ""}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
              <FunctionButton icon={<Plus aria-hidden="true" />} variant="secondary">
                Добавить согласующего
              </FunctionButton>
            </section>

            <section aria-labelledby="card-request-rules" className="a3-card-request__card">
              <div className="a3-card-request__card-header">
                <h2 className="a3-card-request__card-title" id="card-request-rules">
                  Правила и уведомления
                </h2>
              </div>
              <div className="a3-card-request__switches">
                <Switch
                  checked={values.requireConfirmation}
                  label="Подтверждать каждую операцию в приложении"
                  onChange={(event) => patch("requireConfirmation", event.target.checked)}
                />
                <Switch
                  checked={values.notifyEmployee}
                  label="Присылать сотруднику отчёт по расходам раз в неделю"
                  onChange={(event) => patch("notifyEmployee", event.target.checked)}
                />
              </div>
              <div className="a3-card-request__consents">
                <Checkbox
                  checked={values.rulesAccepted}
                  data-testid="card-request-rules-accepted"
                  label="Я ознакомился с регламентом корпоративных карт и отвечаю за расходы по этой карте"
                  onChange={(event) => patch("rulesAccepted", event.target.checked)}
                />
                {errors.rulesAccepted ? (
                  <p className="a3-card-request__field-error" role="alert">
                    {errors.rulesAccepted}
                  </p>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/*
        Док — единственный фиксированный слой экрана. Toast лежит НАД панелью
        действий внутри того же дока, поэтому его появление не двигает панель:
        док прижат к низу и растёт вверх. Это же свойство проверяет мобильная
        приёмка (сценарий «появление оверлея»).
      */}
      <div className="a3-card-request__dock">
        {notice ? (
          <Toast
            className="a3-card-request__toast"
            colorScheme={notice.colorScheme}
            data-testid="card-request-toast"
            onClose={onDismissNotice}
            subtitle={notice.subtitle}
            title={notice.title}
          />
        ) : null}
        <div className="a3-card-request__actionbar" data-testid="card-request-actionbar">
          <p className="a3-card-request__summary">
            {limitIsNumber
              ? `Лимит ${formatRub(limit)} в месяц · согласующих: ${catalog.reviewers.length}`
              : `Лимит не указан · согласующих: ${catalog.reviewers.length}`}
          </p>
          <div className="a3-card-request__actions">
            <Button
              data-testid="card-request-draft"
              disabled={busy}
              onClick={() => onSaveDraft?.(values)}
              size="l"
              variant="secondary"
            >
              Сохранить черновик
            </Button>
            <Button
              data-testid="card-request-submit"
              disabled={busy}
              onClick={() => onSubmit?.(values)}
              size="l"
              variant="primary"
            >
              {busy ? "Отправляем…" : "Отправить на согласование"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
