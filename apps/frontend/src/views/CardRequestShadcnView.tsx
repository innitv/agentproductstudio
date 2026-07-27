import * as React from "react"
import {
  CalendarClock,
  Check,
  CreditCard,
  FileDown,
  HelpCircle,
  MoreHorizontal,
  OctagonX,
  Plus,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
  Trash2,
  UserRound,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/shadcn/alert"
import { Badge } from "@/components/shadcn/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/shadcn/breadcrumb"
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { Checkbox } from "@/components/shadcn/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu"
import { Input } from "@/components/shadcn/input"
import { Label } from "@/components/shadcn/label"
import { RadioGroup, RadioGroupItem } from "@/components/shadcn/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select"
import { Separator } from "@/components/shadcn/separator"
import { Toaster } from "@/components/shadcn/sonner"
import { Switch } from "@/components/shadcn/switch"
import { ShadcnThemeScope, type ShadcnTheme } from "@/components/shadcn/theme-scope"
import { Textarea } from "@/components/shadcn/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/shadcn/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/shadcn/tooltip"

import {
  REASONING_MAX_LENGTH,
  formatRub,
  parseMonthlyLimit,
  type CardRequestCatalog,
  type CardRequestErrors,
  type CardRequestStatus,
  type CardRequestValues,
} from "./card-request.data"

/**
 * Экран «Заявка на выпуск корпоративной карты», собранный на shadcn/ui.
 *
 * ─── ЗАЧЕМ ЭТОТ ФАЙЛ СУЩЕСТВУЕТ ─────────────────────────────────────────────
 * Пилотный экран студии: на нём проверяется, что дизайн-система по умолчанию
 * (`CLAUDE.md` §6.1) закрывает реальную продуктовую форму, а не только набор
 * витринных состояний. Продуктовая логика, справочники, тексты и правила
 * валидации живут отдельно, в `card-request.data.ts`, — их берут и роут, и
 * истории Storybook, копии данных нет.
 *
 * ─── ПОДХОД К ВЁРСТКЕ ───────────────────────────────────────────────────────
 * Собственного CSS у экрана нет вовсе: раскладка живёт в утилитах Tailwind
 * прямо в разметке. Цена этого выбора — правка отступа делается в каждом месте
 * отдельно, а не один раз на все экземпляры.
 *
 * ─── ЧЕГО В shadcn НЕТ И ЧЕМ ЗАМЕНЕНО ───────────────────────────────────────
 * • Chip (выбираемая метка категории) -> `ToggleGroup type="multiple"`.
 *   Ближайший аналог, но без иконки-крестика и без состояния «выбран» как
 *   отдельного варианта окраски.
 * • SegmentedControl (тип карты) -> `ToggleGroup type="single"`. Компонент
 *   допускает ПУСТОЕ значение, которого в форме быть не должно; пустой выбор
 *   гасится обработчиком, а не типом.
 * • InputCard (поле со сбросом) -> `Input` + отдельная кнопка очистки.
 * • InlineNotification уровня warning -> `Alert` без такого варианта: в
 *   shadcn есть только `default` и `destructive`, предупреждение собрано
 *   вручную из `default` с иконкой и акцентной рамкой.
 * • Toast в доке -> `sonner`. Он рендерится в портале на body и в поток
 *   страницы не встроен, поэтому «тост над панелью действий» здесь
 *   воспроизводится позиционированием, а не композицией.
 */

export interface CardRequestShadcnNotice {
  subtitle?: string
  title: string
  tone: "error" | "success"
}

export interface CardRequestShadcnViewProps {
  catalog: CardRequestCatalog
  errors?: CardRequestErrors
  initialValues: CardRequestValues
  notice?: CardRequestShadcnNotice | null
  onNavigate?: (target: string) => void
  onSaveDraft?: (values: CardRequestValues) => void
  onSubmit?: (values: CardRequestValues) => void
  /** Открыть меню «ещё» на старте — нужно истории со снятым скриншотом меню. */
  openActionsMenu?: boolean
  status?: CardRequestStatus
  theme?: ShadcnTheme
}

export function CardRequestShadcnView({
  catalog,
  errors = {},
  initialValues,
  notice = null,
  onNavigate,
  onSaveDraft,
  onSubmit,
  openActionsMenu = false,
  status = "idle",
  theme = "default",
}: CardRequestShadcnViewProps) {
  const [values, setValues] = React.useState<CardRequestValues>(initialValues)

  React.useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  // Уведомление уходит в sonner, а не в разметку страницы: у shadcn это
  // единственный компонент уведомления поверх интерфейса. Бесконечная
  // длительность нужна детерминированному кадру — иначе таймер решал бы,
  // попал тост в скриншот или нет.
  React.useEffect(() => {
    toast.dismiss()
    if (!notice) return

    const show = notice.tone === "error" ? toast.error : toast.success
    show(notice.title, { description: notice.subtitle, id: "card-request-notice" })
  }, [notice])

  const patch = React.useCallback(
    <Key extends keyof CardRequestValues>(key: Key, value: CardRequestValues[Key]) => {
      setValues((previous) => ({ ...previous, [key]: value }))
    },
    [],
  )

  const limit = parseMonthlyLimit(values.monthlyLimit)
  const limitIsNumber = Number.isFinite(limit) && limit > 0
  const needsExtraApproval = limitIsNumber && limit > catalog.approvalThresholdRub
  const busy = status === "submitting"
  const errorCount = Object.keys(errors).length
  const selectedUnit = catalog.units.find((unit) => unit.value === values.unit)

  return (
    <ShadcnThemeScope className="min-h-dvh pb-28" theme={theme}>
      {/*
        Отступ снизу задан вручную и это вынужденная мера. sonner рендерится в
        портале с `position: fixed` и о существовании панели действий не знает —
        без смещения уведомление ложится поверх кнопок. Композицией это не
        решается: узел тоста живёт вне разметки экрана. Число (72px) — высота
        панели плюс зазор.
      */}
      <Toaster
        offset={{ bottom: 72 }}
        position="bottom-center"
        toastOptions={{ duration: Number.POSITIVE_INFINITY }}
        visibleToasts={1}
      />

      <header
        className="bg-card sticky top-0 z-20 flex min-h-14 items-center justify-between gap-4 border-b px-6"
        data-testid="card-request-shadcn-topbar"
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button onClick={() => onNavigate?.("cards")} type="button">
                  Карты
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button onClick={() => onNavigate?.("requests")} type="button">
                  Заявки
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Заявка {catalog.requestNumber}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2">
          <Button
            aria-label="Выгрузить в PDF"
            onClick={() => onNavigate?.("export")}
            size="sm"
            variant="ghost"
          >
            <FileDown />
            {/* На узком экране остаётся только иконка: подпись выталкивает меню. */}
            <span className="hidden sm:inline">Выгрузить в PDF</span>
          </Button>
          <DropdownMenu defaultOpen={openActionsMenu}>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Другие действия с заявкой"
                data-testid="card-request-shadcn-menu-trigger"
                size="icon-sm"
                variant="ghost"
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Действия с заявкой</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <CalendarClock />
                  История изменений
                  <DropdownMenuShortcut>12 мая</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserRound />
                  Передать другому автору
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2 />
                Удалить черновик
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-6 py-8">
        <div className="mb-6 max-w-[720px]">
          <p
            className="text-muted-foreground mb-2 text-xs font-medium tracking-[0.04em] uppercase"
            data-numeric
          >
            Заявка {catalog.requestNumber} · черновик
          </p>
          <h1
            className="mb-3 text-2xl font-semibold tracking-tight"
            data-testid="card-request-shadcn-title"
          >
            Выпуск корпоративной карты
          </h1>
          <p className="text-muted-foreground text-sm">
            Заполните данные сотрудника и правила расходов. После отправки заявку последовательно
            смотрят руководитель подразделения и финансовый контроль.
          </p>
        </div>

        {status === "error" ? (
          <Alert className="mb-4" data-testid="card-request-shadcn-error" variant="destructive">
            <OctagonX />
            <AlertTitle>Заявку не удалось отправить</AlertTitle>
            <AlertDescription>
              {errorCount > 0
                ? `Проверьте поля, отмеченные красным ниже. Всего с ошибками: ${errorCount}.`
                : "Сервис согласований не ответил. Повторите отправку через минуту."}
            </AlertDescription>
          </Alert>
        ) : null}

        {needsExtraApproval ? (
          // Варианта `warning` у Alert в shadcn нет: жёлтый уровень собран из
          // варианта `default` с акцентной левой границей и иконкой.
          <Alert
            className="border-l-chart-4 mb-4 border-l-4"
            data-testid="card-request-shadcn-approval-warning"
          >
            <TriangleAlert />
            <AlertTitle>Понадобится дополнительное согласование</AlertTitle>
            <AlertDescription>
              <span>
                Лимит выше {formatRub(catalog.approvalThresholdRub)}, поэтому к согласованию
                добавится финансовый директор. Срок вырастет примерно на два рабочих дня.
              </span>
              <Button className="px-0" size="sm" variant="link">
                Правила лимитов
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid min-w-0 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Сотрудник</CardTitle>
                <CardDescription>
                  Карта выпускается на человека, а не на подразделение.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="shadcn-employee-name">Фамилия, имя и отчество</Label>
                  <Input
                    aria-invalid={Boolean(errors.employeeName)}
                    autoComplete="off"
                    data-testid="card-request-shadcn-employee-name"
                    id="shadcn-employee-name"
                    onChange={(event) => patch("employeeName", event.target.value)}
                    placeholder="Как в паспорте"
                    value={values.employeeName}
                  />
                  {errors.employeeName ? (
                    <p className="text-destructive text-sm">{errors.employeeName}</p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="shadcn-employee-email">Рабочая почта</Label>
                  <Input
                    aria-invalid={Boolean(errors.employeeEmail)}
                    autoComplete="off"
                    id="shadcn-employee-email"
                    onChange={(event) => patch("employeeEmail", event.target.value)}
                    placeholder="name@a3.example"
                    type="email"
                    value={values.employeeEmail}
                  />
                  <p
                    className={
                      errors.employeeEmail ? "text-destructive text-sm" : "text-muted-foreground text-sm"
                    }
                  >
                    {errors.employeeEmail ?? "На неё придёт доступ в мобильное приложение"}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="shadcn-unit">Подразделение</Label>
                  <Select onValueChange={(value) => patch("unit", value)} value={values.unit}>
                    <SelectTrigger
                      aria-invalid={Boolean(errors.unit)}
                      className="w-full"
                      id="shadcn-unit"
                    >
                      <SelectValue placeholder="Выберите подразделение" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalog.units.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p
                    className={
                      errors.unit ? "text-destructive text-sm" : "text-muted-foreground text-sm"
                    }
                  >
                    {errors.unit ?? selectedUnit?.hint ?? " "}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Карта и лимит</CardTitle>
                <CardDescription>
                  Виртуальная карта активна сразу, пластиковую курьер привозит за три дня.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label id="shadcn-kind-label">Тип карты</Label>
                  <ToggleGroup
                    aria-labelledby="shadcn-kind-label"
                    className="w-fit"
                    // Пустое значение здесь недопустимо, но ToggleGroup его
                    // разрешает: гасим на уровне обработчика.
                    onValueChange={(value) =>
                      value ? patch("cardKind", value as CardRequestValues["cardKind"]) : undefined
                    }
                    type="single"
                    value={values.cardKind}
                    variant="outline"
                  >
                    <ToggleGroupItem value="virtual">
                      <Smartphone />
                      Виртуальная
                    </ToggleGroupItem>
                    <ToggleGroupItem value="plastic">
                      <CreditCard />
                      Пластиковая
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <fieldset className="grid gap-2">
                  <legend className="mb-2 text-sm font-medium">Что делаем</legend>
                  <RadioGroup
                    className="grid-flow-col justify-start gap-6"
                    onValueChange={(value) =>
                      patch("purpose", value as CardRequestValues["purpose"])
                    }
                    value={values.purpose}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="shadcn-purpose-new" value="new" />
                      <Label htmlFor="shadcn-purpose-new">Выпускаем новую карту</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        data-testid="card-request-shadcn-purpose-reissue"
                        id="shadcn-purpose-reissue"
                        value="reissue"
                      />
                      <Label htmlFor="shadcn-purpose-reissue">Перевыпускаем существующую</Label>
                    </div>
                  </RadioGroup>
                </fieldset>

                {values.purpose === "reissue" ? (
                  <div className="grid gap-2">
                    <Label htmlFor="shadcn-reissue">Карта, которую перевыпускаем</Label>
                    {/* Аналога InputCard (поле со встроенным сбросом) в shadcn нет. */}
                    <div className="flex gap-2">
                      <Input
                        aria-invalid={Boolean(errors.reissueCardNumber)}
                        data-numeric
                        data-testid="card-request-shadcn-reissue-number"
                        id="shadcn-reissue"
                        onChange={(event) => patch("reissueCardNumber", event.target.value)}
                        placeholder="0000 0000 0000 0000"
                        value={values.reissueCardNumber}
                      />
                      <Button
                        aria-label="Очистить номер карты"
                        onClick={() => patch("reissueCardNumber", "")}
                        size="icon"
                        variant="outline"
                      >
                        <X />
                      </Button>
                    </div>
                    <p
                      className={
                        errors.reissueCardNumber
                          ? "text-destructive text-sm"
                          : "text-muted-foreground text-sm"
                      }
                    >
                      {errors.reissueCardNumber ?? "Достаточно последних четырёх цифр"}
                    </p>
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="shadcn-currency">Валюта карты</Label>
                    <Select
                      onValueChange={(value) => patch("currency", value)}
                      value={values.currency}
                    >
                      <SelectTrigger className="w-full" id="shadcn-currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {catalog.currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground text-sm">
                      Списание идёт со счёта в этой валюте
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="shadcn-limit">Месячный лимит</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              aria-label="Подсказка про месячный лимит"
                              className="text-muted-foreground hover:text-foreground"
                              type="button"
                            >
                              <HelpCircle className="size-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Лимит обнуляется первого числа. Изменить его можно без перевыпуска
                            карты.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      aria-invalid={Boolean(errors.monthlyLimit)}
                      data-numeric
                      data-testid="card-request-shadcn-limit"
                      id="shadcn-limit"
                      inputMode="numeric"
                      onChange={(event) => patch("monthlyLimit", event.target.value)}
                      placeholder="80 000"
                      value={values.monthlyLimit}
                    />
                    <p
                      className={
                        errors.monthlyLimit
                          ? "text-destructive text-sm"
                          : "text-muted-foreground text-sm"
                      }
                    >
                      {errors.monthlyLimit ??
                        `Порог дополнительного согласования — ${formatRub(catalog.approvalThresholdRub)}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Разрешённые категории расходов</CardTitle>
                <CardDescription>
                  Оплата вне выбранных категорий будет отклонена на стороне банка.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {/* Chip в shadcn отсутствует; ближайший аналог — ToggleGroup. */}
                <ToggleGroup
                  className="flex-wrap justify-start"
                  data-testid="card-request-shadcn-categories"
                  onValueChange={(next: string[]) => patch("categories", next)}
                  spacing={2}
                  type="multiple"
                  value={values.categories}
                  variant="outline"
                >
                  {catalog.categories.map((category) => (
                    <ToggleGroupItem
                      data-testid={`card-request-shadcn-category-${category.value}`}
                      key={category.value}
                      value={category.value}
                    >
                      {values.categories.includes(category.value) ? <Check /> : null}
                      {category.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <div className="flex items-center justify-between gap-3">
                  <p
                    className="text-muted-foreground text-sm"
                    data-testid="card-request-shadcn-categories-summary"
                  >
                    {values.categories.length > 0
                      ? `Выбрано категорий: ${values.categories.length} из ${catalog.categories.length}`
                      : (errors.categories ??
                        "Категории не выбраны — карта не пройдёт согласование")}
                  </p>
                  <Button
                    disabled={values.categories.length === 0}
                    onClick={() => patch("categories", [])}
                    size="sm"
                    variant="ghost"
                  >
                    <X />
                    Снять все
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Обоснование</CardTitle>
                <CardDescription>
                  Его читает финансовый контроль. Опишите задачу, а не должность.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Label htmlFor="shadcn-reasoning">Зачем сотруднику корпоративная карта</Label>
                <Textarea
                  aria-invalid={Boolean(errors.reasoning)}
                  data-testid="card-request-shadcn-reasoning"
                  id="shadcn-reasoning"
                  maxLength={REASONING_MAX_LENGTH}
                  onChange={(event) => patch("reasoning", event.target.value)}
                  placeholder="Например: закрывает командировки по трём регионам, сейчас платит своими и ждёт возмещения"
                  rows={6}
                  value={values.reasoning}
                />
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={
                      errors.reasoning ? "text-destructive text-sm" : "text-muted-foreground text-sm"
                    }
                  >
                    {errors.reasoning ?? " "}
                  </p>
                  <p className="text-muted-foreground text-sm whitespace-nowrap" data-numeric>
                    {values.reasoning.length} / {REASONING_MAX_LENGTH}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="grid min-w-0 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Маршрут согласования</CardTitle>
                <CardDescription>
                  Согласующие идут по порядку. Отказ на любом шаге возвращает заявку автору.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <ol className="grid gap-3">
                  {catalog.reviewers.map((reviewer, index) => (
                    <li className="flex items-start gap-3" key={reviewer.id}>
                      <span
                        aria-hidden="true"
                        className={
                          reviewer.state === "passed"
                            ? "bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs"
                            : "bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs"
                        }
                        data-numeric
                      >
                        {reviewer.state === "passed" ? (
                          <ShieldCheck className="size-3.5" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span className="grid gap-0.5">
                        <span className="text-sm font-medium">{reviewer.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {reviewer.role}
                          {reviewer.state === "passed" ? " · уже пройдено" : ""}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
                <Separator />
                <Button className="justify-start" size="sm" variant="outline">
                  <Plus />
                  Добавить согласующего
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Правила и уведомления</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-start justify-between gap-3">
                  <Label className="leading-snug" htmlFor="shadcn-confirm">
                    Подтверждать каждую операцию в приложении
                  </Label>
                  <Switch
                    checked={values.requireConfirmation}
                    id="shadcn-confirm"
                    onCheckedChange={(checked) => patch("requireConfirmation", checked)}
                  />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <Label className="leading-snug" htmlFor="shadcn-notify">
                    Присылать сотруднику отчёт по расходам раз в неделю
                  </Label>
                  <Switch
                    checked={values.notifyEmployee}
                    id="shadcn-notify"
                    onCheckedChange={(checked) => patch("notifyEmployee", checked)}
                  />
                </div>
                <Separator />
                <div className="grid gap-2">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      aria-invalid={Boolean(errors.rulesAccepted)}
                      checked={values.rulesAccepted}
                      data-testid="card-request-shadcn-rules-accepted"
                      id="shadcn-rules"
                      onCheckedChange={(checked) => patch("rulesAccepted", checked === true)}
                    />
                    <Label className="leading-snug" htmlFor="shadcn-rules">
                      Я ознакомился с регламентом корпоративных карт и отвечаю за расходы по этой
                      карте
                    </Label>
                  </div>
                  {errors.rulesAccepted ? (
                    <p className="text-destructive text-sm" role="alert">
                      {errors.rulesAccepted}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <div
        className="bg-card fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)]"
        data-testid="card-request-shadcn-actionbar"
      >
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-6 py-3">
          <p className="text-muted-foreground text-sm" data-numeric>
            {limitIsNumber
              ? `Лимит ${formatRub(limit)} в месяц · согласующих: ${catalog.reviewers.length}`
              : `Лимит не указан · согласующих: ${catalog.reviewers.length}`}
          </p>
          {/*
            На узком экране кнопки обязаны переноситься и делить строку поровну:
            без этого «Отправить на согласование» уезжает за правый край
            (проверено съёмкой в профиле устройства на ширине 393px).
          */}
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:justify-end">
            {status === "success" ? <Badge variant="secondary">Отправлена</Badge> : null}
            <Button
              className="flex-1 sm:flex-none"
              data-testid="card-request-shadcn-draft"
              disabled={busy}
              onClick={() => onSaveDraft?.(values)}
              variant="outline"
            >
              Сохранить черновик
            </Button>
            <Button
              className="flex-1 sm:flex-none"
              data-testid="card-request-shadcn-submit"
              disabled={busy}
              onClick={() => onSubmit?.(values)}
            >
              {busy ? "Отправляем…" : "Отправить на согласование"}
            </Button>
          </div>
        </div>
      </div>
    </ShadcnThemeScope>
  )
}
