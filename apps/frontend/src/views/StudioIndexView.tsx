import * as React from "react"

import { Badge } from "@/components/shadcn/badge"
import { Button } from "@/components/shadcn/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card"
import { ShadcnThemeScope, type ShadcnTheme } from "@/components/shadcn/theme-scope"

/**
 * Корневой экран приложения — указатель живых маршрутов.
 *
 * ─── ПОЧЕМУ УКАЗАТЕЛЬ, А НЕ РЕДИРЕКТ НА ПИЛОТНЫЙ ЭКРАН ──────────────────────
 * После удаления демо приложение — это оболочка студии с одним пилотным
 * экраном в четырёх темах, а не продукт с главной страницей. Редирект с `/`
 * на `#card-request-shadcn` сделал бы три вещи, каждая из которых хуже
 * указателя:
 *   1) скрыл бы остальные три темы — их пришлось бы знать наизусть, потому что
 *      ссылок на них не осталось бы нигде, кроме исходников роутера;
 *   2) сломал бы кнопку «назад»: возврат на `/` немедленно снова уводил бы на
 *      экран заявки, и выйти из него штатной навигацией стало бы нельзя;
 *   3) оставил бы `yarn qa:studio` без корневого маршрута, который можно
 *      проверить, — а именно на нём ловится «приложение не поднялось».
 *
 * Экран собран из компонентов реестра (`Card`, `Button`, `Badge`) и живёт под
 * контейнером темы: собственного CSS у него нет намеренно, иначе указатель стал
 * бы вторым источником визуальных решений.
 */

/** Маршрут, показанный на указателе. `hash` пустой означает сам корень. */
interface StudioRoute {
  description: string
  hash: string
  /** Подпись темы; у нетематических маршрутов отсутствует. */
  theme?: string
  title: string
}

/**
 * Живые маршруты приложения.
 *
 * Список ведётся руками рядом с роутером в `App.tsx` — программно вывести его
 * не из чего: разбор хешей это условия в коде, а не таблица. Расхождение видно
 * сразу, потому что мёртвая ссылка на указателе открывает пустой экран.
 */
const ROUTES: StudioRoute[] = [
  {
    description:
      "Пилотный экран «Заявка на выпуск корпоративной карты» на штатной теме реестра.",
    hash: "#card-request-shadcn",
    theme: "default",
    title: "Заявка на карту",
  },
  {
    description:
      "Тот же экран в брендовой теме: свой цвет, своя геометрия, свои радиусы.",
    hash: "#card-request-shadcn-branded",
    theme: "branded",
    title: "Заявка на карту · branded",
  },
  {
    description:
      "Контрольная точка эксперимента: цвет брендовой темы при штатной геометрии.",
    hash: "#card-request-shadcn-calm",
    theme: "calm",
    title: "Заявка на карту · calm",
  },
  {
    description:
      "То же, что calm, плюс реально подгруженные гарнитуры Inter Tight и JetBrains Mono.",
    hash: "#card-request-shadcn-calm-typed",
    theme: "calm-typed",
    title: "Заявка на карту · calm-typed",
  },
]

export function StudioIndexView({ theme = "default" }: { theme?: ShadcnTheme }) {
  return (
    <ShadcnThemeScope className="min-h-dvh" theme={theme}>
      <main className="mx-auto max-w-[880px] px-6 py-12">
        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-[0.04em] uppercase">
          Оболочка студии
        </p>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight">Маршруты приложения</h1>
        <p className="text-muted-foreground mb-8 max-w-[640px]">
          Здесь живут только экраны, собранные на компонентах реестра shadcn/ui. Каталог
          компонентов и их состояний — в Storybook (<code>yarn storybook</code>), он же служит
          источником для скриншот-регрессии.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {ROUTES.map((route) => (
            <Card key={route.hash}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span>{route.title}</span>
                  {route.theme ? <Badge variant="secondary">{route.theme}</Badge> : null}
                </CardTitle>
                <CardDescription>{route.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <a data-testid={`studio-route-${route.hash.slice(1)}`} href={route.hash}>
                    Открыть
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </ShadcnThemeScope>
  )
}
