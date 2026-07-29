import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, within } from "storybook/test"

import { HeroSection } from "@/components/a3/hero-section"
import {
  ActivitySection,
  ContactsSection,
  DisclosureSection,
  RequisitesSection,
  SupervisionSection,
} from "@/components/a3/sections"
import { SiteFooter } from "@/components/a3/site-footer"
import { SiteHeader } from "@/components/a3/site-header"
import { ShadcnThemeScope } from "@/components/shadcn/theme-scope"

import { A3FinanceView } from "./A3FinanceView"
import {
  emptyContactValues,
  footer,
  hero,
  navigation,
} from "./a3-finance.data"

/**
 * Витрина страницы А3.
 *
 * ─── ПОЧЕМУ СТРАНИЦА РАЗБИТА НА СЕКЦИОННЫЕ ИСТОРИИ ──────────────────────────
 * Тег `vr-page` снимает историю в вьюпорте 1280×2000. Страница desktop — 5714
 * px, mobile — 7572 px; целиком она в кадр не влезает, а `fullPage` даёт
 * заведомо ложный кадр: `position: fixed` (sticky-шапка, cookie-бар) Playwright
 * рисует на позиции текущего скролла, и фиксированный слой ложится поперёк
 * середины снимка.
 *
 * Поэтому регрессия ведётся по семи секционным историям (самая высокая —
 * «Реквизиты», 1476 px), а `FullPage` существует для ручного просмотра и
 * ИСКЛЮЧЕНА из скриншот-покрытия явной записью в `excludedStories`
 * (`tests/visual-regression/storybook-visual.spec.ts`) с причиной, а не молча.
 *
 * Фиксированные слои снимаются отдельными компонентными историями в штатном
 * кадре: `A3/SiteHeader/Scrolled`, `A3/CookieBar/Shown`.
 *
 * Все секции рендерят ТЕ ЖЕ компоненты, что и роут `#a3-finance` — расхождение
 * витрины и приложения здесь невозможно по построению.
 */
const meta = {
  component: A3FinanceView,
  parameters: { layout: "fullscreen" },
  title: "Pages/A3Finance",
} satisfies Meta<typeof A3FinanceView>

export default meta

type Story = StoryObj<typeof meta>

/** Полотно секционной истории: тема `a3` и фон страницы. */
function SectionCanvas({ children }: { children: React.ReactNode }) {
  return (
    <ShadcnThemeScope className="bg-background min-h-[200px]" theme="a3">
      {children}
    </ShadcnThemeScope>
  )
}

export const Hero: Story = {
  render: () => (
    <SectionCanvas>
      <SiteHeader items={navigation} onNavigate={fn()} />
      <HeroSection
        callout={hero.callout}
        cta={hero.cta}
        lead={hero.lead}
        onCtaClick={fn()}
        subtitle={hero.subtitle}
        title={hero.title}
      />
    </SectionCanvas>
  ),
  tags: ["vr-page"],
}

export const Activity: Story = {
  render: () => (
    <SectionCanvas>
      <ActivitySection />
    </SectionCanvas>
  ),
  tags: ["vr-page"],
}

export const Disclosure: Story = {
  render: () => (
    <SectionCanvas>
      <DisclosureSection onDownload={fn()} />
    </SectionCanvas>
  ),
  tags: ["vr-page"],
}

export const Requisites: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Шестнадцать строк — весь набор из образца, а не первые несколько.
    // Считаем именно кнопки строк: «Скопировать все реквизиты» стоит над
    // таблицей и по имени тоже начинается со «Скопировать».
    await expect(
      canvasElement.querySelectorAll('[data-testid^="a3-requisite-"][data-testid$="-copy"]'),
    ).toHaveLength(16)
    await expect(canvas.getByTestId("a3-requisite-inn-copy")).toHaveAccessibleName(
      "Скопировать ИНН",
    )
  },
  render: () => (
    <SectionCanvas>
      <RequisitesSection onCopy={fn()} onCopyAll={fn()} />
    </SectionCanvas>
  ),
  tags: ["vr-page"],
}

export const Contacts: Story = {
  render: () => (
    <SectionCanvas>
      <ContactsSection formValues={emptyContactValues} onSubmit={fn()} />
    </SectionCanvas>
  ),
  tags: ["vr-page"],
}

export const Supervision: Story = {
  render: () => (
    <SectionCanvas>
      <SupervisionSection />
    </SectionCanvas>
  ),
  tags: ["vr-page"],
}

export const Footer: Story = {
  render: () => (
    <SectionCanvas>
      <SiteFooter
        columns={footer.columns}
        copyright={footer.copyright}
        licence={footer.licence}
        name={footer.name}
        onNavigate={fn()}
        regulated={footer.regulated}
        tariffs="hidden"
      />
    </SectionCanvas>
  ),
  tags: ["vr-page"],
}

/**
 * Страница целиком — для ручного просмотра и сверки с роутом.
 *
 * БЕЗ тега `vr-page` и с записью в `excludedStories`: 5714 px не помещаются в
 * кадр, а `fullPage` нарисовал бы фиксированные слои поперёк середины снимка.
 * Регрессию по этим блокам ведут семь секционных историй выше.
 */
export const FullPage: Story = {
  args: {
    cookieVisible: true,
    formValues: emptyContactValues,
    onCookieAccept: fn(),
    onCookieDecline: fn(),
    onCopyAll: fn(),
    onCopyRequisite: fn(),
    onNavigate: fn(),
    onSubmit: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Ровно один h1 на странице: подзаголовок вынесен отдельным абзацем.
    await expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1)
    // Шесть содержательных блоков — шесть h2.
    await expect(canvas.getAllByRole("heading", { level: 2 })).toHaveLength(5)
  },
}
