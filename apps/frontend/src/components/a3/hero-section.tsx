import * as React from "react"

import { Button } from "@/components/shadcn/button"

import { Container } from "./layout"
import { NoticeRule } from "./notice-rule"

/**
 * Декоративная кривая первого экрана.
 *
 * ВНИМАНИЕ: это НЕ ассет образца. Исходник `41:3` (`bgd-main-desktop`,
 * 936×430 / 350×170) из Figma не выгружен, и в релиз страница без него идти не
 * может (`Asset Notes` → `blocked`). Здесь стоит воспроизведение в коде:
 * пунктирные дуги в брендовой гамме, обрезанные правым краем полотна. Оно
 * держит композицию и тон, но не является оригиналом.
 *
 * Декоративная — `aria-hidden`, из потока вынута, курсор не ловит.
 */
function HeroCurve() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute right-0 bottom-0 h-[170px] w-[350px] lg:h-[430px] lg:w-[936px]"
      fill="none"
      focusable="false"
      preserveAspectRatio="xMaxYMax slice"
      viewBox="0 0 936 430"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M-40 430C120 250 320 150 560 150c180 0 320 60 460 170"
        stroke="#003399"
        strokeDasharray="6 8"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <path
        d="M40 430C200 290 400 210 640 210c140 0 260 40 380 120"
        stroke="#003399"
        strokeDasharray="6 8"
        strokeOpacity="0.22"
        strokeWidth="1.5"
      />
      <path
        d="M140 430C300 340 470 290 690 290c110 0 200 20 290 70"
        stroke="#003399"
        strokeDasharray="6 8"
        strokeOpacity="0.14"
        strokeWidth="1.5"
      />
    </svg>
  )
}

/**
 * Первый экран.
 *
 * Асимметрия здесь — решение, а не недоделка: текст ограничен 820 (заголовок)
 * и 720 (лид) и стоит слева, правая половина остаётся пустой. Занимать её
 * контентом запрещено (`STYLE_GUIDE.md` → Асимметрия/воздух).
 *
 * `41:16` в макете — одна текстовая нода с разделителем U+2028. В разметке это
 * `h1` и отдельный абзац: склеенные обратно, они отдали бы подзаголовок в
 * заголовок для поисковика и скринридера.
 */
export function HeroSection({
  callout,
  cta,
  lead,
  onCtaClick,
  subtitle,
  title,
}: {
  callout: { label: string; value: string }
  cta: string
  lead: string
  onCtaClick?: () => void
  subtitle: string
  title: string
}) {
  return (
    <section
      aria-labelledby="a3-hero-title"
      /*
       * Высота первого экрана задана явно, а не набирается контентом.
       *
       * В образце низ первого экрана держит кривая: она стоит В ПОТОКЕ
       * (936×430 на desktop, 350×170 на mobile) и доводит фрейм до 820 и 780
       * соответственно. Здесь кривая — декоративный слой `position: absolute`,
       * на высоту секции не влияет, и без опоры первый экран проседал до 663 из
       * 820. Опора объявлена минимальной высотой: 747 + шапка 73 = 820 и
       * 719 + шапка 61 = 780 (шапка на 1 px выше образца — её граница, принятое
       * отклонение). Именно min-height, а не padding: контент длиннее просто
       * растянет секцию, а не сложится с добавленным воздухом.
       */
      className="a3-hero relative min-h-[719px] overflow-hidden pt-10 pb-6 md:pt-18 md:pb-8 lg:min-h-[747px] lg:pt-28 lg:pb-12"
      id="top"
    >
      <HeroCurve />
      <Container className="relative">
        {/*
         * Заголовок и подзаголовок набраны ОДНИМ кеглем — 48/60 на desktop и
         * 32/40 на mobile. В образце это одна текстовая нода, разделённая
         * U+2028: строка переносится, кегль не меняется. Отдельными элементами
         * они остаются ради семантики (склеенные, они отдали бы подзаголовок в
         * `h1` поисковику и скринридеру), но выглядеть обязаны единым блоком —
         * поэтому у абзаца ни своего кегля, ни верхнего отступа.
         */}
        <div className="max-w-[820px] text-[2rem]/[2.5rem] font-medium tracking-tight md:text-[2.5rem]/[3.125rem] lg:text-[3rem]/[3.75rem]">
          <h1 data-testid="a3-hero-title" id="a3-hero-title">
            {title}
          </h1>
          <p>{subtitle}</p>
        </div>

        <p className="text-muted-foreground mt-6 max-w-[720px] text-[1rem]/[1.625rem] lg:text-[1.125rem]/[1.75rem]">
          {lead}
        </p>

        <NoticeRule className="mt-8 max-w-[720px] px-4" label={callout.label}>
          <span className="font-mono text-[0.9375rem]/[1.5rem]">{callout.value}</span>
        </NoticeRule>

        <Button
          className="mt-8"
          data-testid="a3-hero-cta"
          onClick={onCtaClick}
          size="xl"
          type="button"
        >
          {cta}
        </Button>
      </Container>
    </section>
  )
}
