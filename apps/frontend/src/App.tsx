import * as React from "react";
import { A3FinanceRoute } from "./views/A3FinanceRoute";
import { CardRequestShadcnRoute } from "./views/CardRequestShadcnRoute";
import { StudioIndexView } from "./views/StudioIndexView";

/** Экраны, доступные по хешу. Разметка каждого живёт в своём файле в views/. */
type HashView = "a3Finance" | "cardRequestShadcn" | "index";

/** Хеши маршрутов. Всё остальное — якоря ВНУТРИ уже открытого экрана. */
const ROUTE_BY_HASH: Record<string, HashView> = {
  // Пилотный экран на штатной теме реестра. Три тематических хеша
  // (`-branded`, `-calm`, `-calm-typed`) удалены 2026-07-28 вместе с темами
  // эксперимента: верстак студии не держит постоянных тем, тема заводится под
  // конкретный проект и уезжает в его репозиторий.
  "#card-request-shadcn": "cardRequestShadcn",
  "#a3-finance": "a3Finance",
  "": "index",
  "#": "index",
};

/**
 * Разрешение маршрута по хешу.
 *
 * Ключевая деталь: страница А3 держит собственные якоря секций (`#requisites`,
 * `#contacts`, `#disclosure`), и они тоже пишутся в `location.hash`. Поэтому
 * НЕизвестный хеш не сбрасывает экран на указатель, а оставляет текущий —
 * иначе первый же переход по якорю выкидывал бы пользователя со страницы.
 */
function resolveView(previous: HashView): HashView {
  return ROUTE_BY_HASH[window.location.hash] ?? previous;
}

export function App() {
  const [view, setView] = React.useState<HashView>(() => resolveView("index"));

  React.useEffect(() => {
    const handleHashChange = () => setView((previous) => resolveView(previous));
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (view === "cardRequestShadcn") {
    return <CardRequestShadcnRoute />;
  }

  if (view === "a3Finance") {
    return <A3FinanceRoute />;
  }

  return <StudioIndexView />;
}
