import * as React from "react"

import { CookieBar } from "@/components/a3/cookie-bar"
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
import type { ContactFormStatus } from "@/components/a3/contact-form"
import { ShadcnThemeScope } from "@/components/shadcn/theme-scope"
import { Toaster } from "@/components/shadcn/sonner"

import {
  cookieBar,
  emptyContactValues,
  footer,
  hero,
  navigation,
  type ContactFormErrors,
  type ContactFormValues,
  type TariffsMode,
} from "./a3-finance.data"

/**
 * Информационная страница ООО РНКО «А3 Финанс».
 *
 * Вид презентационный: логика (согласие на cookie, отправка формы, копирование,
 * прокрутка) живёт в `A3FinanceRoute`. Причина ровно та же, что у пилотного
 * экрана студии: состояние, которое нельзя подать пропом, нельзя снять
 * эталоном детерминированно — а состояний здесь 34.
 *
 * Восемь блоков идут сплошным вертикальным потоком с якорями; отдельных
 * экранов у страницы нет.
 */
export interface A3FinanceViewProps {
  cookieVisible?: boolean
  formErrors?: ContactFormErrors
  formStatus?: ContactFormStatus
  formValues?: ContactFormValues
  headerScrolled?: boolean
  menuOpen?: boolean
  onCookieAccept?: () => void
  onCookieDecline?: () => void
  onCopyAll?: () => void
  onCopyRequisite?: (slug: string) => void
  onDownloadDocument?: (slug: string) => void
  onMenuOpenChange?: (open: boolean) => void
  onNavigate?: (href: string) => void
  onSubmit?: (values: ContactFormValues) => void
  tariffs?: TariffsMode
}

export function A3FinanceView({
  cookieVisible = false,
  formErrors,
  formStatus = "idle",
  formValues = emptyContactValues,
  headerScrolled = false,
  menuOpen = false,
  onCookieAccept = () => {},
  onCookieDecline = () => {},
  onCopyAll,
  onCopyRequisite,
  onDownloadDocument,
  onMenuOpenChange,
  onNavigate,
  onSubmit,
  tariffs = "hidden",
}: A3FinanceViewProps) {
  return (
    <ShadcnThemeScope className="min-h-dvh" theme="a3">
      <SiteHeader
        items={navigation}
        menuOpen={menuOpen}
        onMenuOpenChange={onMenuOpenChange}
        onNavigate={onNavigate}
        scrolled={headerScrolled}
      />

      {/*
       * Пока бар согласия виден, у контента нижний отступ на его высоту:
       * иначе фиксированная панель перекрывает футер, а на mobile — кнопку
       * отправки формы. Проверяется сценарием 4 мобильной приёмки.
       */}
      <main className={cookieVisible ? "pb-40 sm:pb-28" : undefined}>
        <HeroSection
          callout={hero.callout}
          cta={hero.cta}
          lead={hero.lead}
          onCtaClick={() => onNavigate?.("#contacts")}
          subtitle={hero.subtitle}
          title={hero.title}
        />
        <ActivitySection />
        <DisclosureSection onDownload={onDownloadDocument} />
        <RequisitesSection onCopy={onCopyRequisite} onCopyAll={onCopyAll} />
        <ContactsSection
          formErrors={formErrors}
          formStatus={formStatus}
          formValues={formValues}
          onSubmit={onSubmit}
        />
        <SupervisionSection />
      </main>

      <SiteFooter
        columns={footer.columns}
        copyright={footer.copyright}
        licence={footer.licence}
        name={footer.name}
        onNavigate={onNavigate}
        regulated={footer.regulated}
        tariffs={tariffs}
      />

      <CookieBar
        linkHref={cookieBar.link.href}
        linkText={cookieBar.link.text}
        onAccept={onCookieAccept}
        onDecline={onCookieDecline}
        text={cookieBar.text}
        visible={cookieVisible}
      />

      {/* Портал уходит на корень документа; тема зеркалится туда же. */}
      <Toaster position="bottom-right" />
    </ShadcnThemeScope>
  )
}
