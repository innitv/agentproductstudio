# Образ для визуальной регрессии Storybook.
#
# Базовый образ пиннут по версии Playwright: имя файла снапшота содержит
# платформу, и рендеринг расходится даже между двумя машинами с одной ОС
# (см. microsoft/playwright#20097). Поэтому baseline и прогон обязаны идти
# в одном и том же образе, а версия образа обязана совпадать с версией
# `@playwright/test` из `package.json` — иначе Playwright не найдёт браузеры.
#
# Тег подставляется скриптом `tooling/scripts/run-visual-regression.mjs`
# из devDependencies, вручную его править не нужно.
ARG PLAYWRIGHT_VERSION=1.60.0
FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble

# ARG объявлен до FROM, поэтому после FROM его надо объявить повторно.
ARG PLAYWRIGHT_VERSION

# node_modules контейнера кладём ровно в ту точку, куда монтируется репозиторий.
# При `docker run -v <repo>:/work -v /work/node_modules` анонимный том
# наполняется содержимым образа и перекрывает Windows-сборку node_modules
# хоста (в ней нативные бинарники под win32, в Linux они нерабочие).
WORKDIR /work

# Ставим только раннер: конфиг и спека визуальной регрессии больше ничего
# не импортируют, а TypeScript Playwright транспилирует сам.
RUN npm init --yes > /dev/null \
  && npm install --no-audit --no-fund --save-exact "@playwright/test@${PLAYWRIGHT_VERSION}"

# Фиксируем ожидаемую версию: скрипт-обёртка сверяет её с package.json репозитория.
ENV VR_EXPECTED_PLAYWRIGHT_VERSION=${PLAYWRIGHT_VERSION}
